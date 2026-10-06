"""
Explainable match scoring.

    Score = 0.60 * required-skill coverage
          + 0.25 * semantic similarity (resume text vs job description)
          + 0.15 * project / experience relevance

Coverage gives full credit for a directly listed skill and partial credit
for skills IMPLIED by the ontology (Express.js -> REST API at 0.7, ...).
"""
from ..skills.ontology import canonical, canonical_list, implied_credit, load_ontology, load_roles
from ..skills.extractor import get_extractor
from .embedder import calibrated_similarity, get_embedder

W_COVERAGE, W_SEMANTIC, W_PROJECTS = 0.60, 0.25, 0.15
IMPLIED_MIN = 0.3  # credits below this are ignored (too weak to count)


def skill_coverage(student_skills, required, nice=None) -> dict:
    required, nice = canonical_list(required), canonical_list(nice or [])
    credit = implied_credit(student_skills)
    direct = {c.lower() for c in canonical_list(student_skills)}

    def split(skills):
        matched, implied, missing, total = [], [], [], 0.0
        for s in skills:
            c = credit.get(s, 0.0)
            if s.lower() in direct:
                matched.append(s); total += 1.0
            elif c >= IMPLIED_MIN:
                via = _implied_via(s, direct)
                implied.append({"skill": s, "credit": round(c, 2), "via": via}); total += c
            else:
                missing.append(s)
        return matched, implied, missing, total

    m, i, miss, tot = split(required)
    nm, ni, nmiss, ntot = split(nice)
    return {
        "coverage": tot / len(required) if required else 1.0,
        "matched": m, "implied": i, "missing": miss,
        "niceMatched": nm + [x["skill"] for x in ni], "niceMissing": nmiss,
        "niceCoverage": ntot / len(nice) if nice else 0.0,
    }


def _implied_via(target, direct_lower):
    onto = load_ontology()
    best, best_w = None, 0
    for name, info in onto.items():
        if name.lower() in direct_lower and target in info.get("implies", {}):
            if info["implies"][target] > best_w:
                best, best_w = name, info["implies"][target]
    return best


def project_relevance(project_skills, required, resume_text="") -> float:
    """Share of required skills that are evidenced in projects/experience (direct or implied)."""
    required = canonical_list(required)
    if not required:
        return 0.0
    credit = implied_credit(project_skills)
    return sum(1 for r in required if credit.get(r, 0) >= IMPLIED_MIN) / len(required)


def match_student_to_job(student_skills, resume_text, project_text, job_required, job_nice,
                         job_description, has_github=False, embedder=None) -> dict:
    skills = canonical_list(student_skills)
    if has_github and "git" not in {s.lower() for s in skills}:
        skills.append("GitHub")  # a GitHub link implies Git at 0.8 via the ontology

    cov = skill_coverage(skills, job_required, job_nice)
    jd_text = (job_description or "") + " " + " ".join(job_required or []) + " " + " ".join(job_nice or [])
    raw_sim, sim = calibrated_similarity(resume_text or " ".join(skills), jd_text, embedder)
    proj_skills = get_extractor().skills(project_text or "")
    proj = project_relevance(proj_skills, job_required)

    score = W_COVERAGE * cov["coverage"] + W_SEMANTIC * sim + W_PROJECTS * proj
    emb = embedder or get_embedder()
    return {
        "score": round(score * 100, 1),
        "breakdown": {
            "coverage": round(cov["coverage"] * 100, 1),
            "semantic": round(sim * 100, 1),
            "projects": round(proj * 100, 1),
            "weights": {"coverage": W_COVERAGE, "semantic": W_SEMANTIC, "projects": W_PROJECTS},
            "rawSimilarity": round(raw_sim, 3),
            "embedder": emb.name,
        },
        "matchedSkills": cov["matched"],
        "impliedSkills": cov["implied"],
        "missingSkills": cov["missing"],
        "niceToHaveMatched": cov["niceMatched"],
        "niceToHaveMissing": cov["niceMissing"],
        "verdict": verdict(score * 100),
    }


def verdict(s: float) -> str:
    if s >= 75: return "Strong match - apply now"
    if s >= 55: return "Good match - close a few gaps"
    if s >= 35: return "Partial match - follow the roadmap first"
    return "Low match - build foundations first"


def recommend_roles(student_skills, has_github=False, top_n=5) -> list:
    """Rank predefined roles by weighted coverage (required 80% / nice-to-have 20%)."""
    skills = canonical_list(student_skills) + (["GitHub"] if has_github else [])
    out = []
    for role, d in load_roles().items():
        c = skill_coverage(skills, d["required"], d["nice"])
        s = 0.8 * c["coverage"] + 0.2 * c["niceCoverage"]
        out.append({
            "role": role, "score": round(s * 100, 1),
            "matched": c["matched"], "implied": [x["skill"] for x in c["implied"]],
            "missing": c["missing"], "niceMissing": c["niceMissing"],
        })
    out.sort(key=lambda r: -r["score"])
    return out[:top_n]
