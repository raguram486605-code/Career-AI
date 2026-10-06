"""Text similarity. Uses sentence-transformers if available, else TF-IDF-style cosine."""
import math
import os
import re
from collections import Counter

STOP = set("""a an the and or of to in on for with is are was were be been by at as from that this it its into
using used use built build worked work project projects developed develop experience skills etc responsible
including also have has had will can able strong good knowledge understanding looking candidate role job
required preferred ability years year team teams work working""".split())


def _tokens(text: str):
    return [t for t in re.findall(r"[a-z][a-z0-9+#.]{1,}", (text or "").lower()) if t not in STOP]


class TfidfEmbedder:
    name = "tfidf"
    # raw cosine on short docs is low; this scale maps "very similar" to ~1.0
    lo, hi = 0.02, 0.35

    def similarity(self, a: str, b: str) -> float:
        ta, tb = Counter(_tokens(a)), Counter(_tokens(b))
        if not ta or not tb:
            return 0.0
        vocab = set(ta) | set(tb)
        # idf over the two documents only (+1 smoothing): shared terms weigh less than unique ones
        idf = {w: math.log(3 / (1 + (w in ta) + (w in tb))) + 1 for w in vocab}
        va = {w: (1 + math.log(c)) * idf[w] for w, c in ta.items()}
        vb = {w: (1 + math.log(c)) * idf[w] for w, c in tb.items()}
        dot = sum(va[w] * vb.get(w, 0) for w in va)
        na = math.sqrt(sum(v * v for v in va.values()))
        nb = math.sqrt(sum(v * v for v in vb.values()))
        return dot / (na * nb) if na and nb else 0.0


class STEmbedder:
    name = "sentence-transformers/all-MiniLM-L6-v2"
    lo, hi = 0.15, 0.60

    def __init__(self):
        from sentence_transformers import SentenceTransformer, util  # noqa
        self._m = SentenceTransformer("all-MiniLM-L6-v2")
        self._util = util

    def similarity(self, a: str, b: str) -> float:
        if not a.strip() or not b.strip():
            return 0.0
        ea, eb = self._m.encode([a[:4000], b[:4000]], convert_to_tensor=True)
        return float(self._util.cos_sim(ea, eb)[0][0])


_emb = None


def get_embedder():
    global _emb
    if _emb is None:
        if os.getenv("FORCE_TFIDF") == "1":
            _emb = TfidfEmbedder()
        else:
            try:
                _emb = STEmbedder()
            except Exception:
                _emb = TfidfEmbedder()
    return _emb


def calibrated_similarity(a: str, b: str, embedder=None) -> tuple:
    """Return (raw, calibrated 0-1). Calibration maps the embedder's useful range onto 0-1."""
    e = embedder or get_embedder()
    raw = e.similarity(a, b)
    cal = (raw - e.lo) / (e.hi - e.lo)
    return raw, max(0.0, min(1.0, cal))
