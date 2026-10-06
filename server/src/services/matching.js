const ai = require('./aiClient');

// Build the payload the AI service expects from a student profile + job document.
exports.payloadFor = (profile, job) => ({
  studentSkills: profile.skills || [],
  resumeText: profile.resume?.text || '',
  projectsText: profile.resume?.projectsText || '',
  hasGithub: !!profile.resume?.hasGithub,
  jobRequired: job.requiredSkills || [],
  jobNiceToHave: job.niceToHave || [],
  jobDescription: `${job.title}. ${job.description || ''}`,
});

exports.matchOne = (profile, job) => ai.match(exports.payloadFor(profile, job));

// Run matches with a small concurrency limit so we don't overload the AI service.
exports.matchMany = async (items, fn, limit = 4) => {
  const out = new Array(items.length);
  let i = 0;
  const worker = async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
};

// Hard eligibility filters (not AI): CGPA / branch.
exports.eligible = (profile, job) => {
  const reasons = [];
  if (job.minCGPA && (profile.cgpa || 0) < job.minCGPA) reasons.push(`Needs CGPA >= ${job.minCGPA}`);
  if (job.allowedBranches?.length && !job.allowedBranches.includes(profile.branch)) reasons.push(`Open to ${job.allowedBranches.join(', ')} only`);
  return { ok: reasons.length === 0, reasons };
};
