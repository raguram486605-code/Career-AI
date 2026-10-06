const mongoose = require('mongoose');
// One row per meaningful event so the student can see progress over time.
module.exports = mongoose.model('ProgressSnapshot', new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event: String,                       // resume_upload | step_done | interview | profile
  skillCount: Number, avgMatch: Number, roadmapCompletion: Number, interviewAvg: Number,
}, { timestamps: true }));
