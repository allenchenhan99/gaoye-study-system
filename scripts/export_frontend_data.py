import json
from pathlib import Path

_KEEP = ["id", "year", "round", "roundLabel", "subject", "subjectLabel",
         "number", "stem", "options", "answer"]

def slim_question(q: dict) -> dict:
    out = {k: q[k] for k in _KEEP}
    if q.get("allCredit"):
        out["allCredit"] = True
    return out

def export_data(questions, explanations, out_dir) -> None:
    d = Path(out_dir) / "data"
    d.mkdir(parents=True, exist_ok=True)
    (d / "questions.json").write_text(
        json.dumps([slim_question(q) for q in questions], ensure_ascii=False),
        encoding="utf-8")
    (d / "explanations.json").write_text(
        json.dumps(explanations, ensure_ascii=False), encoding="utf-8")

if __name__ == "__main__":
    from scripts import config
    qs = json.loads((config.DATA_DIR / "questions.json").read_text(encoding="utf-8"))
    exp_path = config.DATA_DIR / "explanations.json"
    exps = json.loads(exp_path.read_text(encoding="utf-8")) if exp_path.exists() else []
    export_data(qs, exps, config.ROOT / "frontend" / "public")
    print(f"exported {len(qs)} questions, {len(exps)} explanations")
