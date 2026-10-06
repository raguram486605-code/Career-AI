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
    ['Lakshmi N', 'lakshmi@college.edu', 8.4, ['Java', 'React', 'Node.js', 'MongoDB', 'Git', 'HTML', 'CSS']],
    ['Arun K', 'arun@college.edu', 7.2, ['Python', 'Pandas', 'NumPy', 'SQL', 'Excel', 'Data Visualization']],
    ['Divya S', 'divya@college.edu', 9.0, ['Java', 'Spring Boot', 'SQL', 'REST API', 'Git', 'Hibernate', 'OOP']],
    ['Karthik R', 'karthik@college.edu', 6.5, ['JavaScript', 'React', 'HTML', 'CSS', 'Tailwind CSS']],
    ['Meena P', 'meena@college.edu', 8.0, ['Python', 'Machine Learning', 'scikit-learn', 'Pandas', 'NumPy', 'Statistics']],
  ];
  for (const [name, email, cgpa, skills] of students) {
    const u = await User.create({ name, email, passwordHash: studentPw, role: 'student', status: 'approved' });
    await StudentProfile.create({ userId: u._id, branch: 'IT', cgpa, skills, graduationYear: 2026 });
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
  await Job.insertMany([
    { companyId: zoho._id, title: 'Java Backend Developer', description: 'Build scalable Java services with Spring Boot, SQL databases and REST APIs.', requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST API', 'Git'], niceToHave: ['Hibernate', 'Docker'], minCGPA: 7, deadline: inDays(30) },
    { companyId: freshworks._id, title: 'Full Stack Developer (MERN)', description: 'Develop web apps using React, Node.js, Express and MongoDB.', requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST API', 'Git'], niceToHave: ['TypeScript', 'Docker'], minCGPA: 7, deadline: inDays(25) },
    { companyId: tcs._id, title: 'Data Analyst Trainee', description: 'Analyse data with SQL and Excel, build dashboards and reports.', requiredSkills: ['SQL', 'Excel', 'Data Analysis', 'Data Visualization'], niceToHave: ['Python', 'Power BI'], minCGPA: 6, deadline: inDays(20) },
    { companyId: freshworks._id, title: 'Machine Learning Engineer', description: 'Train and deploy ML models in Python for customer analytics.', requiredSkills: ['Python', 'Machine Learning', 'scikit-learn', 'Pandas', 'Statistics'], niceToHave: ['Deep Learning', 'Docker'], minCGPA: 7.5, deadline: inDays(35) },
    { companyId: tcs._id, title: 'Frontend Developer', description: 'Create responsive UIs with React, HTML, CSS.', requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'], niceToHave: ['Tailwind CSS', 'Testing'], minCGPA: 6, deadline: inDays(15) },
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
