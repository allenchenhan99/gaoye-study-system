import re
from scripts.config import SUBJECTS, subject_from_text

_SUBJ_HDR = re.compile(r"專業科目[：:].*")
_Q_START = re.compile(r"^\s*(\d{1,2})[.。](?!\d)\s*(.*)")  # "1."/"1。"，但不匹配小數如 "0.5"
_OPT = re.compile(r"^\s*\(([ABCD])\)\s*(.*)")
_STOP = re.compile(r"(試題解答|標準答案|^\s*解答\s*$)")
_NOISE = re.compile(r"(請填|應試號碼|入場證|※|第\s*\d+\s*頁|共\s*\d+\s*頁|資格測驗試題)")
_OPT_SPLIT = re.compile(r"\(([ABCD])\)")

def split_subject_sections(text: str):
    lines = text.splitlines()
    sections, cur_subj, buf = [], None, []
    def flush():
        if cur_subj and buf:
            sections.append((cur_subj, "\n".join(buf)))
    for line in lines:
        if _SUBJ_HDR.match(line.strip()):
            flush()
            cur_subj = subject_from_text(line)
            buf = []
        else:
            buf.append(line)
    flush()
    return sections

def parse_section(section_text: str):
    questions, cur, field = [], None, None

    def assign(text):
        """把一段純文字接到目前欄位（題幹或某選項）。"""
        text = text.strip()
        if not text or cur is None:
            return
        if field[0] == "stem":
            cur["stem"] = (cur["stem"] + " " + text).strip() if cur["stem"] else text
        else:
            L = field[1]
            prev = cur["options"].get(L, "")
            cur["options"][L] = (prev + " " + text).strip() if prev else text

    for raw in section_text.splitlines():
        nonlocal_line = raw.strip()
        if not nonlocal_line:
            continue
        if _STOP.search(nonlocal_line):
            break
        line = nonlocal_line
        # 題目起始：行首「數字.」且不是選項行
        mq = _Q_START.match(line)
        if mq and not _OPT.match(line):
            if cur:
                questions.append(cur)
            cur = {"number": int(mq.group(1)), "stem": "", "options": {}}
            field = ("stem", None)
            line = mq.group(2).strip()
            if not line:
                continue
        if cur is None:
            continue
        # 純雜訊行（且不含任何選項標記）才跳過
        if _NOISE.search(line) and not _OPT_SPLIT.search(line):
            continue
        # 依 (A)(B)(C)(D) 標記切分：parts = [前綴, 'A', textA, 'B', textB, ...]
        parts = _OPT_SPLIT.split(line)
        assign(parts[0])
        for i in range(1, len(parts), 2):
            letter = parts[i]
            field = ("opt", letter)
            cur["options"][letter] = parts[i + 1].strip()

    if cur:
        questions.append(cur)
    return questions

def extract_questions(full_text: str, year: int, round: int, source: str):
    out = []
    for subject, sec in split_subject_sections(full_text):
        if subject is None:
            continue
        for q in parse_section(sec):
            n = q["number"]
            out.append({
                "id": f"{year}-{round}-{subject}-{n:03d}",
                "year": year, "round": round, "roundLabel": f"第{round}次",
                "subject": subject, "subjectLabel": SUBJECTS[subject],
                "number": n, "stem": q["stem"], "options": q["options"],
                "answer": None, "figures": [], "source": source,
                "explanation": None,
            })
    return out
