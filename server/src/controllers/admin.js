const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { matchOne, matchMany, eligible } = require('../services/matching');
const h = require('../utils/asyncHandler');

// ---------- Companies ----------
exports.listCompanies = h(async (req, res) => res.json({ companies: await Company.find().sort('name') }));
exports.createCompany = h(async (req, res) => res.status(201).json({ company: await Company.create(req.body) }));
exports.updateCompany = h(async (req, res) => {
  const c = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!c) return res.status(404).json({ message: 'Company not found' });
  res.json({ company: c });
});
exports.deleteCompany = h(async (req, res) => {
  if (await Job.exists({ companyId: req.params.id })) return res.status(409).json({ message: 'Delete or close this company\'s jobs first' });
  await Company.deleteOne({ _id: req.params.id });
  await User.deleteMany({ companyId: req.params.id });
  res.json({ ok: true });
});

// Company Registration Approval Request Box
exports.listCompanyRequests = h(async (req, res) => {
  const requests = await User.find({ role: 'company' }).populate('companyId').sort('-createdAt');
  res.json({ requests });
});

exports.approveCompanyRequest = h(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'company') return res.status(404).json({ message: 'Company user request not found' });
  user.status = 'approved';
  await user.save();
  if (user.companyId) {
    await Company.findByIdAndUpdate(user.companyId, { status: 'approved' });
  }
  res.json({ message: 'Company request approved successfully', user });
});

exports.rejectCompanyRequest = h(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'company') return res.status(404).json({ message: 'Company user request not found' });
  user.status = 'rejected';
  await user.save();
  if (user.companyId) {
    await Company.findByIdAndUpdate(user.companyId, { status: 'rejected' });
  }
  res.json({ message: 'Company request rejected', user });
});

// ---------- Jobs ----------
exports.listJobs = h(async (req, res) => {
  const jobs = await Job.find().sort('-createdAt').populate('companyId', 'name');
  const counts = await Application.aggregate([{ $group: { _id: '$jobId', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map(c => [String(c._id), c.n]));
  res.json({ jobs: jobs.map(j => ({ ...j.toObject(), applicants: map[String(j._id)] || 0 })) });
});
exports.createJob = h(async (req, res) => res.status(201).json({ job: await Job.create(req.body) }));
exports.updateJob = h(async (req, res) => {
  const j = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!j) return res.status(404).json({ message: 'Job not found' });
  res.json({ job: j });
});
exports.deleteJob = h(async (req, res) => {
  await Promise.all([Job.deleteOne({ _id: req.params.id }), Application.deleteMany({ jobId: req.params.id })]);
  res.json({ ok: true });
});

// Public (any logged-in user) list of open jobs
exports.openJobs = h(async (req, res) => {
  const jobs = await Job.find({ status: 'open' }).sort('-createdAt').populate('companyId', 'name location package');
  res.json({ jobs });
});

// ---------- Student-Job matching (AI) ----------
// Rank every student for one job. ?onlyEligible=true applies CGPA/branch filters.
exports.jobMatches = h(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('companyId', 'name');
  if (!job) return res.status(404).json({ message: 'Job not found' });
  const profiles = await StudentProfile.find().populate('userId', 'name email');
  const apps = await Application.find({ jobId: job._id });
  const appMap = Object.fromEntries(apps.map(a => [String(a.studentId), a]));
  const rows = await matchMany(profiles, async (p) => {
    const m = await matchOne(p, job);
    const el = eligible(p, job);
    const app = appMap[String(p.userId._id)];
    return {
      studentId: p.userId._id, name: p.userId.name, email: p.userId.email, branch: p.branch, cgpa: p.cgpa,
      score: m.score, breakdown: m.breakdown, matched: m.matchedSkills, missing: m.missingSkills,
      eligible: el.ok, eligibilityNotes: el.reasons,
      applicationId: app?._id || null, status: app?.status || null,
      interviewRounds: app?.interviewRounds || [],
    };
  });
  let out = rows;
  if (req.query.onlyEligible === 'true') out = out.filter(r => r.eligible);
  const min = Number(req.query.minScore || 0);
  out = out.filter(r => r.score >= min).sort((a, b) => b.score - a.score);
  res.json({ job, students: out });
});

exports.jobApplicants = h(async (req, res) => {
  const apps = await Application.find({ jobId: req.params.id }).sort('-matchScore').populate('studentId', 'name email');
  const profiles = await StudentProfile.find({ userId: { $in: apps.map(a => a.studentId._id) } });
  const pm = Object.fromEntries(profiles.map(p => [String(p.userId), p]));
  res.json({ applicants: apps.map(a => ({ ...a.toObject(), branch: pm[String(a.studentId._id)]?.branch, cgpa: pm[String(a.studentId._id)]?.cgpa })) });
});

// Candidate recruitment action: Only company users can modify status and create interviews
exports.setStatus = h(async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Candidate status and interview rounds are editable by company users only.' });
  }
  const { status, studentId, jobId } = req.body;
  if (!['applied', 'shortlisted', 'rejected', 'selected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  let app = req.params.id !== 'new' ? await Application.findById(req.params.id) : null;
  if (!app && studentId && jobId) {
    const [p, job] = await Promise.all([StudentProfile.findOne({ userId: studentId }), Job.findById(jobId)]);
    const m = await matchOne(p, job);
    app = await Application.findOneAndUpdate({ studentId, jobId },
      { $setOnInsert: { matchScore: m.score, breakdown: m.breakdown, missingSkills: m.missingSkills } }, { upsert: true, new: true });
  }
  if (!app) return res.status(404).json({ message: 'Application not found' });
  app.status = status; await app.save();
  res.json({ application: app });
});

exports.shortlisted = h(async (req, res) => {
  const apps = await Application.find({ status: { $in: ['shortlisted', 'selected'] } }).sort('-updatedAt')
    .populate('studentId', 'name email').populate({ path: 'jobId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } });
  res.json({ shortlisted: apps });
});

// ---------- Analytics ----------
exports.analytics = h(async (req, res) => {
  const [students, companies, jobs, apps, profiles] = await Promise.all([
    User.countDocuments({ role: 'student' }), Company.countDocuments(), Job.find(), Application.find().populate('jobId', 'title'),
    StudentProfile.find(),
  ]);
  const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); if (k != null) m[k] = (m[k] || 0) + 1; return m; }, {});
  const skillCounts = count(profiles.flatMap(p => p.skills), s => s);
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([skill, n]) => ({ skill, students: n }));
  // Skill demand vs supply: skills asked by open jobs that few students have
  const demand = count(jobs.filter(j => j.status === 'open').flatMap(j => j.requiredSkills), s => s);
  const gaps = Object.entries(demand).map(([skill, jobsNeeding]) => ({ skill, jobsNeeding, studentsHave: skillCounts[skill] || 0 }))
    .sort((a, b) => (b.jobsNeeding - b.studentsHave) - (a.jobsNeeding - a.studentsHave)).slice(0, 8);
  const byStatus = count(apps, a => a.status);
  const placed = new Set(apps.filter(a => a.status === 'selected').map(a => String(a.studentId)));
  const byBranch = count(profiles, p => p.branch);
  const buckets = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };
  apps.forEach(a => { const s = a.matchScore || 0; buckets[s < 20 ? '0-20' : s < 40 ? '20-40' : s < 60 ? '40-60' : s < 80 ? '60-80' : '80-100']++; });
  res.json({
    totals: { students, companies, jobs: jobs.length, openJobs: jobs.filter(j => j.status === 'open').length, applications: apps.length,
      shortlisted: (byStatus.shortlisted || 0) + (byStatus.selected || 0), placed: placed.size,
      placementRate: students ? +(100 * placed.size / students).toFixed(1) : 0,
      resumesUploaded: profiles.filter(p => p.resume?.uploadedAt).length },
    byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
    byBranch: Object.entries(byBranch).map(([name, value]) => ({ name, value })),
    topSkills, skillGaps: gaps,
    scoreDistribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
  });
});

