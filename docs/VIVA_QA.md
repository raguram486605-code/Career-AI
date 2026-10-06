# Viva / interview cheat-sheet

**Problem statement?** Students do not know which roles fit them or what to learn; placement cells
shortlist manually. The system compares resume skills with job requirements, explains the gap and
proposes a roadmap, while giving admins ranked candidate lists.

**Why separate Node and FastAPI services?** Node handles auth, CRUD and business rules; Python has
the NLP/ML ecosystem. They deploy and scale independently and communicate over REST.

**How is the match score computed?** 60% required-skill coverage (direct = 1.0, implied via ontology
= edge weight), 25% semantic similarity of resume text vs job text, 15% evidence of the skills in
projects. Weights are named constants in `matching/scorer.py` and are easy to justify or tune.

**What is NLP here?** Text extraction, section segmentation, alias-normalised skill entity
extraction with overlap resolution, and sentence-embedding (or TF-IDF) cosine similarity.

**Is it machine learning?** The embedding model is a pretrained transformer used for similarity;
coverage and roadmap logic are deterministic and explainable by design. Future work: train a
supervised model on historical placement outcomes (features: coverage, CGPA, interview score).

**Limitations?** Ontology coverage (72 skills); scanned-image PDFs unsupported; keyword-based
interview scoring is a heuristic; match score is not a prediction of selection.

**How do you avoid bias/misuse?** Admins see explanations (matched/missing skills), final decisions
stay human; CGPA/branch eligibility is a separate, transparent filter.

**How does the roadmap ordering work?** Missing skills plus their prerequisites form a DAG; Kahn's
algorithm gives a valid learning order and ties are broken by difficulty level.

**Security?** bcrypt, JWT, role middleware, upload type/size limits, Helmet, rate limiting,
CORS allow-list, interview answers keys hidden from the client.

**Scalability?** Admin matching runs with limited concurrency; for thousands of students, cache
embeddings per student/job and move scoring to a background queue.
