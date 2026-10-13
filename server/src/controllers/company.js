const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');
const InterviewSession = require('../models/InterviewSession');
const ai = require('../services/aiClient');
const mailer = require('../services/mailer');
const { matchOne, matchMany, eligible } = require('../services/matching');
const h = require('../utils/asyncHandler');

// 0. List Jobs for Company Recruiter
exports.listJobs = h(async (req, res) => {
  let query = {};
  if (req.user.companyId) {
    query = { companyId: req.user.companyId };
  }
  let jobs = await Job.find(query).sort('-createdAt').populate('companyId', 'name location package website');
  // Fallback if company has no specific jobs yet
  if (!jobs.length) {
    jobs = await Job.find({ status: 'open' }).sort('-createdAt').populate('companyId', 'name location package website');
  }

  // Count applicants for each job
  const counts = await Application.aggregate([
    { $match: { jobId: { $in: jobs.map(j => j._id) } } },
    { $group: { _id: '$jobId', count: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));

  res.json({
    jobs: jobs.map(j => ({
      ...j.toObject(),
      applicantsCount: countMap[String(j._id)] || 0,
    }))
  });
});

// Create Job (Company Recruiter)
exports.createJob = h(async (req, res) => {
  let companyId = req.user.companyId;
  if (!companyId) {
    let comp = await Company.findOne({ contactEmail: req.user.email });
    if (!comp) {
      comp = await Company.create({
        name: req.user.name || 'Company',
        contactEmail: req.user.email,
        contactName: req.user.name,
        status: 'approved',
      });
    }
    req.user.companyId = comp._id;
    await req.user.save();
    companyId = comp._id;
  }

  const { title, description, requiredSkills, niceToHave, minCGPA, allowedBranches, salary, location, deadline, status } = req.body;
  if (!title) return res.status(400).json({ message: 'Job title is required' });

  const parseArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []);

  const job = await Job.create({
    companyId,
    title,
    description: description || '',
    requiredSkills: parseArray(requiredSkills),
    niceToHave: parseArray(niceToHave),
    minCGPA: minCGPA ? Number(minCGPA) : 0,
    allowedBranches: parseArray(allowedBranches),
    salary: salary || '',
    location: location || '',
    deadline: deadline ? new Date(deadline) : null,
    status: status || 'open',
  });

  const populated = await Job.findById(job._id).populate('companyId', 'name location package website');
  res.status(201).json({ job: populated, message: 'Job opening posted successfully' });
});

// Update Job (Company Recruiter)
exports.updateJob = h(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job opening not found' });

  if (req.user.role !== 'admin' && req.user.companyId && String(job.companyId) !== String(req.user.companyId)) {
    return res.status(403).json({ message: 'Unauthorized to modify this job opening' });
  }

  const { title, description, requiredSkills, niceToHave, minCGPA, allowedBranches, salary, location, deadline, status } = req.body;
  const parseArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []);

  if (title !== undefined) job.title = title;
  if (description !== undefined) job.description = description;
  if (requiredSkills !== undefined) job.requiredSkills = parseArray(requiredSkills);
  if (niceToHave !== undefined) job.niceToHave = parseArray(niceToHave);
  if (minCGPA !== undefined) job.minCGPA = Number(minCGPA);
  if (allowedBranches !== undefined) job.allowedBranches = parseArray(allowedBranches);
  if (salary !== undefined) job.salary = salary;
  if (location !== undefined) job.location = location;
  if (deadline !== undefined) job.deadline = deadline ? new Date(deadline) : null;
  if (status !== undefined) job.status = status;

  await job.save();
  const populated = await Job.findById(job._id).populate('companyId', 'name location package website');
  res.json({ job: populated, message: 'Job opening updated successfully' });
});

// Delete Job (Company Recruiter)
exports.deleteJob = h(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job opening not found' });

  if (req.user.role !== 'admin' && req.user.companyId && String(job.companyId) !== String(req.user.companyId)) {
    return res.status(403).json({ message: 'Unauthorized to delete this job opening' });
  }

  await Promise.all([
    Job.deleteOne({ _id: job._id }),
    Application.deleteMany({ jobId: job._id }),
  ]);

  res.json({ ok: true, message: 'Job opening deleted successfully' });
});

