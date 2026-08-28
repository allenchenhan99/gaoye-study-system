import json
from pathlib import Path
from scripts import publish_dataset as publisher

def test_slim_question_keeps_frontend_fields():
    q = {"id": "114-1-law-001", "year": 114, "round": 1, "roundLabel": "第1次",
         "subject": "law", "subjectLabel": "證券交易相關法規與實務", "number": 1,
         "stem": "題", "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
         "answer": "C", "figures": [], "source": "x.pdf", "explanation": None}
    s = publisher.slim_question(q)
    assert s == {"id": "114-1-law-001", "year": 114, "round": 1, "roundLabel": "第1次",
                 "subject": "law", "subjectLabel": "證券交易相關法規與實務", "number": 1,
                 "stem": "題", "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
                 "answer": "C"}

def test_slim_question_includes_allcredit_when_true():
    q = {"id": "x", "year": 1, "round": 1, "roundLabel": "第1次", "subject": "law",
         "subjectLabel": "L", "number": 1, "stem": "s",
         "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": None,
         "allCredit": True}
    assert publisher.slim_question(q)["allCredit"] is True

def test_export_writes_browser_ready_questions(tmp_path):
    out = tmp_path / "data" / "questions.json"
    qs = [{"id": "x", "year": 1, "round": 1, "roundLabel": "第1次", "subject": "law",
           "subjectLabel": "L", "number": 1, "stem": "s",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": "A"}]
    publisher.export_questions(qs, out)
    assert json.loads(out.read_text(encoding="utf-8"))[0]["id"] == "x"
