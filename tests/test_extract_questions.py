# tests/test_extract_questions.py
from scripts import extract_questions as eq

SECTION = """專業科目：證券投資與財務分析－試卷「投資學」 請填應試號碼：
※注意：考生請在「答案卡」上作答，共 50 題
1. 小王投資某公司股票，第一年從 120 元漲至 170 元，第二年又從 170 元
回跌至 120 元，平均年報酬率為何？
(A)算術平均法，0%
(B)算術平均法，6.3%
(C)幾何平均法，0%
(D)幾何平均法，6.3%
2. 下列敘述何者正確？甲.封閉型以淨值交易；乙.規模不變
(A)僅甲
(B)僅乙
(C)甲乙皆是
(D)甲乙皆非
"""

COMBINED = ('專業科目：證券交易相關法規與實務\n1. 法規題？\n(A)a\n(B)b\n(C)c\n(D)d\n'
            '專業科目：證券投資與財務分析－試卷「投資學」\n1. 投資題？\n(A)a\n(B)b\n(C)c\n(D)d\n')

def test_split_sections_single():
    secs = eq.split_subject_sections(SECTION)
    assert len(secs) == 1 and secs[0][0] == "investment"

def test_split_sections_combined_resets_subject():
    secs = eq.split_subject_sections(COMBINED)
    assert [s[0] for s in secs] == ["law", "investment"]

def test_parse_section_stem_and_options():
    qs = eq.parse_section(SECTION)
    assert len(qs) == 2
    assert qs[0]["number"] == 1
    assert qs[0]["stem"].startswith("小王投資某公司股票")
    assert "回跌至 120 元" in qs[0]["stem"]  # 跨行接合
    assert qs[0]["options"]["C"] == "幾何平均法，0%"

def test_parse_section_keeps_jiayi_subitems_in_stem():
    qs = eq.parse_section(SECTION)
    assert "甲.封閉型" in qs[1]["stem"]
    assert qs[1]["options"]["C"] == "甲乙皆是"

def test_extract_questions_builds_ids():
    qs = eq.extract_questions(COMBINED, year=114, round=1, source="114/11401.pdf")
    ids = {q["id"] for q in qs}
    assert "114-1-law-001" in ids and "114-1-investment-001" in ids
    q = next(q for q in qs if q["id"] == "114-1-law-001")
    assert q["subject"] == "law" and q["explanation"] is None and q["figures"] == []
