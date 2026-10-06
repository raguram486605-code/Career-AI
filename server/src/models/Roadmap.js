const mongoose = require('mongoose');
const step = new mongoose.Schema({
  id: String, order: Number, type: String, skill: String, hours: Number, reason: String,
  resources: [{ title: String, url: String }],
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  completedAt: Date,
}, { _id: false });
module.exports = mongoose.model('Roadmap', new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  target: String, steps: [step], totalHours: Number, estimatedWeeks: Number, path: String,
}, { timestamps: true }));
