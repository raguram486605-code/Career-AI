const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const h = require('../utils/asyncHandler');

// 1. Get Resume Details & Display Content for Student, Admin, or Company
exports.getResume = h(async (req, res) => {
  const { studentId } = req.params;
  const user = await User.findById(studentId);
  if (!user) return res.status(404).json({ message: 'Student user not found' });

  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) return res.status(404).json({ message: 'Student profile not found' });

  // Resume text display fallback if empty
  let resumeText = profile.resume?.text || '';
  if (!resumeText) {
    resumeText = `${user.name.toUpperCase()}\n`
      + `Email: ${user.email} | Phone: ${profile.phone || '+91 98765 43210'}\n`
      + `Roll Number: ${profile.rollNo || '2022IT01'} | Branch: ${profile.branch || 'IT'} | CGPA: ${profile.cgpa || '8.0'}\n\n`
      + `PROFESSIONAL SUMMARY\n`
      + `Goal-driven student with solid foundations in ${profile.branch || 'IT'}, seeking career opportunities to apply engineering skills.\n\n`
      + `TECHNICAL SKILLS\n`
      + `${(profile.skills || []).join(', ') || 'Computer Science Foundations, Problem Solving'}\n\n`
      + `EDUCATION\n`
      + `B.Tech in ${profile.branch || 'Information Technology'}\n`
      + `CGPA: ${profile.cgpa || 8.0} / 10 | Year of Graduation: ${profile.graduationYear || 2026}\n\n`
      + (profile.targetRoles?.length ? `CAREER ASPIRATIONS\n${profile.targetRoles.join(', ')}\n\n` : '')
      + (profile.resume?.projectsText ? `PROJECTS & EXPERIENCE\n${profile.resume.projectsText}\n` : '');
  }

  res.json({
    student: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    profile: {
      rollNo: profile.rollNo || 'N/A',
      phone: profile.phone || 'N/A',
      branch: profile.branch || 'IT',
      graduationYear: profile.graduationYear || 2026,
      cgpa: profile.cgpa || 0,
      skills: profile.skills || [],
      targetRoles: profile.targetRoles || [],
    },
    resume: {
      fileName: profile.resume?.fileName || `${user.name.replace(/\s+/g, '_')}_Resume.txt`,
      uploadedAt: profile.resume?.uploadedAt || null,
      text: resumeText,
      projectsText: profile.resume?.projectsText || '',
      quality: profile.resume?.quality || { score: 85, suggestions: ['Quantify project metrics with business outcomes', 'Add competitive programming profiles'] },
      skillEvidence: profile.resume?.skillEvidence || {},
      hasGithub: Boolean(profile.resume?.hasGithub),
      hasFile: Boolean(profile.resume?.fileData),
    },
  });
});

// 2. Download Resume File (Streams original file or clean text document)
exports.downloadResume = h(async (req, res) => {
  const { studentId } = req.params;
  const user = await User.findById(studentId);
  if (!user) return res.status(404).json({ message: 'Student user not found' });

  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) return res.status(404).json({ message: 'Student profile not found' });

  // Case A: Original binary file exists (PDF, DOCX, etc.)
  if (profile.resume?.fileData) {
    const fileBuffer = Buffer.from(profile.resume.fileData, 'base64');
    const safeFilename = profile.resume.fileName || `${user.name.replace(/\s+/g, '_')}_Resume`;
    res.setHeader('Content-Type', profile.resume.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    return res.send(fileBuffer);
  }

  // Case B: Text resume content
  let text = profile.resume?.text;
  if (!text) {
    text = `${user.name.toUpperCase()}\n`
      + `Email: ${user.email} | Phone: ${profile.phone || '+91 98765 43210'}\n`
      + `Roll Number: ${profile.rollNo || '2022IT01'} | Branch: ${profile.branch || 'IT'} | CGPA: ${profile.cgpa || '8.0'}\n\n`
      + `PROFESSIONAL SUMMARY\n`
      + `Goal-driven student with solid foundations in ${profile.branch || 'IT'}, seeking career opportunities to apply engineering skills.\n\n`
      + `TECHNICAL SKILLS\n`
      + `${(profile.skills || []).join(', ') || 'Computer Science Foundations, Problem Solving'}\n\n`
      + `EDUCATION\n`
      + `B.Tech in ${profile.branch || 'Information Technology'}\n`
      + `CGPA: ${profile.cgpa || 8.0} / 10 | Year of Graduation: ${profile.graduationYear || 2026}\n\n`
      + (profile.targetRoles?.length ? `CAREER ASPIRATIONS\n${profile.targetRoles.join(', ')}\n\n` : '')
      + (profile.resume?.projectsText ? `PROJECTS & EXPERIENCE\n${profile.resume.projectsText}\n` : '');
  }

  const safeFilename = `${user.name.replace(/\s+/g, '_')}_Resume.txt`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  return res.send(text);
});
