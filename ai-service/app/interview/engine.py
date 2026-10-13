"""Question selection and answer evaluation for Choice-Filling (MCQ) interview practice."""
import random
from ..skills.ontology import canonical_list
from .bank import TECH, GENERIC_TECH, HR, APTITUDE


def build_questions(kind: str, skills=None, count: int = 5, seed=None) -> list:
    """Returns a randomized set of choice-filling (MCQ) questions every time."""
    rnd = random.Random(seed) if seed is not None else random.Random()
    pool = []
    if kind == "hr":
        pool = [dict(q, category="HR") for q in HR]
    elif kind == "aptitude":
        pool = [dict(q, category=q.get("category", "Aptitude")) for q in APTITUDE]
    else:
        # Technical Quiz: prioritize job skills, then expand to all available technical categories
        c_skills = canonical_list(skills or [])
        for s in c_skills:
            for q in TECH.get(s, []):
                pool.append(dict(q, category=s))
        # Add general technical and remaining topics to fulfill requested count
        for cat, q_list in TECH.items():
            if cat not in c_skills:
                for q in q_list:
                    pool.append(dict(q, category=cat))
        pool += [dict(q, category="General") for q in GENERIC_TECH]

    # Deduplicate pool by question text
    unique_pool = []
    seen = set()
    for q in pool:
        if q["q"] not in seen:
            seen.add(q["q"])
            unique_pool.append(q)

    rnd.shuffle(unique_pool)

    # Pick with category diversity
    max_per_cat = max(3, count // 3)
    picked, per = [], {}
    for q in unique_pool:
        cat = q.get("category", "General")
        if per.get(cat, 0) < max_per_cat:
            picked.append(q)
            per[cat] = per.get(cat, 0) + 1
        if len(picked) >= count:
            break

    # If count not met, fill from remaining unique questions
    if len(picked) < count:
        for q in unique_pool:
            if q not in picked:
                picked.append(q)
            if len(picked) >= count:
                break

    # If pool is smaller than count, wrap around to guarantee exact count
    idx = 0
    while len(picked) < count and unique_pool:
        picked.append(dict(unique_pool[idx % len(unique_pool)]))
        idx += 1

    final_picked = picked[:count]
    rnd.shuffle(final_picked)

    out = []
    for i, q in enumerate(final_picked):
        opts = list(q["options"])
        correct_text = opts[q["correct"]] if 0 <= q["correct"] < len(opts) else opts[0]
        # Shuffle option order so choices (A, B, C, D) are not in identical arrangement
        rnd.shuffle(opts)
        new_correct_idx = opts.index(correct_text) if correct_text in opts else 0

        out.append({
            "id": i,
            "question": q["q"],
            "category": q.get("category", "General"),
            "options": opts,
            "correctOption": new_correct_idx,
            "explanation": q["explanation"]
        })

    return out


def evaluate_answer(selected_option: int, correct_option: int, options: list, explanation: str) -> dict:
    """Evaluates the user's choice selection and provides mark + detailed review."""
    is_correct = (selected_option == correct_option)
    score = 10.0 if is_correct else 0.0

    letter_correct = chr(65 + correct_option) if 0 <= correct_option < len(options) else ""
    letter_user = chr(65 + selected_option) if 0 <= selected_option < len(options) else ""
    correct_text = options[correct_option] if 0 <= correct_option < len(options) else ""
    user_text = options[selected_option] if 0 <= selected_option < len(options) else ""

    if is_correct:
        feedback = f"Correct! Option ({letter_correct}) is the right answer."
    else:
        feedback = f"Incorrect. You selected ({letter_user}), but Option ({letter_correct}) is correct: '{correct_text}'."

    return {
        "score": score,
        "isCorrect": is_correct,
        "selectedOption": selected_option,
        "userOptionText": user_text,
        "correctOption": correct_option,
        "correctAnswer": correct_text,
        "explanation": explanation,
        "feedback": feedback
    }
