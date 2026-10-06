import os
os.environ["FORCE_TFIDF"] = "1"
from app.skills.extractor import get_extractor
from app.skills.ontology import implied_credit, canonical, canonical_list
from app.matching.scorer import match_student_to_job, recommend_roles
from app.roadmap.generator import generate_roadmap
from app.interview.engine import build_questions, evaluate_answer
from app.parsing.parser import parse_resume

SAMPLE = """Priya Kumar
priya@example.com | +91 98765 43210 | github.com/priya
SKILLS
Java, React, Node.js, MongoDB, HTML, CSS
PROJECTS
Placement Portal - Built a MERN app with React, Node.js, Express and MongoDB with JWT auth and REST APIs for 500+ users.
EDUCATION
B.Tech IT, CGPA: 8.4/10
"""

JD = "Backend developer to build Spring Boot microservices with Java, SQL databases and REST APIs. Use Git."


def test_aliases_and_ambiguity():
    assert canonical("reactjs") == "React"
    assert "Spring Boot" in get_extractor().skills("Experience with Spring Boot")
    assert "Go" not in get_extractor().skills("let's go to the rest of the plan")


def test_implied_skills():
    c = implied_credit(["Node.js", "Express.js"])
    assert c["JavaScript"] == 1.0 and abs(c["REST API"] - 0.7) < 1e-9


def test_string_inputs_are_normalized():
    assert canonical_list("Java, React") == ["Java", "React"]
    c = implied_credit("Node.js")
    assert c["Node.js"] == 1.0 and c["JavaScript"] == 1.0


def test_parse_and_match():
    p = parse_resume(SAMPLE)
    assert {"Java", "React", "Node.js", "MongoDB"} <= set(p["skills"])
    assert p["cgpa"] == 8.4 and p["hasGithub"]
    r = match_student_to_job(p["skills"], p["rawText"], p["projectsText"],
                             ["Java", "Spring Boot", "SQL", "REST API", "Git"], [], JD, p["hasGithub"])
    assert set(r["missingSkills"]) == {"Spring Boot", "SQL"}
    assert 0 <= r["score"] <= 100
    print(r)


def test_roadmap_order_respects_prereqs():
    rm = generate_roadmap(["Java", "React"], ["Spring Boot", "SQL", "REST API"], "Java Backend Developer")
    names = [s["skill"] for s in rm["steps"]]
    assert names.index("REST API") < names.index("Spring Boot") and names.index("SQL") < names.index("Spring Boot")
    assert names[-2:] == ["Capstone project", "Interview preparation"]
    print(rm["path"])


def test_roles():
    top = recommend_roles(["Java", "React", "Node.js", "MongoDB", "Express.js"], True, 3)
    assert top[0]["role"].startswith("Full Stack")


def test_interview():
    qs = build_questions("technical", ["Java", "SQL"], 4, seed=1)
    assert len(qs) == 4 and all("options" in q for q in qs)
    good = evaluate_answer(1, 1, ["A", "B", "C", "D"], "Explanation")
    bad = evaluate_answer(0, 1, ["A", "B", "C", "D"], "Explanation")
    assert good["isCorrect"] is True and bad["isCorrect"] is False
    assert good["score"] > bad["score"]
