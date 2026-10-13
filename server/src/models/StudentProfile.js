const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  rollNo: String, phone: String,
  branch: { type: String, default: 'IT' },
  graduationYear: Number,
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  skills: [String],                 // canonical skill names (editable by student)
  targetRoles: [String],
  resume: {
    fileName: String, uploadedAt: Date,
    text: String, projectsText: String, hasGithub: Boolean,
    quality: { score: Number, suggestions: [String] },
    skillEvidence: Object,
    fileData: String,
    mimeType: String,
  },
}, { timestamps: true });
module.exports = mongoose.model('StudentProfile', schema);
