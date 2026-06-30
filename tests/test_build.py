from scripts import build

def test_attach_answers_fills_by_key():
    qs = [
        {"id": "114-1-law-001", "year": 114, "round": 1, "subject": "law",
         "number": 1, "answer": None},
        {"id": "114-1-law-002", "year": 114, "round": 1, "subject": "law",
         "number": 2, "answer": None},
    ]
    answers = {(114, 1, "law", 1): "B"}
    out = build.attach_answers(qs, answers)
    assert out[0]["answer"] == "B"
    assert out[1]["answer"] is None  # 查無保持 None

def test_attach_answers_does_not_invent():
    qs = [{"id": "x", "year": 1, "round": 1, "subject": "law", "number": 9, "answer": None}]
    out = build.attach_answers(qs, {(1, 1, "law", 1): "A"})
    assert out[0]["answer"] is None

def test_apply_manual_questions_overrides_options_and_allcredit():
    from scripts import build
    qs = [{"id": "a", "stem": "s", "options": {"B": "2", "C": "3", "D": "4"}, "answer": "D"},
          {"id": "b", "stem": "s", "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "answer": None}]
    build._apply_manual_questions(qs, [
        {"id": "a", "options": {"A": "1", "B": "2", "C": "3", "D": "4"}},
        {"id": "b", "allCredit": True},
    ])
    assert qs[0]["options"]["A"] == "1"
    assert qs[1]["allCredit"] is True
