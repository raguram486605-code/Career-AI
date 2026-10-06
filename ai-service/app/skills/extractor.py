"""Rule + ontology based skill extraction (the 'NLP' skill-extraction step)."""
import re
from .ontology import load_ontology


# Aliases that are also ordinary English words / abbreviations. They only count
# when written in the exact "skill-like" form shown here (case-sensitive).
STRICT_FORMS = {
    "rest": "REST", "express": "Express", "spring": "Spring", "react": "React",
    "node": "Node", "ts": "TS", "js": "JS", "ml": "ML", "go": "Go", "c": "C",
    "testing": "Testing", "torch": "Torch", "vue": "Vue", "mongo": "Mongo",
}


class SkillExtractor:
    def __init__(self):
        self.patterns = []  # (canonical, compiled regex, alias)
        for name, info in load_ontology().items():
            for alias in info["aliases"]:
                strict = alias in STRICT_FORMS
                text = STRICT_FORMS[alias] if strict else alias
                # Boundaries that understand c++, c#, node.js, .net
                pat = r"(?<![\w+#.\-])" + re.escape(text) + r"(?![\w+#])(?!\.\w)"
                self.patterns.append((name, re.compile(pat, 0 if strict else re.IGNORECASE), alias))

    def extract(self, text: str) -> dict:
        """Return {canonical_skill: mention_count}. Longest aliases win, so
        'Spring Boot' is not additionally counted as 'Spring'."""
        found = {}
        if not text:
            return found
        claimed = []  # list of (start, end)
        for name, rx, alias in sorted(self.patterns, key=lambda t: -len(t[2])):
            for m in rx.finditer(text):
                a, b = m.span()
                if any(a < e and b > s for s, e in claimed):
                    continue
                claimed.append((a, b))
                found[name] = found.get(name, 0) + 1
        return found

    def skills(self, text: str) -> list:
        f = self.extract(text)
        return sorted(f, key=lambda k: (-f[k], k))


_extractor = None


def get_extractor() -> SkillExtractor:
    global _extractor
    if _extractor is None:
        _extractor = SkillExtractor()
    return _extractor
