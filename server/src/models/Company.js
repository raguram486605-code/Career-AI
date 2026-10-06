const mongoose = require('mongoose');
module.exports = mongoose.model('Company', new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  industry: String, website: String, location: String,
  contactName: String, contactEmail: String,
  package: String,   // e.g. "6-9 LPA"
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
}, { timestamps: true }));