// Export all applicant student details for this company (CSV)
exports.exportApplicants = h(async (req, res) => {
  let query = {};
  if (req.user.companyId) {
    query = { companyId: req.user.companyId };
  }
  const comp = req.user.companyId ? await Company.findById(req.user.companyId) : null;
  const compName = comp?.name || req.user.name || 'Company';

  const jobs = await Job.find(query);
  const jobIds = jobs.map(j => j._id);
  const jobMap = Object.fromEntries(jobs.map(j => [String(j._id), j]));

  const apps = await Application.find({ jobId: { $in: jobIds } })
    .populate('studentId', 'name email')
    .sort('-createdAt');

  const studentIds = apps.map(a => a.studentId?._id).filter(Boolean);
  const profiles = await StudentProfile.find({ userId: { $in: studentIds } });
  const profileMap = Object.fromEntries(profiles.map(p => [String(p.userId), p]));

  const csv = (rows) => rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

  const rows = [
    [
      'Candidate Name',
      'Email',
      'Phone',
      'Roll Number',
      'Branch',
      'Graduation Year',
      'CGPA',
      'Job Title',
      'Job Package',
      'Match Score (%)',
      'Application Status',
      'Skills',
      'Missing Skills',
      'Resume Uploaded',
      'Interview Rounds',
      'Applied Date'
    ]
  ];

  apps.forEach(a => {
    const sId = a.studentId?._id ? String(a.studentId._id) : '';
    const prof = profileMap[sId];
    const j = jobMap[String(a.jobId)];
    const rounds = (a.interviewRounds || []).map(r => `${r.roundType} (${r.status}${r.score != null ? `, score: ${r.score}` : ''})`).join('; ');

    rows.push([
      a.studentId?.name || 'N/A',
      a.studentId?.email || 'N/A',
      prof?.phone || 'N/A',
      prof?.rollNo || 'N/A',
      prof?.branch || 'N/A',
      prof?.graduationYear || 'N/A',
      prof?.cgpa != null ? prof.cgpa : 'N/A',
      j?.title || 'N/A',
      j?.salary || j?.companyId?.package || 'N/A',
      a.matchScore != null ? a.matchScore : 'N/A',
      a.status || 'applied',
      (prof?.skills || []).join(', '),
      (a.missingSkills || []).join(', '),
      (prof?.resume?.uploadedAt || prof?.resume?.text) ? 'Yes' : 'No',
      rounds || 'None scheduled',
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'
    ]);
  });

  const safeFilename = `${compName.replace(/[^a-zA-Z0-9]/g, '_')}_Applicants_Report.csv`;
  res.header('Content-Type', 'text/csv');
  res.attachment(safeFilename);
  res.send(csv(rows));
});

// 1. Company candidate matching view
exports.jobMatches = h(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('companyId', 'name');
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const profiles = await StudentProfile.find().populate('userId', 'name email');
  const apps = await Application.find({ jobId: job._id }).populate('interviewRounds.sessionId');
  const appMap = Object.fromEntries(apps.map(a => [String(a.studentId), a]));

  const rows = await matchMany(profiles, async (p) => {
    const m = await matchOne(p, job);
    const el = eligible(p, job);
    const app = appMap[String(p.userId._id)];
    return {
      studentId: p.userId._id,
      name: p.userId.name,
      email: p.userId.email,
      phone: p.phone || '',
      rollNo: p.rollNo || '',
      branch: p.branch,
      cgpa: p.cgpa,
      graduationYear: p.graduationYear || 2026,
      skills: p.skills || [],
      hasResume: Boolean(p.resume?.text || p.resume?.fileData),
      resumeFileName: p.resume?.fileName || '',
      resumeUploadedAt: p.resume?.uploadedAt || null,
      resumeQuality: p.resume?.quality?.score || null,
      score: m.score,
      breakdown: m.breakdown,
      matched: m.matchedSkills,
      missing: m.missingSkills,
      eligible: el.ok,
      eligibilityNotes: el.reasons,
      applicationId: app?._id || null,
      status: app?.status || null,
      appliedAt: app?.createdAt || null,
      interviewRounds: app?.interviewRounds || [],
    };
  });

  const out = rows.sort((a, b) => b.score - a.score);
  res.json({ job, students: out });
});

