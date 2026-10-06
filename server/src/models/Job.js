const mongoose = require('mongoose');
module.exports = mongoose.model('Job', new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  requiredSkills: [String], niceToHave: [String],
  minCGPA: { type: Number, default: 0 },
  allowedBranches: [String],               // empty = all
  salary: String, location: String,
  deadline: Date,
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true }));
