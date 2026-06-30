from scripts import extract_answers as ea

GRID = "1\n2\n3\n4\n5\nC\nD\nA\nC\nB\n"
ANSFILE = (
    "114年第1次 證券商高級業務員資格測驗試題解答\n"
    "證券投資與財務分析--試卷「投資學」試題解答\n1\n2\n3\nC\nD\nA\n"
    "證券交易相關法規與實務試題解答\n1\n2\n3\nB\nB\nC\n"
)

def test_parse_answer_grid_pairs_in_order():
    assert ea.parse_answer_grid(GRID) == {1: "C", 2: "D", 3: "A", 4: "C", 5: "B"}

def test_parse_answer_grid_mismatch_returns_empty():
    assert ea.parse_answer_grid("1\n2\n3\nC\nD\n") == {}  # 數量不符

def test_parse_answer_file_splits_subjects():
    res = ea.parse_answer_file(ANSFILE)
    assert res["investment"] == {1: "C", 2: "D", 3: "A"}
    assert res["law"] == {1: "B", 2: "B", 3: "C"}

def test_parse_embedded_answers():
    res = ea.parse_embedded_answers(GRID, "finance")
    assert res["finance"][3] == "A"

def test_parse_answer_grid_rejects_stray_number():
    # 頁碼 7 漏入使數量湊巧相等，但題號非乾淨 1..N → 應拒絕，避免靜默錯位
    assert ea.parse_answer_grid("1\n2\n3\n7\nC\nD\nA\nB\n") == {}

def test_parse_answer_grid_accepts_columnwise_order():
    # 直欄排列（1,3,5,2,4）仍是 1..5 的排列，應正常配對
    assert ea.parse_answer_grid("1\n3\n5\n2\n4\nA\nB\nC\nD\nA\n") == {1:"A",3:"B",5:"C",2:"D",4:"A"}
