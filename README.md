# CareerAI - AI-Powered Smart Career & Placement Recommendation System

A three-service web application that analyses a student's resume with NLP, recommends job roles,
scores the match against real job posts, detects skill gaps, generates a learning roadmap, and
runs mock interviews. Placement officers get an admin console with matching, shortlisting,
analytics and CSV reports.

```
React + Vite + Tailwind + Recharts   (client/    :5173)
        |  REST + JWT
Node + Express + Mongoose            (server/    :5000)  -- MongoDB
        |  HTTP
FastAPI AI service                   (ai-service/:8000)
   pdfplumber / python-docx / ontology NLP / sentence-transformers (or TF-IDF fallback)
```

## Features

**Student:** profile; resume upload (PDF/DOCX/TXT); AI resume analysis + quality checklist; skill
extraction; role recommendations; match score with full explanation; skill-gap detection;
personalised roadmap with progress tracking; technical + HR mock interviews with feedback;
progress charts; apply to jobs.

**Admin:** analytics dashboard (placement rate, skill demand vs supply, status mix, score
distribution); company CRUD; job CRUD; AI ranking of all students for a job with CGPA/branch
filters; shortlist/select/reject; CSV reports (students, applications, shortlisted).

## Quick start

Prerequisites: Node 18+, Python 3.10+, MongoDB (local, Docker, or Atlas).

```bash
# 1. AI service
cd ai-service
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
#   Lightweight option: remove the sentence-transformers line and set FORCE_TFIDF=1
uvicorn app.main:app --reload --port 8000

# 2. Backend
cd server
cp .env.example .env            # set MONGO_URI and a long random JWT_SECRET
npm install
npm run seed                    # demo admin, companies, jobs, students
npm run dev

# 3. Frontend
cd client
cp .env.example .env
npm install
npm run dev                     # http://localhost:5173
```

Or everything at once: `docker compose up --build` then
`docker compose exec server npm run seed`.

Demo logins (after seeding, password `password123`): `admin@college.edu` (admin),
`lakshmi@college.edu`, `arun@college.edu`, `divya@college.edu` (students).
Try `ai-service/sample_resume.txt` on the Profile page.

### Run the AI tests (no extra packages needed for the core logic)

```bash
cd ai-service && FORCE_TFIDF=1 python -m pytest -q tests
```

## How the AI works (what to explain in a viva)

1. **Parsing** (`parsing/parser.py`): pdfplumber / python-docx -> text; a section splitter finds
   Skills, Projects, Experience, Education; regexes pull email, phone, CGPA, GitHub link.
2. **Skill extraction** (`skills/extractor.py`): 72-skill ontology with aliases (`reactjs` ->
   React). Longest alias wins so "Spring Boot" is not also counted as "Spring". Ambiguous words
   (`Go`, `C`, `REST`, `react`, `rest`) only match in their skill-like casing.
3. **Implied skills** (`skills/ontology.py`): weighted edges, e.g. Express.js -> REST API (0.7),
   Node.js -> JavaScript (1.0), GitHub -> Git (0.8). Credit = product of weights along the best path.
4. **Match score** (`matching/scorer.py`):
   `0.60 x required-skill coverage + 0.25 x semantic similarity + 0.15 x project relevance`.
   Semantic similarity uses sentence-transformers (MiniLM) cosine, or a TF-IDF cosine fallback,
   calibrated to 0-1. Project relevance = share of required skills evidenced in the Projects/Experience sections.
5. **Role recommendation**: the same coverage function against 11 predefined roles
   (80% required, 20% nice-to-have).
6. **Roadmap** (`roadmap/generator.py`): missing skills + their unmet prerequisites, ordered by
   Kahn's topological sort (ties broken by difficulty level), then a capstone project and interview prep.
7. **Interview** (`interview/`): question bank keyed by skill; answers scored on keyword coverage
   (60%), length (25%), structure/examples or STAR (15%). If `ANTHROPIC_API_KEY` is set, an LLM adds
   a model answer and coaching feedback.

### Honest notes about the scores
- The early example in the project brief ("72% match") was illustrative. With this formula a
  student with only Java, React, Node.js, MongoDB against Java + Spring Boot + SQL + REST API + Git scores
  roughly **17%**; if the resume also mentions Express, REST APIs and a GitHub link it is about **40%**
  (see `tests/test_core.py`). Do not tune weights to hit a number; explain the formula instead.
- The TF-IDF fallback gives lower semantic scores than sentence-transformers; the response shows which embedder was used.
- Roadmap order comes from the dependency graph: for the example it yields
  REST API -> SQL -> Spring Boot -> project -> interview (Spring Boot needs Java, REST API and SQL first).
- The skill ontology is a JSON file (`ai-service/app/data/ontology.json`), not a MongoDB collection;
  this keeps the AI service stateless. Extend it by adding entries.

## Project layout

```
career-ai/
  ai-service/   app/{parsing,skills,matching,roadmap,interview,data}, tests/, Dockerfile
  server/       src/{config,models,controllers,routes,middleware,services,utils}
  client/       src/{api,context,components,pages/{student,admin}}
  docs/         API.md, DEPLOYMENT.md, VIVA_QA.md
  docker-compose.yml
```

## Security notes
- Passwords are bcrypt-hashed; JWT in `Authorization: Bearer`; role middleware on every route.
- Admin accounts cannot be self-registered (unless `ALLOW_ADMIN_SIGNUP=true`, dev only). Create admins via seed or the database.
- Uploads limited to 5 MB and PDF/DOCX/TXT; files are processed in memory and only extracted text is stored.
- Interview keywords are never sent to the browser. Helmet, CORS allow-list and auth rate-limiting are enabled.
- For production, store the JWT in an httpOnly cookie instead of localStorage, and restrict the AI service to private network access.

## Ideas to extend
Email notifications on shortlist; company-facing login; PDF export of the roadmap; resume-vs-JD
keyword highlighting; more roles/skills; fine-tuned skill NER model; unit tests for the Node API (Jest + supertest).
