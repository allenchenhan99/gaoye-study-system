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
