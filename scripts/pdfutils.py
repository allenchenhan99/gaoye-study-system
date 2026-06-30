import re
import subprocess
from pathlib import Path

def pdf_text(path, first=None, last=None) -> str:
    cmd = ["pdftotext"]
    if first is not None:
        cmd += ["-f", str(first)]
    if last is not None:
        cmd += ["-l", str(last)]
    cmd += [str(path), "-"]
    return subprocess.run(cmd, capture_output=True, text=True).stdout

def pdf_page_count(path) -> int:
    out = subprocess.run(["pdfinfo", str(path)], capture_output=True, text=True).stdout
    for line in out.splitlines():
        if line.startswith("Pages"):
            return int(line.split(":")[1].strip())
    return 0

def pdf_image_pages(path) -> list[int]:
    out = subprocess.run(["pdfimages", "-list", str(path)], capture_output=True, text=True).stdout
    pages = set()
    for line in out.splitlines():
        m = re.match(r"\s*(\d+)\s+\d+\s+\w+", line)
        if m:
            pages.add(int(m.group(1)))
    return sorted(pages)
