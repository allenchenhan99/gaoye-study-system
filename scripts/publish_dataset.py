import json
from pathlib import Path

_KEEP = ["id", "year", "round", "roundLabel", "subject", "subjectLabel",
         "number", "stem", "options", "answer"]

def slim_question(q: dict) -> dict:
    out = {k: q[k] for k in _KEEP}
    if q.get("allCredit"):
        out["allCredit"] = True
    return out

def export_questions(questions, out_path) -> None:
    path = Path(out_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps([slim_question(q) for q in questions], ensure_ascii=False),
        encoding="utf-8")
