"""Personalised learning roadmap = topological sort over the skill prerequisite graph."""
import heapq
from ..skills.ontology import canonical, canonical_list, implied_credit, load_ontology

KNOWN_THRESHOLD = 0.9  # a skill counts as 'already known' if credit >= this


def generate_roadmap(student_skills, missing_skills, target_title="your target role",
                     job_required=None, hours_per_week=10) -> dict:
    onto = load_ontology()
    student_skills = canonical_list(student_skills)
    missing_skills = canonical_list(missing_skills)
    known_credit = implied_credit(student_skills)
    known = {s for s, c in known_credit.items() if c >= KNOWN_THRESHOLD}

    # 1. collect every skill to learn = missing + their unmet prerequisites (transitively)
    to_learn, stack = {}, [(canonical(s), "required for the role") for s in missing_skills]
    while stack:
        s, why = stack.pop()
        if s in to_learn or s in known or s not in onto:
            if s not in onto and s not in to_learn and s not in known:
                to_learn[s] = why  # unknown skill: still show it, without graph info
            continue
        to_learn[s] = why
        for p in onto[s]["prereqs"]:
            stack.append((p, f"prerequisite of {s}"))

    # 2. Kahn topological sort, ties broken by (level, name) so easy things come first
    indeg = {s: 0 for s in to_learn}
    children = {s: [] for s in to_learn}
    for s in to_learn:
        for p in onto.get(s, {}).get("prereqs", []):
            if p in to_learn:
                indeg[s] += 1
                children[p].append(s)
    key = lambda s: (onto.get(s, {}).get("level", 3), s)
    heap = [(key(s), s) for s, d in indeg.items() if d == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        _, s = heapq.heappop(heap)
        order.append(s)
        for c in children[s]:
            indeg[c] -= 1
            if indeg[c] == 0:
                heapq.heappush(heap, (key(c), c))

    steps, total = [], 0
    for i, s in enumerate(order, 1):
        info = onto.get(s, {})
        hrs = info.get("hours", 20)
        total += hrs
        steps.append({
            "id": f"s{i}", "order": i, "type": "learn", "skill": s, "status": "todo",
            "hours": hrs, "reason": to_learn[s],
            "resources": [{"title": f"{s} - official / recommended learning path", "url": info["resource"]}] if info.get("resource") else [],
        })
    stack_names = ", ".join((job_required or [])[:5]) or "the target stack"
    n = len(steps)
    steps.append({"id": f"s{n+1}", "order": n + 1, "type": "project", "skill": "Capstone project", "status": "todo", "hours": 40,
                  "reason": f"Build one end-to-end project using {stack_names} and host it on GitHub with a README.",
                  "resources": []})
    steps.append({"id": f"s{n+2}", "order": n + 2, "type": "interview", "skill": "Interview preparation", "status": "todo", "hours": 15,
                  "reason": f"Practice technical + HR questions for {target_title} in the Interview module.",
                  "resources": []})
    total += 55
    return {
        "target": target_title, "steps": steps, "totalHours": total,
        "estimatedWeeks": max(1, round(total / max(1, hours_per_week))),
        "path": " -> ".join([s["skill"] for s in steps]),
    }
