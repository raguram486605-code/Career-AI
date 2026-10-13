const InterviewSession = require('../models/InterviewSession');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const ai = require('../services/aiClient');
const { snapshot } = require('../services/progress');
const h = require('../utils/asyncHandler');

// Hide correct answers from pending questions so choices aren't spoiled beforehand
const sanitizeQuestion = (q, reveal = false) => {
  const obj = q.toObject ? q.toObject() : { ...q };
  if (!reveal && obj.isCorrect === undefined) {
    delete obj.correctOption;
    delete obj.explanation;
  }
  return obj;
};

const cleanSession = (s, revealAll = false) => {
  const obj = s.toObject ? s.toObject() : { ...s };
  obj.questions = (obj.questions || []).map(q => sanitizeQuestion(q, revealAll || q.isCorrect !== undefined));
  return obj;
};

// 1. Practice session creation
exports.start = h(async (req, res) => {
  const { type = 'technical', count = 5, skills } = req.body;
  if (!['technical', 'hr', 'aptitude'].includes(type)) {
    return res.status(400).json({ message: 'type must be technical, hr, or aptitude' });
  }
  const p = await StudentProfile.findOne({ userId: req.user._id });
  const questions = await ai.questions({ type, skills: skills?.length ? skills : (p?.skills || []), count: Number(count) || 5 });
  const timeLimitMinutes = type === 'aptitude' ? 50 : 30;

  const s = await InterviewSession.create({
    studentId: req.user._id,
    type,
    questions,
    targetCount: Number(count) || 5,
    timeLimitMinutes,
    attemptStatus: 'not_started',
    locked: false,
  });

  res.status(201).json({ session: cleanSession(s) });
});

// 2. Start Assessment (Enforces Single Entry Constraint & Initiates Countdown Timer)
exports.startTest = h(async (req, res) => {
  const s = await InterviewSession.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!s) return res.status(404).json({ message: 'Session not found' });

  // Single-entry enforcement
  if (s.locked || s.attemptStatus === 'in_progress' || s.attemptStatus === 'completed' || s.attemptStatus === 'terminated') {
    // If retake was approved, unlock for this new attempt
    if (s.retakeRequest?.status === 'approved' && s.attemptStatus !== 'in_progress') {
      s.attemptStatus = 'in_progress';
      s.locked = true;
      s.startedAt = new Date();
      s.terminationReason = '';
      await s.save();

      if (s.applicationId) {
        await Application.updateOne(
          { _id: s.applicationId, 'interviewRounds.sessionId': s._id },
          { $set: { 'interviewRounds.$.status': 'in_progress', 'interviewRounds.$.terminationReason': '' } }
        );
      }

      return res.json({
        session: cleanSession(s),
        timeLimitMinutes: s.timeLimitMinutes || (s.type === 'aptitude' ? 50 : 30),
        startedAt: s.startedAt,
        message: 'Re-take attempt initiated.',
      });
    }

    return res.status(403).json({
      message: 'This test is restricted to a SINGLE ENTRY only. You have already accessed or closed this test session. If you closed it mistakenly, please send a re-take request to the company with a proper reason.',
      locked: true,
      attemptStatus: s.attemptStatus,
      terminationReason: s.terminationReason || 'Single entry session already accessed',
      retakeRequest: s.retakeRequest,
      session: cleanSession(s, s.completed),
    });
  }

  // First and only permitted entry
  s.attemptStatus = 'in_progress';
  s.locked = true;
  s.startedAt = new Date();
  await s.save();

  if (s.applicationId) {
    await Application.updateOne(
      { _id: s.applicationId, 'interviewRounds.sessionId': s._id },
      { $set: { 'interviewRounds.$.status': 'in_progress' } }
    );
  }

  res.json({
    session: cleanSession(s),
    timeLimitMinutes: s.timeLimitMinutes || (s.type === 'aptitude' ? 50 : 30),
    startedAt: s.startedAt,
    message: 'Test started. Anti-cheat monitoring is now active.',
  });
});

