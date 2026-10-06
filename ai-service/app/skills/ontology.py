"""Skill ontology: canonical names, aliases, implied skills, prerequisites."""
import json
import re
from functools import lru_cache
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"


@lru_cache(maxsize=1)
def load_ontology() -> dict:
    with open(DATA / "ontology.json", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def load_roles() -> dict:
    with open(DATA / "roles.json", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def alias_index() -> dict:
    """lower-case alias -> canonical name"""
    idx = {}
    for name, info in load_ontology().items():
        for a in info["aliases"]:
            idx.setdefault(a.lower(), name)
        idx[name.lower()] = name
    return idx


def _normalize_skill_items(skills):
    if skills is None:
        return []
    if isinstance(skills, str):
        items = re.split(r"[\n,;]+", skills)
    else:
        items = list(skills)

    out = []
    for item in items:
        if item is None:
            continue
        if isinstance(item, str):
            for part in re.split(r"[\n,;]+", item):
                cleaned = part.strip()
                if cleaned:
                    out.append(cleaned)
        else:
            out.append(str(item))
    return out


def canonical(skill: str) -> str:
    """Map any alias ('reactjs', 'Node') to the canonical name; unknown skills are kept as typed."""
    s = (skill or "").strip()
    return alias_index().get(s.lower(), s)


def canonical_list(skills) -> list:
    seen, out = set(), []
    for s in _normalize_skill_items(skills):
        c = canonical(s)
        if c and c.lower() not in seen:
            seen.add(c.lower())
            out.append(c)
    return out


def implied_credit(skills) -> dict:
    """
    Return {skill: credit} where direct skills get 1.0 and skills implied
    through the ontology get the product of edge weights along the best path.
      Node.js --1.0--> JavaScript ;  Express.js --0.7--> REST API
    """
    onto = load_ontology()
    credit = {}
    frontier = [(s, 1.0) for s in canonical_list(skills)]
    for s, _ in frontier:
        credit[s] = 1.0
    while frontier:
        nxt = []
        for s, c in frontier:
            for imp, w in onto.get(s, {}).get("implies", {}).items():
                val = c * w
                if val > credit.get(imp, 0) + 1e-9:
                    credit[imp] = val
                    nxt.append((imp, val))
        frontier = nxt
    return credit
