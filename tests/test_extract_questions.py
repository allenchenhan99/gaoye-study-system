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

def test_parse_section_keeps_stem_with_zhuyi_continuation():
    # 續行含「注意」不可被當雜訊丟棄（真實題幹如「應注意…」）
    sec = ("1. 公開發行公司股東名簿變更記載，\n"
           "應注意於股東常會開會前幾日內不得為之？\n"
           "(A)十\n(B)十五\n(C)二十\n(D)三十\n")
    qs = eq.parse_section(sec)
    assert len(qs) == 1
    assert "應注意於股東常會開會前幾日內不得為之？" in qs[0]["stem"]

def test_parse_section_does_not_stop_on_inline_jieda():
    # 題幹含「解答」二字不可觸發停止（只有獨立「解答」標題才停）
    sec = ("1. 請解答下列問題，何者正確？\n(A)甲\n(B)乙\n(C)丙\n(D)丁\n"
           "2. 第二題敘述？\n(A)甲\n(B)乙\n(C)丙\n(D)丁\n")
    qs = eq.parse_section(sec)
    assert len(qs) == 2

def test_parse_section_stops_on_standalone_jieda_heading():
    sec = ("1. 第一題？\n(A)甲\n(B)乙\n(C)丙\n(D)丁\n解答\n1\nA\n")
    qs = eq.parse_section(sec)
    assert len(qs) == 1

def test_parse_section_splits_full_inline_options():
    sec = "1. 世界最大市值的交易所為：\n(A)臺灣 (B)倫敦 (C)東京 (D)紐約\n"
    qs = eq.parse_section(sec)
    assert qs[0]["options"] == {"A": "臺灣", "B": "倫敦", "C": "東京", "D": "紐約"}

def test_parse_section_splits_partial_inline_options():
    sec = "1. 題幹？\n(A)甲\n(B)乙 (C)丙\n(D)丁\n"
    qs = eq.parse_section(sec)
    assert set(qs[0]["options"]) == {"A", "B", "C", "D"}
    assert qs[0]["options"]["C"] == "丙"

def test_parse_section_question_and_options_all_one_line():
    sec = "1. 題幹敘述 (A)甲 (B)乙 (C)丙 (D)丁\n"
    qs = eq.parse_section(sec)
    assert qs[0]["stem"] == "題幹敘述"
    assert qs[0]["options"] == {"A": "甲", "B": "乙", "C": "丙", "D": "丁"}

def test_parse_section_decimal_continuation_not_new_question():
    # 題幹續行以小數開頭（如「0.5，則…」）不可被當成新題號 0
    sec = ("31. 甲乙股票相關係數為\n0.5，則共變數為：\n(A)0.04 (B)0.03 (C)0.02 (D)0.01\n")
    qs = eq.parse_section(sec)
    assert len(qs) == 1 and qs[0]["number"] == 31
    assert "0.5，則共變數為：" in qs[0]["stem"]
    assert qs[0]["options"] == {"A": "0.04", "B": "0.03", "C": "0.02", "D": "0.01"}
