const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const auth = require('../controllers/auth');
const student = require('../controllers/student');
const roadmap = require('../controllers/roadmap');
const interview = require('../controllers/interview');
const admin = require('../controllers/admin');
const ai = require('../services/aiClient');

router.get('/health', async (req, res) => {
  const aiStatus = await ai.health().then(d => ({ up: true, ...d })).catch(() => ({ up: false }));
  res.json({ api: 'ok', ai: aiStatus });
});

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/company-request', auth.companyRequest);
router.get('/auth/me', protect, auth.me);
router.get('/skills', protect, async (req, res, next) => ai.skills().then(d => res.json(d)).catch(next));

// Student
const S = [protect, requireRole('student')];
router.get('/student/profile', ...S, student.getProfile);
router.put('/student/profile', ...S, student.updateProfile);
router.post('/student/resume', ...S, upload.single('resume'), student.uploadResume);
router.get('/student/recommendations', ...S, student.recommendations);
router.get('/student/jobs/:jobId/match', ...S, student.jobMatch);
router.post('/student/jobs/:jobId/apply', ...S, student.apply);
router.get('/student/applications', ...S, student.myApplications);
router.get('/student/progress', ...S, student.progress);

router.post('/roadmaps', ...S, roadmap.create);
router.get('/roadmaps', ...S, roadmap.list);
router.patch('/roadmaps/:id/steps/:stepId', ...S, roadmap.updateStep);
router.delete('/roadmaps/:id', ...S, roadmap.remove);

router.post('/interviews', ...S, interview.start);
router.get('/interviews', ...S, interview.list);
router.get('/interviews/:id', ...S, interview.get);
router.post('/interviews/:id/answer', ...S, interview.answer);

// Admin
const A = [protect, requireRole('admin')];
router.get('/admin/analytics', ...A, admin.analytics);
router.get('/admin/students', ...A, admin.students);
router.route('/admin/companies').get(...A, admin.listCompanies).post(...A, admin.createCompany);
router.route('/admin/companies/:id').put(...A, admin.updateCompany).delete(...A, admin.deleteCompany);
router.get('/admin/company-requests', ...A, admin.listCompanyRequests);
router.put('/admin/company-requests/:id/approve', ...A, admin.approveCompanyRequest);
router.put('/admin/company-requests/:id/reject', ...A, admin.rejectCompanyRequest);
router.route('/admin/jobs').get(...A, admin.listJobs).post(...A, admin.createJob);
router.route('/admin/jobs/:id').put(...A, admin.updateJob).delete(...A, admin.deleteJob);
router.get('/admin/jobs/:id/matches', ...A, admin.jobMatches);
router.get('/admin/jobs/:id/applicants', ...A, admin.jobApplicants);
router.patch('/admin/applications/:id/status', ...A, admin.setStatus);
router.get('/admin/shortlisted', ...A, admin.shortlisted);
router.get('/admin/reports/students.csv', ...A, admin.studentsReport);
router.get('/admin/reports/applications.csv', ...A, admin.applicationsReport);
router.get('/admin/reports/shortlisted.csv', ...A, admin.shortlistReport);

// Company Recruiter Endpoints
router.get('/company/jobs/:id/matches', protect, admin.jobMatches);
router.patch('/company/applications/:id/status', protect, admin.setStatus);

module.exports = router;
