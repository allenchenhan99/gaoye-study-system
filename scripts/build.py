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
    """回傳 {(year, round, subject, number): letter}"""
    answers = {}
    for entry in manifest:
        path = entry["source"]
        yr, rnd = entry["year"], entry["round"]
        if entry["is_answer_file"]:
            text = pdfutils.pdf_text(path)
            per_subj = extract_answers.parse_answer_file(text)
        elif entry["era"] == "old":
            pages = pdfutils.pdf_page_count(path)
            last = pdfutils.pdf_text(path, first=pages, last=pages)
            head = pdfutils.pdf_text(path, first=1, last=1)
            from scripts.config import subject_from_text
            subj = subject_from_text(head)
            per_subj = extract_answers.parse_embedded_answers(last, subj) if subj else {}
        else:
            continue
        for subj, grid in per_subj.items():
            for n, letter in grid.items():
                answers[(yr, rnd, subj, n)] = letter
    return answers

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
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(json.dumps(questions, ensure_ascii=False, indent=2))
    return questions
