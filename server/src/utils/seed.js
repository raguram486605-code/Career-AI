// npm run seed  -> demo admin, companies, jobs and students
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const connectDB = require('../config/db');

async function seedDB() {
  await Promise.all([User, StudentProfile, Company, Job, Application].map(M => M.deleteMany({})));
  const adminPw = await User.hash('RaguRaja@0021');
  const studentPw = await User.hash('password123');

  // Admin Account
  await User.create({ name: 'Raguram Admin', email: 'raguram486605@gmail.com', passwordHash: adminPw, role: 'admin', status: 'approved' });

  const students = [
    {
      name: 'Lakshmi N', email: 'lakshmi@college.edu', cgpa: 8.4, branch: 'IT', rollNo: '2022IT01', phone: '+91 98765 43210',
      skills: ['Java', 'React', 'Node.js', 'MongoDB', 'Git', 'HTML', 'CSS', 'REST API'],
      targetRoles: ['Full Stack Developer', 'Backend Developer'],
      resumeText: `LAKSHMI N\nlakshmi@college.edu | +91 98765 43210 | Chennai, India\nGitHub: github.com/lakshmi-n | LinkedIn: linkedin.com/in/lakshmi-n\n\nOBJECTIVE\nMotivated B.Tech IT student seeking a Software Engineering position where I can build responsive web applications and scalable backend systems.\n\nEDUCATION\nB.Tech in Information Technology (2022 - 2026)\nCGPA: 8.4 / 10.0\n\nTECHNICAL SKILLS\nLanguages: Java, JavaScript\nFrontend: React.js, HTML5, CSS3, Tailwind CSS\nBackend: Node.js, Express.js, RESTful APIs\nDatabases: MongoDB, SQL\nTools: Git, GitHub, Postman, VS Code\n\nPROJECTS\n1. Smart Campus Recruitment Portal\n- Developed full-stack MERN application connecting 500+ students with recruiters.\n- Built secure JWT authentication, applicant tracking workflows, and interactive dashboards.\n\n2. Real-Time Chat & Collaboration App\n- Implemented WebSocket real-time communication with React and Node.js.\n- Designed responsive UI and optimized MongoDB database queries.\n\nCERTIFICATIONS & ACHIEVEMENTS\n- Oracle Certified Associate Java SE 8 Programmer\n- 1st Place in College Hackathon 2024`
    },
    {
      name: 'Arun K', email: 'arun@college.edu', cgpa: 7.2, branch: 'IT', rollNo: '2022IT02', phone: '+91 98765 43211',
      skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Excel', 'Data Visualization', 'Machine Learning'],
      targetRoles: ['Data Analyst', 'ML Engineer'],
      resumeText: `ARUN K\narun@college.edu | +91 98765 43211 | Chennai, India\nGitHub: github.com/arun-k | LinkedIn: linkedin.com/in/arun-k\n\nSUMMARY\nAspiring Data Analyst skilled in Python, SQL data querying, statistical modeling, and interactive dashboard creation.\n\nEDUCATION\nB.Tech in Information Technology (2022 - 2026)\nCGPA: 7.2 / 10.0\n\nTECHNICAL SKILLS\nLanguages: Python, SQL\nData Analysis: Pandas, NumPy, Scipy, Excel (VLOOKUP, Pivot Tables)\nVisualization: Power BI, Matplotlib, Seaborn\n\nPROJECTS\n1. E-Commerce Sales Performance Dashboard\n- Processed 100K+ transactional records using Pandas and SQL to identify key customer drop-off points.\n- Visualized insights via interactive charts, boosting retention recommendations by 15%.\n\n2. Predictive Customer Churn Analytics\n- Built classification models in Python to predict subscriber churn with 82% precision.`
    },
    {
      name: 'Divya S', email: 'divya@college.edu', cgpa: 9.0, branch: 'IT', rollNo: '2022IT03', phone: '+91 98765 43212',
      skills: ['Java', 'Spring Boot', 'SQL', 'REST API', 'Git', 'Hibernate', 'OOP', 'Docker'],
      targetRoles: ['Java Backend Developer', 'Software Engineer'],
      resumeText: `DIVYA S\ndivya@college.edu | +91 98765 43212 | Chennai, India\nGitHub: github.com/divya-s | LinkedIn: linkedin.com/in/divya-s\n\nPROFESSIONAL SUMMARY\nHigh-performing B.Tech IT scholar with strong focus on Java enterprise systems, Spring Boot microservices, and database architecture.\n\nEDUCATION\nB.Tech in Information Technology (2022 - 2026)\nCGPA: 9.0 / 10.0 (Top 5% of Department)\n\nTECHNICAL SKILLS\nBackend: Java 17, Spring Boot, Spring Data JPA, Hibernate, REST APIs\nDatabases: MySQL, PostgreSQL, Relational Schema Design\nDevOps & Tools: Git, Maven, Docker, Postman, JUnit\n\nPROJECTS\n1. Banking Microservices Engine\n- Architected distributed ledger banking simulation in Spring Boot with PostgreSQL.\n- Achieved 99.9% uptime with idempotent REST APIs and Spring Security JWT tokens.\n\n2. High-Throughput Inventory Cache System\n- Implemented caching patterns reducing SQL query latency by 45%.`
    },
    {
      name: 'Karthik R', email: 'karthik@college.edu', cgpa: 6.5, branch: 'IT', rollNo: '2022IT04', phone: '+91 98765 43213',
      skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'Git'],
      targetRoles: ['Frontend Developer', 'UI Engineer'],
      resumeText: `KARTHIK R\nkarthik@college.edu | +91 98765 43213 | Chennai, India\nGitHub: github.com/karthik-r\n\nSUMMARY\nCreative frontend developer specializing in building modern user interfaces with React and Tailwind CSS.\n\nEDUCATION\nB.Tech in Information Technology (2022 - 2026)\nCGPA: 6.5 / 10.0\n\nTECHNICAL SKILLS\nFrontend: React, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS\nTools: Vite, Git, Figma to Code\n\nPROJECTS\n1. Designer Portfolio & Marketplace\n- Created responsive web storefront with animated interactions and theme switcher.`
    },
    {
      name: 'Meena P', email: 'meena@college.edu', cgpa: 8.0, branch: 'IT', rollNo: '2022IT05', phone: '+91 98765 43214',
      skills: ['Python', 'Machine Learning', 'scikit-learn', 'Pandas', 'NumPy', 'Statistics', 'Deep Learning'],
      targetRoles: ['Machine Learning Engineer', 'AI Specialist'],
      resumeText: `MEENA P\nmeena@college.edu | +91 98765 43214 | Chennai, India\nGitHub: github.com/meena-p | LinkedIn: linkedin.com/in/meena-p\n\nSUMMARY\nPassionate Machine Learning student with experience in predictive algorithms, statistical analysis, and NLP pipelines.\n\nEDUCATION\nB.Tech in Information Technology (2022 - 2026)\nCGPA: 8.0 / 10.0\n\nTECHNICAL SKILLS\nAI/ML: Python, scikit-learn, PyTorch, Pandas, NumPy, Matplotlib\nMethods: Supervised Learning, Random Forests, NLP tokenization, Regression\n\nPROJECTS\n1. Automated Resume Parsing & Skill Extraction\n- Built NLP pipeline extracting named entities from student CVs with 91% accuracy.\n\n2. Healthcare Risk Classification Engine\n- Trained ensemble models predicting patient triage priority based on vital statistics.`
    },
  ];

  const studentUserMap = {};
  for (const s of students) {
    const u = await User.create({ name: s.name, email: s.email, passwordHash: studentPw, role: 'student', status: 'approved' });
    studentUserMap[s.email] = u;
    await StudentProfile.create({
      userId: u._id,
      branch: s.branch,
      rollNo: s.rollNo,
      phone: s.phone,
      cgpa: s.cgpa,
      skills: s.skills,
      targetRoles: s.targetRoles,
      graduationYear: 2026,
      resume: {
        fileName: `${s.name.replace(/\s+/g, '_')}_Resume.txt`,
        uploadedAt: new Date(),
        text: s.resumeText,
        projectsText: s.resumeText.split('PROJECTS')[1] || '',
        hasGithub: true,
        quality: { score: Math.round(s.cgpa * 10), suggestions: ['Add live deployment links to projects', 'Quantify production metrics'] },
      }
    });
  }

  const [zoho, tcs, freshworks] = await Company.insertMany([
    { name: 'Zoho Corp', industry: 'Software Products', location: 'Chennai', website: 'https://www.zoho.com', package: '7-10 LPA', contactEmail: 'hr@zoho.com', status: 'approved' },
    { name: 'TCS', industry: 'IT Services', location: 'Chennai', website: 'https://www.tcs.com', package: '3.5-7 LPA', contactEmail: 'hr@tcs.com', status: 'approved' },
    { name: 'Freshworks', industry: 'SaaS', location: 'Chennai', website: 'https://www.freshworks.com', package: '8-12 LPA', contactEmail: 'hr@freshworks.com', status: 'approved' },
  ]);

  await User.create({ name: 'Zoho Recruiter', email: 'hr@zoho.com', passwordHash: studentPw, role: 'company', companyId: zoho._id, status: 'approved' });
  await User.create({ name: 'Freshworks HR', email: 'hr@freshworks.com', passwordHash: studentPw, role: 'company', companyId: freshworks._id, status: 'approved' });

  // Pending Company Request for Admin Approval Box
  const infosys = await Company.create({
    name: 'Infosys', industry: 'IT Consulting', location: 'Bengaluru', website: 'https://www.infosys.com', package: '6-8 LPA', contactEmail: 'hr@infosys.com', status: 'pending'
  });
  await User.create({
    name: 'Infosys HR', email: 'hr@infosys.com', passwordHash: studentPw, role: 'company', companyId: infosys._id, status: 'pending'
  });

  const inDays = (d) => new Date(Date.now() + d * 864e5);
  const [zohoJavaJob, freshworksMernJob, tcsDataJob, freshworksMlJob, tcsFrontendJob] = await Job.insertMany([
    { companyId: zoho._id, title: 'Java Backend Developer', description: 'Build scalable Java services with Spring Boot, SQL databases and REST APIs.', requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST API', 'Git'], niceToHave: ['Hibernate', 'Docker'], minCGPA: 7, deadline: inDays(30), status: 'open', salary: '7-10 LPA', location: 'Chennai' },
    { companyId: freshworks._id, title: 'Full Stack Developer (MERN)', description: 'Develop web apps using React, Node.js, Express and MongoDB.', requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST API', 'Git'], niceToHave: ['TypeScript', 'Docker'], minCGPA: 7, deadline: inDays(25), status: 'open', salary: '8-12 LPA', location: 'Chennai' },
    { companyId: tcs._id, title: 'Data Analyst Trainee', description: 'Analyse data with SQL and Excel, build dashboards and reports.', requiredSkills: ['SQL', 'Excel', 'Data Analysis', 'Data Visualization'], niceToHave: ['Python', 'Power BI'], minCGPA: 6, deadline: inDays(20), status: 'open', salary: '3.5-7 LPA', location: 'Chennai' },
    { companyId: freshworks._id, title: 'Machine Learning Engineer', description: 'Train and deploy ML models in Python for customer analytics.', requiredSkills: ['Python', 'Machine Learning', 'scikit-learn', 'Pandas', 'Statistics'], niceToHave: ['Deep Learning', 'Docker'], minCGPA: 7.5, deadline: inDays(35), status: 'open', salary: '10-14 LPA', location: 'Chennai' },
    { companyId: tcs._id, title: 'Frontend Developer', description: 'Create responsive UIs with React, HTML, CSS.', requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'], niceToHave: ['Tailwind CSS', 'Testing'], minCGPA: 6, deadline: inDays(15), status: 'open', salary: '4-6 LPA', location: 'Chennai' },
  ]);

  // Seed initial applications so Company Users and Admin immediately have applied students
  await Application.insertMany([
    {
      studentId: studentUserMap['lakshmi@college.edu']._id,
      jobId: zohoJavaJob._id,
      matchScore: 68,
      status: 'applied',
      missingSkills: ['Spring Boot'],
    },
    {
      studentId: studentUserMap['divya@college.edu']._id,
      jobId: zohoJavaJob._id,
      matchScore: 94,
      status: 'shortlisted',
      missingSkills: [],
    },
    {
      studentId: studentUserMap['lakshmi@college.edu']._id,
      jobId: freshworksMernJob._id,
      matchScore: 88,
      status: 'shortlisted',
      missingSkills: [],
    },
    {
      studentId: studentUserMap['karthik@college.edu']._id,
      jobId: freshworksMernJob._id,
      matchScore: 62,
      status: 'applied',
      missingSkills: ['Node.js', 'MongoDB', 'Express.js'],
    },
    {
      studentId: studentUserMap['meena@college.edu']._id,
      jobId: freshworksMlJob._id,
      matchScore: 92,
      status: 'applied',
      missingSkills: [],
    },
    {
      studentId: studentUserMap['arun@college.edu']._id,
      jobId: tcsDataJob._id,
      matchScore: 85,
      status: 'shortlisted',
      missingSkills: [],
    },
  ]);
  console.log('Seeded DB. Admin: raguram486605@gmail.com / RaguRaja@0021');
}

module.exports = seedDB;

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDB();
    await mongoose.disconnect();
  })().catch(e => { console.error(e); process.exit(1); });
}