// ---------- Reports (CSV) ----------
const csv = (rows) => rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

exports.studentsReport = h(async (req, res) => {
  const ps = await StudentProfile.find().populate('userId', 'name email');
  const rows = [['Name', 'Email', 'Branch', 'CGPA', 'Skills', 'Resume uploaded', 'Resume quality']];
  ps.forEach(p => rows.push([p.userId.name, p.userId.email, p.branch, p.cgpa, p.skills.join('; '), p.resume?.uploadedAt ? 'Yes' : 'No', p.resume?.quality?.score ?? '']));
  res.header('Content-Type', 'text/csv').attachment('students_report.csv').send(csv(rows));
});

exports.applicationsReport = h(async (req, res) => {
  const as = await Application.find().populate('studentId', 'name email')
    .populate({ path: 'jobId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } });
  const rows = [['Student', 'Email', 'Company', 'Job', 'Match %', 'Status', 'Missing skills']];
  as.forEach(a => rows.push([a.studentId?.name, a.studentId?.email, a.jobId?.companyId?.name, a.jobId?.title, a.matchScore, a.status, (a.missingSkills || []).join('; ')]));
  res.header('Content-Type', 'text/csv').attachment('applications_report.csv').send(csv(rows));
});

exports.shortlistReport = h(async (req, res) => {
  const as = await Application.find({ status: { $in: ['shortlisted', 'selected'] } }).populate('studentId', 'name email')
    .populate({ path: 'jobId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } });
  const rows = [['Student', 'Email', 'Company', 'Job', 'Match %', 'Status']];
  as.forEach(a => rows.push([a.studentId?.name, a.studentId?.email, a.jobId?.companyId?.name, a.jobId?.title, a.matchScore, a.status]));
  res.header('Content-Type', 'text/csv').attachment('shortlisted_students.csv').send(csv(rows));
});

exports.students = h(async (req, res) => {
  const ps = await StudentProfile.find().populate('userId', 'name email');
  res.json({ students: ps.map(p => ({ id: p.userId._id, name: p.userId.name, email: p.userId.email, branch: p.branch, cgpa: p.cgpa, skills: p.skills, resumeQuality: p.resume?.quality?.score ?? null })) });
});
