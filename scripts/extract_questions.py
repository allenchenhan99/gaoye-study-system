import re
from scripts.config import SUBJECTS, subject_from_text

_SUBJ_HDR = re.compile(r"專業科目[：:].*")
_Q_START = re.compile(r"^\s*(\d{1,2})[.。]\s*(.*)")   # "1." 或 "1。"
_OPT = re.compile(r"^\s*\(([ABCD])\)\s*(.*)")
_STOP = re.compile(r"(試題解答|標準答案|^\s*解答\s*$)")
_NOISE = re.compile(r"(請填|應試號碼|入場證|※|第\s*\d+\s*頁|共\s*\d+\s*頁|資格測驗試題)")

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
    for raw in section_text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if _STOP.search(line):
            break
        mq = _Q_START.match(line)
        mo = _OPT.match(line)
        if mq and not mo:
            if cur:
                questions.append(cur)
            cur = {"number": int(mq.group(1)), "stem": mq.group(2).strip(),
                   "options": {}}
            field = ("stem", None)
            continue
        if cur is None:
            continue
        if mo:
            letter = mo.group(1)
            cur["options"][letter] = mo.group(2).strip()
            field = ("opt", letter)
            continue
        if _NOISE.search(line):
            continue
        # 續行接合
        if field[0] == "stem":
            cur["stem"] = (cur["stem"] + " " + line).strip()
        elif field[0] == "opt":
            cur["options"][field[1]] = (cur["options"][field[1]] + " " + line).strip()
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
