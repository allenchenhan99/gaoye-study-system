import json
from collections import Counter
from pathlib import Path

def validate_questions(questions):
    reviews = []
    for q in questions:
        reasons = []
        if not q.get("stem"):
            reasons.append("empty_stem")
        if set(q.get("options", {})) != {"A", "B", "C", "D"}:
            reasons.append("missing_option")
        ans = q.get("answer")
        if ans is None:
            reasons.append("missing_answer")
        elif ans not in ("A", "B", "C", "D"):
            reasons.append("bad_answer")
        if reasons:
            reviews.append({"id": q.get("id"), "reason": ",".join(reasons),
                            "source": q.get("source")})
    return reviews

def count_report(questions):
    total = len(questions)
    with_ans = sum(1 for q in questions if q.get("answer"))
    by_subj = Counter(q.get("subject") for q in questions)
    return {"total": total, "with_answer": with_ans,
            "answer_rate": (with_ans / total) if total else 0.0,
            "by_subject": dict(by_subj)}

def write_review(reviews, out_path):
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(json.dumps(reviews, ensure_ascii=False, indent=2))
