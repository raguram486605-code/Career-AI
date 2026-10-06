const InterviewSession = require('../models/InterviewSession');
const StudentProfile = require('../models/StudentProfile');
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
  obj.questions = obj.questions.map(q => sanitizeQuestion(q, revealAll || q.isCorrect !== undefined));
  return obj;
};

exports.start = h(async (req, res) => {
  const { type = 'technical', count = 5, skills } = req.body;
  if (!['technical', 'hr'].includes(type)) return res.status(400).json({ message: 'type must be technical or hr' });
  const p = await StudentProfile.findOne({ userId: req.user._id });
  const questions = await ai.questions({ type, skills: skills?.length ? skills : (p?.skills || []), count: Number(count) || 5 });
  const s = await InterviewSession.create({ studentId: req.user._id, type, questions });
  res.status(201).json({ session: cleanSession(s) });
});

exports.answer = h(async (req, res) => {
  const { questionId, selectedOption, answer } = req.body;
  const optIdx = selectedOption !== undefined ? Number(selectedOption) : Number(answer);
  if (isNaN(optIdx)) return res.status(400).json({ message: 'Select an option' });

  const s = await InterviewSession.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!s) return res.status(404).json({ message: 'Session not found' });
  const q = s.questions.find(x => x.id === Number(questionId));
  if (!q) return res.status(404).json({ message: 'Question not found' });

  const ev = await ai.evaluate({
    selectedOption: optIdx,
    correctOption: q.correctOption,
    options: q.options,
    explanation: q.explanation
  });

  Object.assign(q, {
    selectedOption: optIdx,
    userOptionText: ev.userOptionText,
    correctAnswer: ev.correctAnswer,
    isCorrect: ev.isCorrect,
    score: ev.score,
    feedback: ev.feedback
  });

  const answered = s.questions.filter(x => x.score != null);
  s.averageScore = +(answered.reduce((a, x) => a + x.score, 0) / answered.length).toFixed(1);
  s.completed = answered.length === s.questions.length;
  await s.save();
  if (s.completed) await snapshot(req.user._id, 'interview');

  res.json({
    evaluation: {
      ...ev,
      correctOption: q.correctOption,
      explanation: q.explanation
    },
    question: sanitizeQuestion(q, true),
    averageScore: s.averageScore,
    completed: s.completed
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
