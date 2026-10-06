# REST API (Node, base `/api`)

All routes except `/auth/*` and `/health` need `Authorization: Bearer <token>`.

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | /health | - | API + AI-service status |
| POST | /auth/register | - | `{name,email,password,branch,cgpa}` -> student |
| POST | /auth/login | - | `{email,password}` -> `{token,user}` |
| GET | /auth/me | any | current user |
| GET | /skills | any | skill list + role list (from AI service) |
| GET/PUT | /student/profile | student | view / update profile and skills |
| POST | /student/resume | student | multipart field `resume`; parses, extracts skills, scores quality |
| GET | /student/recommendations | student | `{roles[], jobs[]}` ranked by match |
| GET | /student/jobs/:jobId/match | student | full match explanation |
| POST | /student/jobs/:jobId/apply | student | apply (checks CGPA/branch, stores score) |
| GET | /student/applications | student | my applications |
| GET | /student/progress | student | summary + timeline for charts |
| POST | /roadmaps | student | `{jobId}` or `{role, hoursPerWeek}` |
| GET | /roadmaps | student | my roadmaps |
| PATCH | /roadmaps/:id/steps/:stepId | student | `{status: todo|in_progress|done}` |
| DELETE | /roadmaps/:id | student | delete |
| POST | /interviews | student | `{type: technical|hr, count}` start session |
| POST | /interviews/:id/answer | student | `{questionId, answer}` -> score + feedback |
| GET | /interviews, /interviews/:id | student | history / one session |
| GET | /admin/analytics | admin | KPIs and chart data |
| GET | /admin/students | admin | all student profiles |
| CRUD | /admin/companies[/:id] | admin | companies |
| CRUD | /admin/jobs[/:id] | admin | jobs |
| GET | /admin/jobs/:id/matches?onlyEligible=&minScore= | admin | AI-ranked students |
| GET | /admin/jobs/:id/applicants | admin | applicants of a job |
| PATCH | /admin/applications/:id/status | admin | `{status}`; use id `new` with `{studentId,jobId}` to shortlist a non-applicant |
| GET | /admin/shortlisted | admin | shortlisted + selected |
| GET | /admin/reports/{students,applications,shortlisted}.csv | admin | CSV downloads |

# AI service (FastAPI, `:8000`, docs at `/docs`)

`POST /parse-resume` (file) - `POST /extract-skills` - `POST /match` - `POST /recommend-roles` -
`POST /roadmap` - `POST /interview/questions` - `POST /interview/evaluate` - `GET /skills` - `GET /health`

Example `/match` request:
```json
{"studentSkills":["Java","React","Node.js","MongoDB"],
 "resumeText":"...", "projectsText":"...", "hasGithub":true,
 "jobRequired":["Java","Spring Boot","SQL","REST API","Git"],
 "jobDescription":"Backend developer ..."}
```
Response: `score`, `breakdown{coverage,semantic,projects,weights,embedder}`, `matchedSkills`,
`impliedSkills[{skill,credit,via}]`, `missingSkills`, `verdict`.

# MongoDB collections
users, studentprofiles, companies, jobs, applications (unique studentId+jobId), roadmaps,
interviewsessions, progresssnapshots.
