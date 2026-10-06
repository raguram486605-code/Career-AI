const Roadmap = require('../models/Roadmap');
const InterviewSession = require('../models/InterviewSession');
const Application = require('../models/Application');
const ProgressSnapshot = require('../models/ProgressSnapshot');
const StudentProfile = require('../models/StudentProfile');

// Record a snapshot of the student's current state. Called after key events.
exports.snapshot = async (studentId, event) => {
  try {
    const [profile, roadmaps, sessions, apps] = await Promise.all([
      StudentProfile.findOne({ userId: studentId }),
      Roadmap.find({ studentId }),
      InterviewSession.find({ studentId, completed: true }),
      Application.find({ studentId, matchScore: { $ne: null } }),
    ]);
    const steps = roadmaps.flatMap(r => r.steps);
    const done = steps.filter(s => s.status === 'done').length;
    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : 0;
    await ProgressSnapshot.create({
      studentId, event,
      skillCount: profile?.skills?.length || 0,
      avgMatch: avg(apps.map(a => a.matchScore)),
      roadmapCompletion: steps.length ? Math.round(100 * done / steps.length) : 0,
      interviewAvg: avg(sessions.map(s => s.averageScore)),
    });
  } catch (e) { console.warn('snapshot failed:', e.message); }
};
