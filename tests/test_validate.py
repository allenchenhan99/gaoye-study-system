import json
from scripts import validate

QS = [
    {"id": "a", "stem": "x", "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": "C", "subject": "law"},
    {"id": "b", "stem": "x", "options": {"A": "1", "B": "2", "C": "3"}, "answer": "A", "subject": "law"},
    {"id": "c", "stem": "", "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": None, "subject": "investment"},
]

def test_validate_flags_missing_option_and_answer():
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(QS)}
    assert "b" in reasons and "missing_option" in reasons["b"]
    assert "c" in reasons
    assert "a" not in reasons

def test_count_report():
    rep = validate.count_report(QS)
    assert rep["total"] == 3 and rep["with_answer"] == 2
    assert abs(rep["answer_rate"] - 2/3) < 1e-6

def test_validate_flags_bad_answer():
    qs = [{"id": "z", "stem": "x",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
           "answer": "E", "subject": "law"}]
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(qs)}
    assert "bad_answer" in reasons["z"]

def test_validate_combined_reason_for_c():
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(QS)}
    assert reasons["c"] == "empty_stem,missing_answer"

def test_write_review_writes_valid_json(tmp_path):
    out = tmp_path / "review-needed.json"
    validate.write_review([{"id": "a", "reason": "missing_answer", "source": "x"}], out)
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data[0]["id"] == "a" and data[0]["reason"] == "missing_answer"

def test_validate_allcredit_not_flagged():
    qs = [{"id": "x", "stem": "送分題", "answer": None, "allCredit": True,
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "subject": "law"}]
    assert validate.validate_questions(qs) == []

def test_count_report_counts_allcredit_as_resolved():
    qs = [{"id": "x", "stem": "s", "answer": None, "allCredit": True,
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "subject": "law"}]
    assert validate.count_report(qs)["with_answer"] == 1
