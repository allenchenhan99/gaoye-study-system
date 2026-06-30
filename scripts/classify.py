import json
import re
from pathlib import Path
from scripts import pdfutils

_HDR_RE = re.compile(r"(\d{3})\s*年第\s*(\d+)\s*次")
_NUM_STEM = re.compile(r"^(\d{3})(\d{2})(a)?$")

def parse_header(text: str) -> dict:
    m = _HDR_RE.search(text)
    year = int(m.group(1)) if m else None
    rnd = int(m.group(2)) if m else None
    return {"year": year, "round": rnd, "is_answer": "試題解答" in text or "標準答案" in text}

def classify_file(path, header_text: str) -> dict:
    path = Path(path)
    stem = path.stem
    m = _NUM_STEM.match(stem)
    header = parse_header(header_text)
    if m:
        era = "new"
        year, rnd = int(m.group(1)), int(m.group(2))
        is_answer_file = m.group(3) == "a"
    else:
        era = "old"
        year, rnd = header["year"], header["round"]
        is_answer_file = False  # 舊制答案內嵌於題本，無獨立答案檔
    return {
        "source": str(path),
        "year": year,
        "round": rnd,
        "era": era,
        "is_answer_file": is_answer_file,
        "is_question_file": not is_answer_file,
    }

def build_manifest(pdf_paths, out_path) -> list[dict]:
    manifest = []
    for p in pdf_paths:
        head = pdfutils.pdf_text(p, first=1, last=1)
        manifest.append(classify_file(p, head))
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest
