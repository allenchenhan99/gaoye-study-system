import json
import re
from collections import Counter
from pathlib import Path

_ID_RE = re.compile(r"^(\d{3})-(\d+)-(law|investment|finance)-(\d{3})$")

def validate_questions(questions):
    reviews = []
    for q in questions:
        reasons = []
        stem = q.get("stem")
        if not isinstance(stem, str) or not stem.strip():
            reasons.append("empty_stem")
        opts = q.get("options", {})
        if (not isinstance(opts, dict)
                or set(opts) != {"A", "B", "C", "D"}
                or any(not isinstance(opts.get(k), str) or not opts[k].strip()
                       for k in ("A", "B", "C", "D"))):
            reasons.append("missing_option")
        ans = q.get("answer")
        if q.get("allCredit"):
            pass  # 送分題：任選皆對，無單一答案
        elif ans is None:
            reasons.append("missing_answer")
        elif ans not in ("A", "B", "C", "D"):
            reasons.append("bad_answer")
        question_id = q.get("id")
        identity_match = (
            _ID_RE.fullmatch(question_id)
            if isinstance(question_id, str)
            else None
        )
        if (type(q.get("year")) is not int
                or type(q.get("round")) is not int
                or type(q.get("number")) is not int
                or not isinstance(question_id, str)
                or identity_match is None):
            reasons.append("bad_id")
        elif (
            int(identity_match.group(1)) != q["year"]
            or int(identity_match.group(2)) != q["round"]
            or identity_match.group(3) != q.get("subject")
            or int(identity_match.group(4)) != q["number"]
        ):
            reasons.append("inconsistent_id")
        if q.get("subject") not in {"law", "investment", "finance"}:
            reasons.append("bad_subject")
        if any(
            field in q
            and (not isinstance(q[field], str) or not q[field].strip())
            for field in ("roundLabel", "subjectLabel")
        ):
            reasons.append("bad_label")
        if "allCredit" in q and not isinstance(q["allCredit"], bool):
            reasons.append("bad_all_credit")
        if reasons:
            reviews.append({"id": q.get("id"), "reason": ",".join(reasons),
                            "source": q.get("source")})
    return reviews

def count_report(questions):
    total = len(questions)
    with_ans = sum(1 for q in questions if q.get("answer") is not None or q.get("allCredit"))
    by_subj = Counter(q.get("subject") for q in questions)
    return {"total": total, "with_answer": with_ans,
            "answer_rate": (with_ans / total) if total else 0.0,
            "by_subject": dict(by_subj)}

def write_review(reviews, out_path):
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(json.dumps(reviews, ensure_ascii=False, indent=2), encoding="utf-8")