// 3. Automatically Terminate & Lock Test on Violation (Tab switch, window blur, back button, exit)
exports.terminate = h(async (req, res) => {
  const { reason = 'Tab switch or navigation away detected' } = req.body;
  const s = await InterviewSession.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!s) return res.status(404).json({ message: 'Session not found' });

  // If already completed normally, do not overwrite score
  if (s.completed && s.attemptStatus === 'completed') {
    return res.json({ session: cleanSession(s, true), message: 'Session already completed.' });
  }

  s.attemptStatus = 'terminated';
  s.completed = true;
  s.locked = true;
  s.terminationReason = reason;

  // Calculate score based on answered questions up to termination
  const answered = s.questions.filter(x => x.score != null);
  s.averageScore = answered.length ? +(answered.reduce((a, x) => a + x.score, 0) / s.questions.length).toFixed(1) : 0;
  await s.save();

  if (s.applicationId) {
    try {
      const app = await Application.findById(s.applicationId);
      if (app) {
        const round = app.interviewRounds.find(r => String(r.sessionId) === String(s._id));
        if (round) {
          round.status = 'terminated';
          round.terminationReason = reason;
          round.score = Math.round((s.averageScore / 10) * 100);
          round.completedAt = new Date();
          await app.save();
        }
      }
    } catch (err) {
      console.error('Error updating application round termination:', err.message);
    }
  }

  res.json({
    message: 'Test automatically closed and locked due to anti-cheat policy violation.',
    session: cleanSession(s, true),
    terminationReason: s.terminationReason,
  });
});

// 4. Submit Re-take Request with Proper Reason to Company
exports.submitRetakeRequest = h(async (req, res) => {
  const { reason } = req.body;
  if (!reason || reason.trim().length < 15) {
    return res.status(400).json({
      message: 'Please provide a detailed, proper reason explaining why the test closed prematurely (minimum 15 characters).',
    });
  }

  const s = await InterviewSession.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!s) return res.status(404).json({ message: 'Session not found' });

  const requestData = {
    requested: true,
    reason: reason.trim(),
    requestedAt: new Date(),
    status: 'pending',
    reviewedAt: null,
    reviewedBy: null,
  };

  s.retakeRequest = requestData;
  await s.save();

  if (s.applicationId) {
    try {
      const app = await Application.findById(s.applicationId);
      if (app) {
        const round = app.interviewRounds.find(r => String(r.sessionId) === String(s._id));
        if (round) {
          round.retakeRequest = requestData;
          await app.save();
        }
      }
    } catch (err) {
      console.error('Error syncing retake request to application round:', err.message);
    }
  }

  res.json({
    message: 'Re-take request successfully submitted to company recruiter.',
    retakeRequest: s.retakeRequest,
  });
});

// 5. Answer question
exports.answer = h(async (req, res) => {
  const { questionId, selectedOption, answer } = req.body;
  const optIdx = selectedOption !== undefined ? Number(selectedOption) : Number(answer);
  if (isNaN(optIdx)) return res.status(400).json({ message: 'Select an option' });

  const s = await InterviewSession.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!s) return res.status(404).json({ message: 'Session not found' });

  if (s.attemptStatus === 'terminated') {
    return res.status(403).json({
      message: 'This test was terminated and locked. You cannot submit further answers.',
      attemptStatus: 'terminated',
      terminationReason: s.terminationReason,
    });
  }

  const q = s.questions.find(x => x.id === Number(questionId));
  if (!q) return res.status(404).json({ message: 'Question not found' });

  const ev = await ai.evaluate({
    selectedOption: optIdx,
    correctOption: q.correctOption,
    options: q.options,
    explanation: q.explanation,
  });

  Object.assign(q, {
    selectedOption: optIdx,
    userOptionText: ev.userOptionText,
    correctAnswer: ev.correctAnswer,
    isCorrect: ev.isCorrect,
    score: ev.score,
    feedback: ev.feedback,
  });

  const answered = s.questions.filter(x => x.score != null);
  s.averageScore = +(answered.reduce((a, x) => a + x.score, 0) / answered.length).toFixed(1);
  s.completed = answered.length === s.questions.length;
  if (s.completed) {
    s.attemptStatus = 'completed';
  }
  await s.save();

  if (s.completed) {
    await snapshot(req.user._id, 'interview');
    if (s.applicationId) {
      try {
        const app = await Application.findById(s.applicationId);
        if (app) {
          const round = app.interviewRounds.find(r => String(r.sessionId) === String(s._id));
          if (round) {
            round.status = 'completed';
            const pct = Math.round((s.averageScore / 10) * 100);
            round.score = pct;
            round.completedAt = new Date();
            await app.save();
          }
        }
      } catch (err) {
        console.error('Error updating application round status:', err.message);
      }
    }
  }

  res.json({
    evaluation: {
      ...ev,
      correctOption: q.correctOption,
      explanation: q.explanation,
    },
    question: sanitizeQuestion(q, true),
    averageScore: s.averageScore,
    completed: s.completed,
  });
});

exports.list = h(async (req, res) => {
  const list = await InterviewSession.find({ studentId: req.user._id }).sort('-createdAt').limit(30);
  res.json({ sessions: list.map(s => cleanSession(s, s.completed)) });
});

exports.get = h(async (req, res) => {
  const s = await InterviewSession.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!s) return res.status(404).json({ message: 'Session not found' });
  res.json({ session: cleanSession(s, s.completed) });
});
