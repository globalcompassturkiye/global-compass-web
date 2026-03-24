# -*- coding: utf-8 -*-
"""Tek seferlik: inline ana menü IIFE -> /js/nav-submenu.js (projeyi taramak için)."""
import re
import sys
from pathlib import Path
from typing import Optional

MARKER = "var toggle = document.querySelector('.nav-toggle');"
RE_FN = re.compile(r"\(function\s*\(\s*\)\s*\{")


def find_inline_script_start(content: str, marker_pos: int) -> int:
    pos = marker_pos
    while pos > 0:
        i = content.rfind("<script", 0, pos)
        if i == -1:
            return -1
        end = content.find(">", i)
        if end == -1:
            return -1
        tag = content[i : end + 1]
        if "src=" in tag or "ld+json" in tag or "application/ld" in tag:
            pos = i
            continue
        return i
    return -1


def first_iife_end_after(content: str, script_start: int) -> Optional[int]:
    m = RE_FN.search(content, script_start, script_start + 800)
    if not m:
        return None
    body_start = m.end() - 1  # '{' konumu
    depth = 0
    k = body_start
    while k < len(content):
        c = content[k]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                k += 1
                break
        k += 1
    else:
        return None
    if k + 4 > len(content) or content[k : k + 4] != ")();":
        return None
    return k + 4


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if MARKER not in text:
        return False

    marker_pos = text.find(MARKER)
    script_start = find_inline_script_start(text, marker_pos)
    if script_start == -1:
        print("skip (no script tag):", path)
        return False

    iife_end = first_iife_end_after(text, script_start)
    if iife_end is None:
        print("skip (brace parse):", path)
        return False

    script_close = text.find("</script>", iife_end)
    if script_close == -1:
        print("skip (no </script>):", path)
        return False

    rest = text[iife_end:script_close]
    rest_stripped = rest.lstrip("\r\n\t ")

    inject = '<script src="/js/nav-submenu.js" defer></script>'
    if rest_stripped:
        inject += "\n    <script>\n" + rest_stripped + "\n</script>"

    new_text = text[:script_start] + inject + text[script_close + len("</script>") :]
    path.write_text(new_text, encoding="utf-8")
    print("ok:", path)
    return True


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    n = 0
    for p in sorted(root.rglob("*.html")):
        if "node_modules" in p.parts:
            continue
        try:
            if process_file(p):
                n += 1
        except Exception as e:
            print("error", p, e, file=sys.stderr)
    print("updated", n, "files")


if __name__ == "__main__":
    main()
