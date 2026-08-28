import json
from pathlib import Path
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

def test_build_questions_text_answer_wins_over_manual(tmp_path, monkeypatch):
    from scripts import build, pdfutils
    manifest = [
        {"source": "q.pdf", "year": 114, "round": 1, "era": "new",
         "is_answer_file": False, "is_question_file": True},
        {"source": "a.pdf", "year": 114, "round": 1, "era": "new",
         "is_answer_file": True, "is_question_file": False},
    ]
    qtext = "專業科目：證券交易相關法規與實務\n1. 題幹？\n(A)甲\n(B)乙\n(C)丙\n(D)丁\n"
    atext = "證券交易相關法規與實務試題解答\n  1    B\n"
    monkeypatch.setattr(pdfutils, "pdf_text",
                        lambda path, first=None, last=None, layout=False: qtext if path == "q.pdf" else atext)
    data = tmp_path / "data"; data.mkdir()
    (data / "manual-answers.json").write_text(
        json.dumps([{"year": 114, "round": 1, "subject": "law", "number": 1, "answer": "C"}]),
        encoding="utf-8")
    qs = build.build_questions(manifest, None, data / "questions.json")
    q = next(x for x in qs if x["id"] == "114-1-law-001")
    assert q["answer"] == "B"  # 文字答案(權威)勝出，人工答案不得覆蓋


def test_build_questions_reads_manual_corrections_from_explicit_data_dir(
        tmp_path, monkeypatch):
    from scripts import pdfutils

    manifest = [
        {"source": "q.pdf", "year": 114, "round": 1, "era": "new",
         "is_answer_file": False, "is_question_file": True},
    ]
    qtext = "專業科目：證券交易相關法規與實務\n1. 原始題幹？\n(A)甲\n(B)乙\n(C)丙\n(D)丁\n"
    monkeypatch.setattr(
        pdfutils, "pdf_text",
        lambda path, first=None, last=None, layout=False: qtext,
    )

    data = tmp_path / "data"
    data.mkdir()
    (data / "manual-answers.json").write_text(
        json.dumps([
            {"year": 114, "round": 1, "subject": "law", "number": 1,
             "answer": "C"},
        ]),
        encoding="utf-8",
    )
    (data / "manual-questions.json").write_text(
        json.dumps([
            {"id": "114-1-law-001", "stem": "人工修正題幹？"},
        ]),
        encoding="utf-8",
    )

    questions = build.build_questions(
        manifest,
        None,
        data / "_pipeline" / "questions.json",
        manual_dir=data,
    )

    assert questions[0]["answer"] == "C"
    assert questions[0]["stem"] == "人工修正題幹？"
