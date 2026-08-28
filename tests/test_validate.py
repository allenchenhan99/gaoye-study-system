import json
from scripts import validate

QS = [
    {"id": "114-1-law-001", "year": 114, "round": 1, "number": 1, "stem": "x",
     "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": "C", "subject": "law"},
    {"id": "114-1-law-002", "year": 114, "round": 1, "number": 2, "stem": "x",
     "options": {"A": "1", "B": "2", "C": "3"}, "answer": "A", "subject": "law"},
    {"id": "114-1-investment-001", "year": 114, "round": 1, "number": 1, "stem": "",
     "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": None, "subject": "investment"},
]

def test_validate_flags_missing_option_and_answer():
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(QS)}
    assert "114-1-law-002" in reasons and "missing_option" in reasons["114-1-law-002"]
    assert "114-1-investment-001" in reasons
    assert "114-1-law-001" not in reasons

def test_count_report():
    rep = validate.count_report(QS)
    assert rep["total"] == 3 and rep["with_answer"] == 2
    assert abs(rep["answer_rate"] - 2/3) < 1e-6

def test_validate_flags_bad_answer():
    qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "number": 1, "stem": "x",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
           "answer": "E", "subject": "law"}]
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(qs)}
    assert "bad_answer" in reasons["114-1-law-001"]

def test_validate_combined_reason_for_c():
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(QS)}
    assert reasons["114-1-investment-001"] == "empty_stem,missing_answer"

def test_write_review_writes_valid_json(tmp_path):
    out = tmp_path / "review-needed.json"
    validate.write_review([{"id": "114-1-law-001", "reason": "missing_answer", "source": "x"}], out)
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data[0]["id"] == "114-1-law-001" and data[0]["reason"] == "missing_answer"

def test_validate_allcredit_not_flagged():
    qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "number": 1, "stem": "送分題",
           "answer": None, "allCredit": True,
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "subject": "law"}]
    assert validate.validate_questions(qs) == []

def test_count_report_counts_allcredit_as_resolved():
    qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "number": 1, "stem": "s",
           "answer": None, "allCredit": True,
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "subject": "law"}]
    assert validate.count_report(qs)["with_answer"] == 1

def test_validate_flags_malformed_id():
    qs = [{"id": "None-None-law-001", "year": None, "round": None, "number": 1, "stem": "s",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": "A", "subject": "law"}]
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(qs)}
    assert "bad_id" in reasons["None-None-law-001"]

def test_validate_good_id_not_flagged_as_bad_id():
    qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "number": 1, "stem": "s",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": "A", "subject": "law"}]
    assert validate.validate_questions(qs) == []

def test_validate_flags_empty_option_value():
    qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "number": 1, "stem": "s",
           "options": {"A": "", "B": "乙", "C": "丙", "D": "丁"}, "answer": "B", "subject": "law"}]
    reasons = {r["id"]: r["reason"] for r in validate.validate_questions(qs)}
    assert "missing_option" in reasons["114-1-law-001"]


def test_validate_flags_invalid_subject_and_browser_labels():
    qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "number": 1,
           "roundLabel": "", "subject": "other", "subjectLabel": None,
           "stem": "s", "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
           "answer": "A"}]
    reasons = validate.validate_questions(qs)[0]["reason"]
    assert "bad_subject" in reasons
    assert "bad_label" in reasons


def test_validate_flags_non_boolean_allcredit():
    qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "number": 1,
           "subject": "law", "stem": "s",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
           "answer": None, "allCredit": "yes"}]
    assert "bad_all_credit" in validate.validate_questions(qs)[0]["reason"]


def test_validate_flags_id_that_disagrees_with_question_fields():
    qs = [{"id": "114-1-law-001", "year": 999, "round": 1, "number": 1,
           "subject": "law", "stem": "s",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
           "answer": "A"}]
    assert "inconsistent_id" in validate.validate_questions(qs)[0]["reason"]


def test_validate_rejects_booleans_as_numeric_identity_fields():
    qs = [{"id": "114-1-law-001", "year": 114, "round": True, "number": 1,
           "subject": "law", "stem": "s",
           "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
           "answer": "A"}]
    assert "bad_id" in validate.validate_questions(qs)[0]["reason"]
