const mongoose = require('mongoose');

const q = new mongoose.Schema({
  id: Number,
  question: String,
  category: String,
  options: [String],
  correctOption: Number,
  explanation: String,
  selectedOption: Number,
  userOptionText: String,
  correctAnswer: String,
  isCorrect: Boolean,
  score: Number,
  feedback: String,
}, { _id: false });

const retakeRequestSchema = new mongoose.Schema({
  requested: { type: Boolean, default: false },
  reason: { type: String, default: '' },
  requestedAt: { type: Date, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { _id: false });

module.exports = mongoose.model('InterviewSession', new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['technical', 'hr', 'aptitude'], required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  roundType: { type: String, enum: ['aptitude', 'technical', 'one_on_one'] },
  roundLabel: String,
  targetCount: Number,
  timeLimitMinutes: { type: Number, default: 30 }, // 50 for aptitude, 30 for technical
  startedAt: { type: Date, default: null },
  durationSeconds: { type: Number, default: 0 },
  attemptStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'terminated'],
    default: 'not_started',
  },
  locked: { type: Boolean, default: false },
  terminationReason: { type: String, default: '' },
  retakeRequest: { type: retakeRequestSchema, default: () => ({}) },
  questions: [q],
  averageScore: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
}, { timestamps: true }));
