const Roadmap = require('../models/Roadmap');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const ai = require('../services/aiClient');
const { matchOne } = require('../services/matching');
const { snapshot } = require('../services/progress');
const h = require('../utils/asyncHandler');

// POST /api/roadmaps  { jobId } or { role: "Java Backend Developer", hoursPerWeek }
exports.create = h(async (req, res) => {
  const { jobId, role, hoursPerWeek } = req.body;
  const p = await StudentProfile.findOne({ userId: req.user._id });
  let missing, title, required, targetJobId;
  if (jobId) {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const m = await matchOne(p, job);
    missing = [...m.missingSkills, ...m.niceToHaveMissing.slice(0, 2)]; title = job.title; required = job.requiredSkills; targetJobId = job._id;
  } else if (role) {
    const roles = await ai.recommendRoles({ studentSkills: p.skills, hasGithub: !!p.resume?.hasGithub, topN: 50 });
    const r = roles.find(x => x.role === role);
    if (!r) return res.status(404).json({ message: 'Unknown role' });
    missing = r.missing; title = r.role; required = [...r.matched, ...r.missing];
  } else return res.status(400).json({ message: 'Provide jobId or role' });

  const rm = await ai.roadmap({ studentSkills: p.skills, missingSkills: missing, targetTitle: title, jobRequired: required, hoursPerWeek: hoursPerWeek || 10 });
  const doc = await Roadmap.create({ studentId: req.user._id, targetJobId, target: title, steps: rm.steps, totalHours: rm.totalHours, estimatedWeeks: rm.estimatedWeeks, path: rm.path });
  res.status(201).json({ roadmap: doc });
});

exports.list = h(async (req, res) => res.json({ roadmaps: await Roadmap.find({ studentId: req.user._id }).sort('-createdAt') }));

exports.updateStep = h(async (req, res) => {
  const { status } = req.body;
  if (!['todo', 'in_progress', 'done'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const rm = await Roadmap.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!rm) return res.status(404).json({ message: 'Roadmap not found' });
  const step = rm.steps.find(s => s.id === req.params.stepId);
  if (!step) return res.status(404).json({ message: 'Step not found' });
  step.status = status; step.completedAt = status === 'done' ? new Date() : undefined;
  rm.markModified('steps');
  await rm.save();
  await snapshot(req.user._id, 'step_done');
  res.json({ roadmap: rm });
});

exports.remove = h(async (req, res) => {
  await Roadmap.deleteOne({ _id: req.params.id, studentId: req.user._id });
  res.json({ ok: true });
});
