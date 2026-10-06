const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'admin', 'company'], default: 'student' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
}, { timestamps: true });
userSchema.methods.verifyPassword = function (pw) { return bcrypt.compare(pw, this.passwordHash); };
userSchema.statics.hash = (pw) => bcrypt.hash(pw, 10);
module.exports = mongoose.model('User', userSchema);
