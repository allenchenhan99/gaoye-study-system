import re
from scripts.config import subject_from_text

_INT = re.compile(r"\b(\d{1,2})\b")
_LET = re.compile(r"\b([ABCD])\b")
_ANS_HDR = re.compile(r".*(試題解答|標準答案).*")

def parse_answer_grid(text: str) -> dict:
    nums = [int(x) for x in _INT.findall(text)]
    lets = _LET.findall(text)
    if not nums or len(nums) != len(lets):
        return {}
    return dict(zip(nums, lets))

def _split_answer_sections(text: str):
    lines = text.splitlines()
    sections, cur_subj, buf = [], None, []
    def flush():
        if cur_subj and buf:
            sections.append((cur_subj, "\n".join(buf)))
    for line in lines:
        s = line.strip()
        subj = subject_from_text(s) if _ANS_HDR.match(s) else None
        if subj:
            flush()
            cur_subj, buf = subj, []
        else:
            buf.append(line)
    flush()
    return sections

def parse_answer_file(text: str) -> dict:
    out = {}
    for subj, sec in _split_answer_sections(text):
        grid = parse_answer_grid(sec)
        if grid:
            out[subj] = grid
    return out

def parse_embedded_answers(last_page_text: str, subject: str) -> dict:
    grid = parse_answer_grid(last_page_text)
    return {subject: grid} if grid else {}