// 2. Set Status (Company Only)
exports.setStatus = h(async (req, res) => {
  const { status, studentId, jobId } = req.body;
  if (!['applied', 'shortlisted', 'rejected', 'selected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let app = req.params.id !== 'new' ? await Application.findById(req.params.id) : null;
  if (!app && studentId && jobId) {
    const [p, job] = await Promise.all([StudentProfile.findOne({ userId: studentId }), Job.findById(jobId)]);
    const m = await matchOne(p, job);
    app = await Application.findOneAndUpdate(
      { studentId, jobId },
      { $setOnInsert: { matchScore: m.score, breakdown: m.breakdown, missingSkills: m.missingSkills } },
      { upsert: true, new: true }
    );
  }

  if (!app) return res.status(404).json({ message: 'Application not found' });
  app.status = status;
  await app.save();
  res.json({ application: app });
});

// 3. Create Interview Round (Decided manually by Company Users, strictly 3 available rounds)
exports.createInterviewRound = h(async (req, res) => {
  const { roundType, meetingDate, meetingTime, meetingLink, interviewerName, instructions, studentId, jobId } = req.body;

  // Allowed round types: strictly 3 rounds
  const ALLOWED_ROUNDS = {
    aptitude: { label: 'Aptitude (50 question)', count: 50 },
    technical: { label: 'Technical Quizzes (30 questions)', count: 30 },
    one_on_one: { label: 'One on One Interview (sent the email to applicant mail)', count: 0 },
  };

  if (!ALLOWED_ROUNDS[roundType]) {
    return res.status(400).json({
      message: 'Invalid round type. Available interview rounds are only: (1) Aptitude (50 question), (2) Technical Quizzes (30 questions), (3) One on One Interview (sent the email to applicant mail).'
    });
  }

  // Find or create application
  let app = req.params.id !== 'new' ? await Application.findById(req.params.id) : null;
  if (!app && studentId && jobId) {
    const [p, job] = await Promise.all([StudentProfile.findOne({ userId: studentId }), Job.findById(jobId)]);
    const m = await matchOne(p, job);
    app = await Application.findOneAndUpdate(
      { studentId, jobId },
      { $setOnInsert: { matchScore: m.score, breakdown: m.breakdown, missingSkills: m.missingSkills } },
      { upsert: true, new: true }
    );
  }

  if (!app) return res.status(404).json({ message: 'Application not found' });

  // Enforce round constraints:
  // 1. Max 3 rounds
  if ((app.interviewRounds || []).length >= 3) {
    return res.status(400).json({
      message: 'Interview rounds are limited to a maximum of 3 rounds only (Aptitude, Technical Quizzes, One on One).'
    });
  }

  // 2. Cannot repeat the exact same round
  const existing = (app.interviewRounds || []).find(r => r.roundType === roundType);
  if (existing) {
    return res.status(400).json({
      message: `The '${ALLOWED_ROUNDS[roundType].label}' round has already been created for this applicant.`
    });
  }

  const job = await Job.findById(app.jobId).populate('companyId');
  const studentUser = await User.findById(app.studentId);
  const roundConfig = ALLOWED_ROUNDS[roundType];

  let roundData = {
    roundType,
    roundLabel: roundConfig.label,
    questionCount: roundConfig.count,
    status: 'scheduled',
    scheduledBy: req.user._id,
    scheduledAt: new Date(),
  };

  if (roundType === 'aptitude') {
    // Generate 50 Aptitude questions
    let questions = [];
    try {
      questions = await ai.questions({ type: 'aptitude', count: 50 });
    } catch {
      // Fallback in case of external call timeout
      questions = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        question: `Aptitude Assessment Question ${i + 1}: Solve numerical and logical problem.`,
        category: 'Aptitude',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOption: 0,
        explanation: 'Standard aptitude evaluation problem.',
      }));
    }

    const session = await InterviewSession.create({
      studentId: app.studentId,
      type: 'aptitude',
      jobId: app.jobId,
      applicationId: app._id,
      roundType: 'aptitude',
      roundLabel: roundConfig.label,
      targetCount: 50,
      timeLimitMinutes: 50, // 50 mins timing
      attemptStatus: 'not_started',
      locked: false,
      questions,
    });

    roundData.sessionId = session._id;
    roundData.timeLimitMinutes = 50;
  } else if (roundType === 'technical') {
    // Generate 30 Technical Quiz questions
    let questions = [];
    try {
      questions = await ai.questions({
        type: 'technical',
        count: 30,
        skills: job?.requiredSkills || [],
      });
    } catch {
      questions = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        question: `Technical Quiz Question ${i + 1} on ${(job?.requiredSkills || ['Computer Science'])[i % (job?.requiredSkills?.length || 1)]}`,
        category: 'Technical',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOption: 1,
        explanation: 'Technical concept verification.',
      }));
    }

    const session = await InterviewSession.create({
      studentId: app.studentId,
      type: 'technical',
      jobId: app.jobId,
      applicationId: app._id,
      roundType: 'technical',
      roundLabel: roundConfig.label,
      targetCount: 30,
      timeLimitMinutes: 30, // 30 mins timing
      attemptStatus: 'not_started',
      locked: false,
      questions,
    });

    roundData.sessionId = session._id;
    roundData.timeLimitMinutes = 30;
  } else if (roundType === 'one_on_one') {
    // Dispatch email to applicant mail
    const companyName = job?.companyId?.name || req.user.name || 'Hiring Company';
    const emailResult = await mailer.sendOneOnOneInvite({
      applicantEmail: studentUser.email,
      applicantName: studentUser.name,
      companyName,
      jobTitle: job?.title || 'Open Position',
      meetingDate,
      meetingTime,
      meetingLink,
      interviewerName: interviewerName || req.user.name,
      instructions,
    });

    roundData.oneOnOne = {
      meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
      meetingTime: meetingTime || '10:00 AM IST',
      meetingLink: meetingLink || '',
      interviewerName: interviewerName || req.user.name,
      instructions: instructions || 'Please be on time and bring your portfolio.',
      emailSentTo: studentUser.email,
      emailSentAt: new Date(),
      emailStatus: 'sent',
      emailSubject: emailResult.subject,
    };
  }

  // Ensure applicant is marked shortlisted if currently applied
  if (app.status === 'applied') {
    app.status = 'shortlisted';
  }

  app.interviewRounds.push(roundData);
  await app.save();

  res.status(201).json({
    message: roundType === 'one_on_one'
      ? `One-on-One Interview round created and invitation email dispatched to ${studentUser.email}`
      : `${roundConfig.label} round successfully created (Time limit: ${roundData.timeLimitMinutes || 30} mins, Single Entry access).`,
    application: app,
    round: roundData,
  });
});

