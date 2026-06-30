from pathlib import Path
from scripts import classify

NEW_HEAD = '114 年第 1 次證券商高級業務員資格測驗試題\n專業科目：證券投資與財務分析－試卷「投資學」\n'
OLD_HEAD = '105 年第 4 次證券商高級業務員資格測驗試題\n專業科目：證券投資與財務分析－試卷「財務分析」\n'
ANS_HEAD = '114年第1次 證券商高級業務員資格測驗試題解答\n證券投資與財務分析--試卷「投資學」試題解答\n'

def test_parse_header_new():
    h = classify.parse_header(NEW_HEAD)
    assert h["year"] == 114 and h["round"] == 1 and h["is_answer"] is False

def test_parse_header_old():
    h = classify.parse_header(OLD_HEAD)
    assert h["year"] == 105 and h["round"] == 4

def test_parse_header_answer():
    assert classify.parse_header(ANS_HEAD)["is_answer"] is True

def test_classify_new_answer_file():
    r = classify.classify_file(Path("raw/114/11401a.pdf"), ANS_HEAD)
    assert r["era"] == "new" and r["is_answer_file"] and not r["is_question_file"]
    assert r["year"] == 114 and r["round"] == 1

def test_classify_new_question_booklet():
    r = classify.classify_file(Path("raw/114/11401.pdf"), NEW_HEAD)
    assert r["era"] == "new" and r["is_question_file"] and not r["is_answer_file"]

def test_classify_old_file_is_question_with_embedded_answer():
    r = classify.classify_file(Path("raw/105/105Q2高業財務分析.pdf"), OLD_HEAD)
    assert r["era"] == "old" and r["is_question_file"] and not r["is_answer_file"]
    assert r["year"] == 105 and r["round"] == 4
