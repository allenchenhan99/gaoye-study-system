import json
from pathlib import Path
from scripts import pdfutils, extract_questions, extract_answers, classify

def attach_answers(questions, answers: dict):
    for q in questions:
        key = (q["year"], q["round"], q["subject"], q["number"])
        if q.get("answer") is None and key in answers:
            q["answer"] = answers[key]
    return questions

def _collect_answers(manifest, raw_root) -> dict:
    """回傳 {(year, round, subject, number): letter}（文字型答案）。"""
    answers = {}
    for entry in manifest:
        if entry["is_answer_file"] or entry["era"] == "old":
            text = pdfutils.pdf_text(entry["source"], layout=True)
            per_subj = extract_answers.parse_answer_layout(text)
        else:
            continue
        yr, rnd = entry["year"], entry["round"]
        for subj, grid in per_subj.items():
            for n, letter in grid.items():
                answers[(yr, rnd, subj, n)] = letter
    return answers

def _load_manual_answers(path) -> dict:
    """讀 data/manual-answers.json（人工/視覺辨識的圖片型答案頁）。
    格式: [{"year":107,"round":1,"subject":"law","number":1,"answer":"A"}, ...]
    檔案不存在則回空 dict。"""
    p = Path(path)
    if not p.exists():
        return {}
    out = {}
    for r in json.loads(p.read_text(encoding="utf-8")):
        out[(r["year"], r["round"], r["subject"], r["number"])] = r["answer"]
    return out

def build_questions(manifest, raw_root, out_path) -> list:
    questions = []
    for entry in manifest:
        if not entry["is_question_file"]:
            continue
        text = pdfutils.pdf_text(entry["source"])
        questions += extract_questions.extract_questions(
            text, entry["year"], entry["round"], entry["source"])
    answers = _collect_answers(manifest, raw_root)
    attach_answers(questions, answers)
    manual = _load_manual_answers(Path(out_path).parent / "manual-answers.json")
    attach_answers(questions, manual)
    Path(out_path).write_text(
        json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")
    return questions
