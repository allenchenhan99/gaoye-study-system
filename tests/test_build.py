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
