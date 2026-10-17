#!/usr/bin/env python3
"""
Oczko — Niezależna Wyrocznia Kontrastu Motywu (RD-ENG-02, BR-TEST-011..014)
Liczy luminancję względną i stosunek kontrastu WCAG 2.1 w czystym Pythonie
niezależnie od środowiska TypeScript / React Native.
"""

import json
import pathlib
import re
from fractions import Fraction

SRC = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'core' / 'theme.ts'
OUT_FIXTURE = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'core' / '__tests__' / 'fixtures' / 'theme-contrast-corpus.json'

HEX_PATTERN = re.compile(r"(\w+):\s*'(#[0-9A-Fa-f]{6})'")


def lin(v8: int) -> float:
    s = Fraction(v8, 255)
    if s <= Fraction(4045, 100000):
        return float(s / Fraction(1292, 100))
    return ((float(s) + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_str: str) -> float:
    hex_clean = hex_str.lstrip('#')
    r = int(hex_clean[0:2], 16)
    g = int(hex_clean[2:4], 16)
    b = int(hex_clean[4:6], 16)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    hi, lo = max(l1, l2), min(l1, l2)
    return round((hi + 0.05) / (lo + 0.05), 4)


def main():
    src_text = SRC.read_text(encoding='utf-8')
    colors = dict(HEX_PATTERN.findall(src_text))
    assert 'bg' in colors, "Brak koloru 'bg' w theme.ts"
    assert 'textPrimary' in colors, "Brak koloru 'textPrimary' w theme.ts"

    corpus = {
        "metadata": {
            "source": "src/core/theme.ts",
            "standard": "WCAG 2.1 AA",
            "formula": "(L1 + 0.05) / (L2 + 0.05)"
        },
        "luminance": {name: round(relative_luminance(val), 5) for name, val in colors.items()},
        "pairs": {}
    }

    # Kluczowe pary interfejsu Oczko
    key_pairs = [
        ("textPrimary", "bg"),
        ("textPrimary", "bgCard"),
        ("textPrimary", "bgCardSecondary"),
        ("textSecondary", "bg"),
        ("textSecondary", "bgCard"),
        ("terracotta", "bg"),
        ("roseGold", "bg"),
        ("sage", "bg"),
        ("gold", "bg"),
        ("danger", "bg"),
    ]

    for fg, bg in key_pairs:
        if fg in colors and bg in colors:
            ratio = contrast_ratio(colors[fg], colors[bg])
            passes_normal = ratio >= 4.5
            passes_large = ratio >= 3.0
            corpus["pairs"][f"{fg}_on_{bg}"] = {
                "fg": colors[fg],
                "bg": colors[bg],
                "ratio": ratio,
                "wcag_aa_normal": passes_normal,
                "wcag_aa_large": passes_large
            }

    OUT_FIXTURE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FIXTURE.write_text(json.dumps(corpus, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Wygenerowano korpus: {OUT_FIXTURE} ({len(corpus['pairs'])} par)")
    return 0


if __name__ == '__main__':
    main()
