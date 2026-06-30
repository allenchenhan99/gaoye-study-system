from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ZIP_DIR = ROOT
RAW_DIR = ROOT / "raw"
DATA_DIR = ROOT / "data"
FIGURES_DIR = DATA_DIR / "figures"

SUBJECTS = {
    "law": "證券交易相關法規與實務",
    "investment": "證券投資與財務分析－投資學",
    "finance": "證券投資與財務分析－財務分析",
}

def subject_from_text(text: str) -> str | None:
    """從表頭/解答標題文字判定科目，靠括號標記避免誤判。"""
    if "「投資學」" in text:
        return "investment"
    if "「財務分析」" in text:
        return "finance"
    if "法規" in text:
        return "law"
    return None
