const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ProgressSnapshot = require('../models/ProgressSnapshot');
const Roadmap = require('../models/Roadmap');
const InterviewSession = require('../models/InterviewSession');
const ai = require('../services/aiClient');
const { matchOne, matchMany, eligible } = require('../services/matching');
const { snapshot } = require('../services/progress');
const h = require('../utils/asyncHandler');

const getProfile = async (uid) => StudentProfile.findOne({ userId: uid });

exports.getProfile = h(async (req, res) => {
  const p = await getProfile(req.user._id);
  res.json({ profile: p, user: { name: req.user.name, email: req.user.email } });
});

exports.updateProfile = h(async (req, res) => {
  const allowed = ['rollNo', 'phone', 'branch', 'graduationYear', 'cgpa', 'skills', 'targetRoles'];
  const update = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  if (update.skills) {   // normalise aliases ("reactjs" -> "React") through the AI service ontology
    const { skills } = await ai.skills().catch(() => ({ skills: [] }));
    const canon = new Map(skills.map(s => [s.name.toLowerCase(), s.name]));
    update.skills = [...new Set(update.skills.map(s => canon.get(String(s).trim().toLowerCase()) || String(s).trim()).filter(Boolean))];
  }
  const p = await StudentProfile.findOneAndUpdate({ userId: req.user._id }, update, { new: true, runValidators: true });
  await snapshot(req.user._id, 'profile');
  res.json({ profile: p });
});

exports.uploadResume = h(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Attach a resume file (field name: resume)' });
  const parsed = await ai.parseResume(req.file.buffer, req.file.originalname);
  const p = await getProfile(req.user._id);
  // Merge: keep manually-added skills, add newly detected ones.
  p.skills = [...new Set([...(p.skills || []), ...parsed.skills])];
  if (parsed.cgpa && !p.cgpa) p.cgpa = parsed.cgpa;
  if (parsed.phone && !p.phone) p.phone = parsed.phone;
  p.resume = {
    fileName: req.file.originalname, uploadedAt: new Date(),
    text: parsed.rawText, projectsText: parsed.projectsText, hasGithub: parsed.hasGithub,
    quality: { score: parsed.quality.score, suggestions: parsed.quality.suggestions },
    skillEvidence: parsed.skillEvidence || {},
  };
  await p.save();
  await snapshot(req.user._id, 'resume_upload');
  res.json({
    profile: p,
    analysis: {
      detectedSkills: parsed.skills, declaredSkills: parsed.declaredSkills, projectSkills: parsed.projectSkills,
      quality: parsed.quality, wordCount: parsed.wordCount, hasGithub: parsed.hasGithub,
      sections: Object.keys(parsed.sections),
    },
  });
});

// Role + job recommendations
exports.recommendations = h(async (req, res) => {
  const p = await getProfile(req.user._id);
  if (!p.skills.length) return res.json({ roles: [], jobs: [], hint: 'Upload a resume or add skills first.' });
  const roles = await ai.recommendRoles({ studentSkills: p.skills, hasGithub: !!p.resume?.hasGithub, topN: 6 });
  const jobs = await Job.find({ status: 'open', $or: [{ deadline: null }, { deadline: { $gte: new Date() } }] }).populate('companyId', 'name location package');
  const applied = new Set((await Application.find({ studentId: req.user._id })).map(a => String(a.jobId)));
  const scored = await matchMany(jobs, async (job) => {
    const m = await matchOne(p, job);
    return { job, match: m, eligibility: eligible(p, job), applied: applied.has(String(job._id)) };
  });
  scored.sort((a, b) => b.match.score - a.match.score);
  res.json({ roles, jobs: scored });
});

exports.jobMatch = h(async (req, res) => {
  const [p, job] = await Promise.all([getProfile(req.user._id), Job.findById(req.params.jobId).populate('companyId')]);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  const match = await matchOne(p, job);
  res.json({ job, match, eligibility: eligible(p, job) });
});

exports.apply = h(async (req, res) => {
  const [p, job] = await Promise.all([getProfile(req.user._id), Job.findById(req.params.jobId)]);
  if (!job || job.status !== 'open') return res.status(400).json({ message: 'Job is not open' });
  const elig = eligible(p, job);
  if (!elig.ok) return res.status(403).json({ message: 'Not eligible: ' + elig.reasons.join('; ') });
  const m = await matchOne(p, job);
  const app = await Application.create({ studentId: req.user._id, jobId: job._id, matchScore: m.score, breakdown: m.breakdown, missingSkills: m.missingSkills });
  await snapshot(req.user._id, 'apply');
  res.status(201).json({ application: app });
});

exports.myApplications = h(async (req, res) => {
  const apps = await Application.find({ studentId: req.user._id }).sort('-createdAt')
    .populate({ path: 'jobId', populate: { path: 'companyId', select: 'name' } });
  res.json({ applications: apps });
});

exports.progress = h(async (req, res) => {
  const uid = req.user._id;
  const [timeline, roadmaps, sessions, apps, p] = await Promise.all([
    ProgressSnapshot.find({ studentId: uid }).sort('createdAt').limit(100),
    Roadmap.find({ studentId: uid }), InterviewSession.find({ studentId: uid, completed: true }).sort('createdAt'),
    Application.find({ studentId: uid }), getProfile(uid),
  ]);
  const steps = roadmaps.flatMap(r => r.steps);
  res.json({
    timeline,
    summary: {
      skills: p.skills.length, resumeQuality: p.resume?.quality?.score ?? null,
      roadmapDone: steps.filter(s => s.status === 'done').length, roadmapTotal: steps.length,
      interviewsDone: sessions.length,
      interviewAvg: sessions.length ? +(sessions.reduce((a, s) => a + s.averageScore, 0) / sessions.length).toFixed(1) : null,
      applications: apps.length, shortlisted: apps.filter(a => ['shortlisted', 'selected'].includes(a.status)).length,
    },
    interviewHistory: sessions.map(s => ({ date: s.createdAt, type: s.type, score: s.averageScore })),
  });
});
