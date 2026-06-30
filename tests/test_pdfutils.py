from scripts import pdfutils

def test_pdf_text_invokes_pdftotext(monkeypatch):
    captured = {}
    class R: stdout = "some text"
    def fake_run(cmd, **kw):
        captured["cmd"] = cmd
        return R()
    monkeypatch.setattr(pdfutils.subprocess, "run", fake_run)
    assert pdfutils.pdf_text("x.pdf", first=2, last=3) == "some text"
    assert captured["cmd"][:1] == ["pdftotext"]
    assert "-f" in captured["cmd"] and "2" in captured["cmd"]
    assert "-l" in captured["cmd"] and "3" in captured["cmd"]

def test_pdf_page_count_parses_pdfinfo(monkeypatch):
    class R: stdout = "Title: x\nPages:          12\nEncrypted: no\n"
    monkeypatch.setattr(pdfutils.subprocess, "run", lambda c, **k: R())
    assert pdfutils.pdf_page_count("x.pdf") == 12

def test_pdf_image_pages_parses_pdfimages(monkeypatch):
    listing = (
        "page   num  type   width height\n"
        "--------------------------------\n"
        "   3     0 image     200    80\n"
        "   3     1 image     200    80\n"
        "   7     2 image     100    50\n"
    )
    class R: stdout = listing
    monkeypatch.setattr(pdfutils.subprocess, "run", lambda c, **k: R())
    assert pdfutils.pdf_image_pages("x.pdf") == [3, 7]
