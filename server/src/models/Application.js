const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  matchScore: Number, breakdown: Object,
  missingSkills: [String],
  status: { type: String, enum: ['applied', 'shortlisted', 'rejected', 'selected'], default: 'applied' },
}, { timestamps: true });
schema.index({ studentId: 1, jobId: 1 }, { unique: true });
module.exports = mongoose.model('Application', schema);
