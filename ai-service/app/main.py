
"""FastAPI AI service: parsing, skill extraction, matching, roadmap, interview."""
from typing import List, Optional
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .parsing.parser import extract_text, parse_resume
from .skills.extractor import get_extractor
from .skills.ontology import canonical_list, load_ontology, load_roles
from .matching.scorer import match_student_to_job, recommend_roles
from .matching.embedder import get_embedder
from .roadmap.generator import generate_roadmap
from .interview.engine import build_questions, evaluate_answer

app = FastAPI(title="Career AI - AI Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class TextIn(BaseModel):
    text: str


class MatchIn(BaseModel):
    studentSkills: List[str]
    resumeText: str = ""
    projectsText: str = ""
    hasGithub: bool = False
    jobRequired: List[str]
    jobNiceToHave: List[str] = []
    jobDescription: str = ""


class RolesIn(BaseModel):
    studentSkills: List[str]
    hasGithub: bool = False
    topN: int = 5


class RoadmapIn(BaseModel):
    studentSkills: List[str]
    missingSkills: List[str]
    targetTitle: str = "your target role"
    jobRequired: List[str] = []
    hoursPerWeek: int = Field(10, ge=1, le=80)


class QuestionsIn(BaseModel):
    type: str = "technical"          # technical | hr | aptitude
    skills: List[str] = []
    count: int = Field(6, ge=1, le=100)


class EvalIn(BaseModel):
    selectedOption: int
    correctOption: int
    options: List[str] = []
    explanation: str = ""


@app.get("/health")
def health():
    return {"status": "ok", "embedder": get_embedder().name, "skills": len(load_ontology())}


@app.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(413, "File too large (max 5 MB)")
    try:
        text = extract_text(data, file.filename)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(422, f"Could not read file: {e}")
    if len(text.strip()) < 30:
        raise HTTPException(422, "No readable text found (scanned image PDFs are not supported).")
    return parse_resume(text)


@app.post("/extract-skills")
def extract_skills(body: TextIn):
    counts = get_extractor().extract(body.text)
    return {"skills": sorted(counts, key=lambda k: -counts[k]), "evidence": counts}


@app.post("/normalize-skills")
def normalize(body: List[str]):
    return {"skills": canonical_list(body)}


@app.post("/match")
def match(body: MatchIn):
    return match_student_to_job(body.studentSkills, body.resumeText, body.projectsText, body.jobRequired,
                                body.jobNiceToHave, body.jobDescription, body.hasGithub)


@app.post("/recommend-roles")
def roles(body: RolesIn):
    return {"roles": recommend_roles(body.studentSkills, body.hasGithub, body.topN)}


@app.post("/roadmap")
def roadmap(body: RoadmapIn):
    return generate_roadmap(body.studentSkills, body.missingSkills, body.targetTitle, body.jobRequired, body.hoursPerWeek)


@app.post("/interview/questions")
def questions(body: QuestionsIn):
    return {"questions": build_questions(body.type, body.skills, body.count)}


@app.post("/interview/evaluate")
def evaluate(body: EvalIn):
    return evaluate_answer(body.selectedOption, body.correctOption, body.options, body.explanation)


@app.get("/skills")
def all_skills():
    return {"skills": [{"name": k, "category": v["category"]} for k, v in load_ontology().items()],
            "roles": list(load_roles().keys())}
