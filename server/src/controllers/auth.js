const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const h = require('../utils/asyncHandler');

const Company = require('../models/Company');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, status: u.status, companyId: u.companyId });

exports.register = h(async (req, res) => {
  const { name, email, password, role, branch, cgpa } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const wantAdmin = role === 'admin' && process.env.ALLOW_ADMIN_SIGNUP === 'true';
  const user = await User.create({ name, email, passwordHash: await User.hash(password), role: wantAdmin ? 'admin' : 'student', status: 'approved' });
  if (user.role === 'student') await StudentProfile.create({ userId: user._id, branch: branch || 'IT', cgpa: cgpa || 0 });
  res.status(201).json({ token: sign(user), user: pub(user) });
});

exports.companyRequest = h(async (req, res) => {
  const { companyName, industry, location, website, contactName, contactEmail, password } = req.body;
  if (!companyName || !contactEmail || !password) {
    return res.status(400).json({ message: 'Company name, contact email and password are required' });
  }
  const existingUser = await User.findOne({ email: contactEmail.toLowerCase() });
  if (existingUser) return res.status(400).json({ message: 'Email address already registered' });

  let company = await Company.findOne({ name: companyName.trim() });
  if (!company) {
    company = await Company.create({
      name: companyName.trim(),
      industry: industry || 'Software',
      location: location || 'TBD',
      website: website || '',
      contactName: contactName || companyName,
      contactEmail: contactEmail.toLowerCase(),
      status: 'pending'
    });
  }

  const user = await User.create({
    name: contactName || companyName,
    email: contactEmail.toLowerCase(),
    passwordHash: await User.hash(password),
    role: 'company',
    companyId: company._id,
    status: 'pending'
  });

  res.status(201).json({ message: 'Company registration request submitted successfully! Pending admin approval.', user: pub(user) });
});

exports.login = h(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
  if (user.status === 'pending') return res.status(403).json({ message: 'Your company account is pending admin approval.' });
  if (user.status === 'rejected') return res.status(403).json({ message: 'Your company registration request was rejected by admin.' });
  res.json({ token: sign(user), user: pub(user) });
});

exports.me = h(async (req, res) => res.json({ user: pub(req.user) }));
