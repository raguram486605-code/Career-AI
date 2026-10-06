"""Question selection and answer evaluation for Choice-Filling (MCQ) interview practice."""
import random
from ..skills.ontology import canonical_list
from .bank import TECH, GENERIC_TECH, HR


def build_questions(kind: str, skills=None, count: int = 5, seed=None) -> list:
    """Returns a randomized set of choice-filling (MCQ) questions every time."""
    # If seed is explicitly provided, use it; otherwise use random.Random() for fresh sampling every time
    rnd = random.Random(seed) if seed is not None else random.Random()
    pool = []
    if kind == "hr":
        pool = [dict(q, category="HR") for q in HR]
    else:
        for s in canonical_list(skills or []):
            for q in TECH.get(s, []):
                pool.append(dict(q, category=s))
        pool += [dict(q, category="General") for q in GENERIC_TECH]

    # Deduplicate pool by question text while preserving options & correct metadata
    unique_pool = []
    seen = set()
    for q in pool:
        if q["q"] not in seen:
            seen.add(q["q"])
            unique_pool.append(q)

    rnd.shuffle(unique_pool)

    # Pick with category diversity
    picked, per = [], {}
    for q in unique_pool:
        if per.get(q["category"], 0) < 3:
            picked.append(q)
            per[q["category"]] = per.get(q["category"], 0) + 1
        if len(picked) >= count:
            break

    # If count not met, fill from remaining
    if len(picked) < count:
        for q in unique_pool:
            if q not in picked:
                picked.append(q)
            if len(picked) >= count:
                break

    return [
        {
            "id": i,
            "question": q["q"],
            "category": q["category"],
            "options": q["options"],
            "correctOption": q["correct"],
            "explanation": q["explanation"]
        }
        for i, q in enumerate(picked)
    ]


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
