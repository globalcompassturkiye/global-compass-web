# -*- coding: utf-8 -*-
"""Legacy helper — prefer smart-img-optimize.ps1 for fetchpriority / decoding=sync rules."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HERO_CLASS_SUBSTR = (
    "-foto",
    "kings-education-gorsel",
    "chantemerle-gorsel",
    "immerse-kampus-gorsel",
    "alpadia-kampus-gorsel",
    "investin-logo",
    "immerse-logo",
    "sportech-academy-logo",
    "alpadia-logo",
    "futbol-logo",
)

SRC_NO_LAZY_SUBSTR = (
    "home-icon",
    "/sosyal/",
    "global-compass-favicon",
)

CLASS_NO_LAZY_SUBSTR = (
    "footer-logo-img",
    "odeme-ust-logo-img",
)

IMG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE)


def in_header(html: str, idx: int) -> bool:
    h0 = html.rfind("<header", 0, idx)
    if h0 == -1:
        return False
    h1 = html.find("</header>", h0)
    if h1 == -1:
        return False
    return idx < h1


def skip_lazy(tag: str, html: str, idx: int) -> bool:
    if re.search(r"\bloading\s*=", tag, re.I):
        return True
    src_m = re.search(r'\bsrc\s*=\s*["\']([^"\']*)["\']', tag, re.I)
    src = (src_m.group(1) if src_m else "").lower()
    for s in SRC_NO_LAZY_SUBSTR:
        if s.lower() in src:
            return True
    if "/img/logo/" in src:
        return True
    if "kings-education-photo" in src and "accreditation" not in src:
        return True
    cm = re.search(r'\bclass\s*=\s*["\']([^"\']*)["\']', tag, re.I)
    classes = (cm.group(1) if cm else "").lower()
    for s in CLASS_NO_LAZY_SUBSTR:
        if s in classes:
            return True
    for s in HERO_CLASS_SUBSTR:
        if s.lower() in classes:
            if "akreditasyon" in classes:
                return False
            return True
    if in_header(html, idx):
        return True
    return False


def process_tag(tag: str, html: str, idx: int) -> str:
    need_dec = not re.search(r"\bdecoding\s*=", tag, re.I)
    need_lazy = not re.search(r"\bloading\s*=", tag, re.I) and not skip_lazy(tag, html, idx)
    if not need_dec and not need_lazy:
        return tag
    parts: list[str] = []
    if need_lazy:
        parts.append('loading="lazy"')
    if need_dec:
        parts.append('decoding="async"')
    frag = " " + " ".join(parts)
    m = re.search(r"(\s*)(/?)>$", tag)
    if not m:
        return tag
    slash = m.group(2)
    core = tag[: m.start()].rstrip()
    if slash:
        return core + frag + " />"
    return core + frag + ">"


def process_file(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    out: list[str] = []
    last = 0
    for m in IMG_RE.finditer(raw):
        out.append(raw[last : m.start()])
        out.append(process_tag(m.group(0), raw, m.start()))
        last = m.end()
    out.append(raw[last:])
    new_raw = "".join(out)
    if new_raw != raw:
        path.write_text(new_raw, encoding="utf-8")
        return True
    return False


def main() -> int:
    n = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "node_modules" in path.parts:
            continue
        if process_file(path):
            n += 1
            print(path.relative_to(ROOT))
    print(f"Updated {n} files.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
