# tests/test_extract_answers.py
from scripts import extract_answers as ea

# 模擬 pdftotext -layout 的答案表：每列含多組「題號 答案」
LAYOUT = """ 114年第1次 證券商高級業務員資格測驗試題解答
     證券投資與財務分析--試卷「投資學」試題解答
  1    C   11   C   21   B   31   B   41   A
  2    D   12   A   22   D   32   D   42   A
          證券交易相關法規與實務試題解答
  1    D   11   D   21   A   31   B   41   C
  2    D   12   D   22   C   32   B   42   D
"""

def test_parse_answer_layout_splits_subjects():
    res = ea.parse_answer_layout(LAYOUT)
    assert set(res) == {"investment", "law"}
    assert res["investment"][1] == "C" and res["investment"][41] == "A"
    assert res["law"][22] == "C" and res["law"][42] == "D"

def test_parse_answer_layout_pairs_all_columns_in_row():
    res = ea.parse_answer_layout(LAYOUT)
    assert res["investment"] == {1:"C",11:"C",21:"B",31:"B",41:"A",2:"D",12:"A",22:"D",32:"D",42:"A"}

def test_parse_answer_layout_skips_all_credit_marker():
    # 「44  A.B.C.D」均給分特例不可被讀成單一字母 → 44 不出現
    txt = ("證券投資與財務分析--試卷「投資學」試題解答\n"
           "  43   B   44   A.B.C.D   45   C\n")
    res = ea.parse_answer_layout(txt)
    assert res["investment"].get(43) == "B"
    assert res["investment"].get(45) == "C"
    assert 44 not in res["investment"]  # 均給分留待人工/review

def test_parse_answer_layout_empty_on_no_header():
    assert ea.parse_answer_layout("1 A 2 B 3 C") == {}  # 無科目標題 → 空
