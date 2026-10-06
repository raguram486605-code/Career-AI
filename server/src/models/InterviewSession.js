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

module.exports = mongoose.model('InterviewSession', new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['technical', 'hr'], required: true },
  questions: [q],
  averageScore: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
}, { timestamps: true }));
