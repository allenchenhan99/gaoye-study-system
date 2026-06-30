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