// 4. Review Student Re-take Request (Approve / Reject)
exports.reviewRetakeRequest = h(async (req, res) => {
  const { action } = req.body; // 'approve' | 'reject'
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found' });

  const round = app.interviewRounds.id(req.params.roundId);
  if (!round) return res.status(404).json({ message: 'Interview round not found' });

  const session = round.sessionId ? await InterviewSession.findById(round.sessionId) : null;

  if (action === 'approve') {
    // Regenerate randomized questions for fresh attempt
    let freshQuestions = [];
    const job = await Job.findById(app.jobId);
    try {
      freshQuestions = await ai.questions({
        type: round.roundType === 'aptitude' ? 'aptitude' : 'technical',
        count: round.questionCount || (round.roundType === 'aptitude' ? 50 : 30),
        skills: job?.requiredSkills || [],
      });
    } catch {
      // fallback
    }

    if (session) {
      if (freshQuestions.length) session.questions = freshQuestions;
      session.attemptStatus = 'not_started';
      session.locked = false;
      session.startedAt = null;
      session.completed = false;
      session.averageScore = 0;
      session.terminationReason = '';
      session.retakeRequest.status = 'approved';
      session.retakeRequest.reviewedAt = new Date();
      session.retakeRequest.reviewedBy = req.user._id;

      // Reset individual question evaluation state
      session.questions.forEach(q => {
        q.selectedOption = undefined;
        q.userOptionText = undefined;
        q.isCorrect = undefined;
        q.score = undefined;
        q.feedback = undefined;
      });
      await session.save();
    }

    round.status = 'scheduled';
    round.score = null;
    round.terminationReason = '';
    round.retakeRequest.status = 'approved';
    round.retakeRequest.reviewedAt = new Date();
    await app.save();

    return res.json({
      message: 'Re-take request approved! The test has been unlocked with fresh randomized questions for the candidate.',
      application: app,
    });
  } else {
    // Reject
    if (session) {
      session.retakeRequest.status = 'rejected';
      session.retakeRequest.reviewedAt = new Date();
      session.retakeRequest.reviewedBy = req.user._id;
      await session.save();
    }
    round.retakeRequest.status = 'rejected';
    round.retakeRequest.reviewedAt = new Date();
    await app.save();

    return res.json({
      message: 'Re-take request rejected.',
      application: app,
    });
  }
});
