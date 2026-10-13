const mongoose = require('mongoose');

const retakeRequestSchema = new mongoose.Schema({
  requested: { type: Boolean, default: false },
  reason: { type: String, default: '' },
  requestedAt: { type: Date, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedAt: { type: Date, default: null },
}, { _id: false });

const interviewRoundSchema = new mongoose.Schema({
  roundType: {
    type: String,
    enum: ['aptitude', 'technical', 'one_on_one'],
    required: true,
  },
  roundLabel: {
    type: String,
    required: true,
  },
  questionCount: {
    type: Number,
    default: 0,
  },
  timeLimitMinutes: {
    type: Number,
    default: 30, // 50 for aptitude, 30 for technical
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'terminated'],
    default: 'scheduled',
  },
  terminationReason: {
    type: String,
    default: '',
  },
  retakeRequest: {
    type: retakeRequestSchema,
    default: () => ({}),
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  scheduledAt: {
    type: Date,
    default: Date.now,
  },
  // Details for One-on-One Interview
  oneOnOne: {
    meetingDate: Date,
    meetingTime: String,
    meetingLink: String,
    interviewerName: String,
    instructions: String,
    emailSentTo: String,
    emailSentAt: Date,
    emailStatus: { type: String, default: 'sent' },
    emailSubject: String,
  },
  // Details for Aptitude or Technical Quiz sessions
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
  },
  score: {
    type: Number,
    default: null,
  },
  completedAt: Date,
}, { timestamps: true });

const schema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  matchScore: Number,
  breakdown: Object,
  missingSkills: [String],
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'selected'],
    default: 'applied',
  },
  interviewRounds: [interviewRoundSchema],
}, { timestamps: true });

schema.index({ studentId: 1, jobId: 1 }, { unique: true });
module.exports = mongoose.model('Application', schema);
