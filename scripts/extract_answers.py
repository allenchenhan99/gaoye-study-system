# scripts/extract_answers.py
import re
from scripts.config import subject_from_text

_ANS_HDR = re.compile(r"(試題解答|標準答案)")
# 題號(1-2位) + 空白 + 單一答案字母；字母後不可接 "." 或英數字
# （避免「44  A.B.C.D」這種均給分特例被誤讀成單一答案）
_PAIR = re.compile(r"(\d{1,2})\s+([ABCD])(?![.\w])")

def parse_answer_layout(text: str) -> dict:
    """從 pdftotext -layout 的答案表文字解析 {subject: {num: letter}}。
    依含「試題解答/標準答案」的科目標題行分段；段內每列抓所有 (題號, 字母) 配對。
    跳過無法判定科目的內容；圖片型答案頁（無文字）自然回空字典。"""
    res: dict = {}
    cur = None
    for line in text.splitlines():
        subj = subject_from_text(line) if _ANS_HDR.search(line) else None
        if subj:
            cur = subj
            res.setdefault(cur, {})
            continue
        if cur is None:
            continue
        for num, let in _PAIR.findall(line):
            res[cur][int(num)] = let
    return res
