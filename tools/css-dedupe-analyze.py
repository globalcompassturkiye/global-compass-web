# -*- coding: utf-8 -*-
"""Analyze style.css for duplicate declaration blocks and repetition stats."""
import re
from collections import Counter, defaultdict

path = "css/style.css"
with open(path, "r", encoding="utf-8", errors="replace") as f:
    raw = f.read()

text = re.sub(r"/\*.*?\*/", "", raw, flags=re.DOTALL)


def extract_rules_from_block(block_inner: str, prefix: str):
    out = []
    k = 0
    n = len(block_inner)
    while k < n:
        while k < n and block_inner[k].isspace():
            k += 1
        if k >= n:
            break
        sel_end = block_inner.find("{", k)
        if sel_end == -1:
            break
        sel = block_inner[k:sel_end].strip()
        d = 1
        m = sel_end + 1
        while m < n and d:
            if block_inner[m] == "{":
                d += 1
            elif block_inner[m] == "}":
                d -= 1
            m += 1
        decl = block_inner[sel_end + 1 : m - 1]
        if sel and decl.strip():
            out.append((prefix, sel, decl))
        k = m
    return out


rules = []
i = 0
n = len(text)
while i < n:
    if text[i].isspace():
        i += 1
        continue
    if text[i : i + 7] == "@import":
        line_end = text.find(";", i)
        if line_end == -1:
            break
        i = line_end + 1
        continue
    if text[i] == "@":
        j = i
        while j < n and text[j] != "{":
            j += 1
        if j >= n:
            break
        depth = 1
        j += 1
        start = i
        while j < n and depth:
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
            j += 1
        block = text[start:j]
        at_name = block.split()[0] if block.split() else ""
        if at_name.startswith("@media"):
            inner_start = block.find("{") + 1
            inner = block[inner_start:-1]
            rules.extend(extract_rules_from_block(inner, "@media"))
        # skip @keyframes, @font-face body as whole
        i = j
        continue
    sel_end = text.find("{", i)
    if sel_end == -1:
        break
    sel = text[i:sel_end].strip()
    d = 1
    j = sel_end + 1
    while j < n and d:
        if text[j] == "{":
            d += 1
        elif text[j] == "}":
            d -= 1
        j += 1
    decl = text[sel_end + 1 : j - 1]
    if sel and decl.strip():
        rules.append(("top", sel, decl))
    i = j


def normalize_decl(decl: str):
    lines = []
    for line in decl.split(";"):
        line = line.strip()
        if not line or ":" not in line:
            continue
        prop, val = line.split(":", 1)
        prop = prop.strip().lower()
        val = re.sub(r"\s+", " ", val.strip())
        lines.append((prop, val))
    lines.sort(key=lambda x: x[0])
    return tuple(lines)


by_body = defaultdict(list)
for scope, sel, decl in rules:
    nd = normalize_decl(decl)
    if not nd:
        continue
    by_body[nd].append((scope, sel))

merge_groups = {k: v for k, v in by_body.items() if len(v) >= 2}


def rough_rule_lines(sel: str, decl_line_count: int) -> int:
    sel_lines = max(1, len(sel) // 110 + (1 if len(sel) % 110 else 0))
    return sel_lines + 1 + decl_line_count + 1  # { decl }


total_saved = 0
groups_detail = []
for body, items in merge_groups.items():
    decl_lc = len(body)
    n = len(items)
    sels = [s for _, s in items]
    cur = sum(rough_rule_lines(s, decl_lc) for s in sels)
    merged_sel = ", ".join(sels)
    merged = rough_rule_lines(merged_sel, decl_lc)
    sav = cur - merged
    if sav > 0:
        total_saved += sav
        groups_detail.append((sav, n, decl_lc, merged_sel[:80]))

groups_detail.sort(reverse=True)

print("=== style.css duplicate-body analysis ===")
print(f"File bytes: {len(raw.encode('utf-8'))}")
print(f"Rules with non-empty declarations: {len(rules)}")
print(f"Unique normalized declaration bodies: {len(by_body)}")
print(f"Declaration bodies used 2+ times: {len(merge_groups)}")
print(f"Total selectors in duplicate groups: {sum(len(v) for v in merge_groups.values())}")
print(f"Rough line savings (merge duplicate bodies only): {total_saved}")
print(f"\nTop 10 duplicate groups by estimated savings:")
for sav, n, dl, preview in groups_detail[:10]:
    print(f"  save~{sav} lines | {n} selectors | {dl} props | {preview!r}...")

hexes = re.findall(r"#(?:[0-9a-fA-F]{3}){1,2}\b", raw)
hc = Counter(h.lower() for h in hexes)
print("\nTop 12 hex colors:")
for h, cnt in hc.most_common(12):
    print(f"  {h}: {cnt}")

fs = re.findall(r"font-size:\s*([^;]+);", raw, re.I)
fc = Counter(re.sub(r"\s+", " ", x.strip()) for x in fs)
print("\nTop 10 font-size values:")
for v, cnt in fc.most_common(10):
    print(f"  {v!r}: {cnt}")

# !important count
imp = raw.count("!important")
print(f"\n!important occurrences: {imp}")
