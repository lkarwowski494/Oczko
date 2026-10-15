#!/usr/bin/env python3
"""
Oczko — Generator Niezależnego Korpusu Referencyjnego (Differential Testing)
Zgodny ze standardem repozytorium organizer (np. scripts/gen-contrast-corpus.py).
Generuje matematycznie zweryfikowane wartości wzorcowe dla:
1. Przeliczania próbek obliczeniowych (Gauge Swatch)
2. Przeliczania grubości przędzy (Yarn Grist)
3. Kontrastu kolorów WCAG 2.2 dla palety aplikacji Oczko
"""

import json
import math
import os
import sys

def convert_length(val: float, from_unit: str, to_unit: str) -> float:
    INCH_TO_CM = 2.54
    if from_unit == to_unit:
        return val
    if from_unit == "inch" and to_unit == "cm":
        return val * INCH_TO_CM
    return val / INCH_TO_CM

def calc_gauge(swatch_st: int, swatch_rows: int, swatch_w: float, swatch_h: float, swatch_unit: str,
               target_w: float, target_h: float, target_unit: str):
    sw_w_target = convert_length(swatch_w, swatch_unit, target_unit)
    sw_h_target = convert_length(swatch_h, swatch_unit, target_unit)
    
    st_per_unit = round(swatch_st / sw_w_target, 4)
    rows_per_unit = round(swatch_rows / sw_h_target, 4)
    
    target_st = max(1, round(target_w * (swatch_st / sw_w_target)))
    target_rows = max(1, round(target_h * (swatch_rows / sw_h_target)))
    
    return {
        "swatch": {"stitches": swatch_st, "rows": swatch_rows, "width": swatch_w, "height": swatch_h, "unit": swatch_unit},
        "target": {"width": target_w, "height": target_h, "unit": target_unit},
        "expected": {
            "stitchesPerUnit": st_per_unit,
            "rowsPerUnit": rows_per_unit,
            "targetStitches": target_st,
            "targetRows": target_rows,
            "unit": target_unit
        }
    }

def calc_grist(weight_g: float, length_m: float):
    m_per_100g = round((length_m / weight_g) * 100, 2)
    m_per_g = round(length_m / weight_g, 4)
    g_per_m = round(weight_g / length_m, 4)
    return {
        "weightGrams": weight_g,
        "lengthMeters": length_m,
        "expected": {
            "metersPer100g": m_per_100g,
            "metersPerGram": m_per_g,
            "gramsPerMeter": g_per_m
        }
    }

def relative_luminance(hex_color: str) -> float:
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0

    def adjust(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r_adj = adjust(r)
    g_adj = adjust(g)
    b_adj = adjust(b)
    return 0.2126 * r_adj + 0.7152 * g_adj + 0.0722 * b_adj

def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 4)

def generate_corpus():
    # 1. Próbki dziewiarskie
    gauge_cases = [
        calc_gauge(22, 30, 10, 10, "cm", 50, 60, "cm"),
        calc_gauge(20, 26, 10, 10, "cm", 100, 70, "cm"),
        calc_gauge(18, 24, 4, 4, "inch", 20, 25, "inch"),
        calc_gauge(24, 32, 10, 10, "cm", 22, 28, "inch"), # cross-unit cm -> inch
        calc_gauge(16, 22, 4, 4, "inch", 55, 65, "cm"),   # cross-unit inch -> cm
        calc_gauge(14, 18, 10, 10, "cm", 120, 150, "cm"), # koc
        calc_gauge(28, 38, 10, 10, "cm", 20, 25, "cm"),   # skarpetki
        calc_gauge(10, 14, 10, 10, "cm", 45, 50, "cm"),   # bulky sweter
    ]

    # 2. Grist włóczek
    grist_cases = [
        calc_grist(50, 175), # Drops Nord (Fingering)
        calc_grist(50, 105), # Drops Lima (DK)
        calc_grist(50, 75),  # Drops Alaska (Aran)
        calc_grist(50, 50),  # Drops Polaris (Super Bulky)
        calc_grist(100, 420),# Motek skarpetkowy 100g
        calc_grist(25, 210), # Drops Kid-Silk (Mohair)
    ]

    # 3. Kontrasty palety Oczko
    palette = {
        "bg_light": "#FAFAFA",
        "card_bg": "#FFFFFF",
        "text_main": "#1C1C1E",
        "text_muted": "#8E8E93",
        "primary_blue": "#2C3E50",
        "accent_orange": "#E07A5F",
        "success_green": "#34C759",
        "warning_orange": "#FF9500",
        "danger_red": "#FF3B30",
        "watch_bg": "#000000",
        "watch_text": "#FFFFFF",
    }

    contrast_cases = []
    pairs = [
        ("text_main", "bg_light"),
        ("text_main", "card_bg"),
        ("text_muted", "bg_light"),
        ("watch_text", "watch_bg"),
        ("primary_blue", "bg_light"),
        ("accent_orange", "card_bg"),
        ("danger_red", "card_bg"),
    ]

    for fg_name, bg_name in pairs:
        fg_hex = palette[fg_name]
        bg_hex = palette[bg_name]
        ratio = contrast_ratio(fg_hex, bg_hex)
        contrast_cases.append({
            "foreground": fg_hex,
            "background": bg_hex,
            "fgName": fg_name,
            "bgName": bg_name,
            "ratio": ratio,
            "wcagAaPassed": ratio >= 4.5,
            "wcagAaaPassed": ratio >= 7.0
        })

    return {
        "version": "1.0",
        "generatedBy": "scripts/gen-gauge-corpus.py (Python 3)",
        "gaugeCases": gauge_cases,
        "gristCases": grist_cases,
        "contrastCases": contrast_cases
    }

if __name__ == "__main__":
    corpus = generate_corpus()
    output_dir = os.path.join(os.path.dirname(__file__), "..", "src", "core", "__tests__", "fixtures")
    os.makedirs(output_dir, exist_ok=True)
    target_path = os.path.join(output_dir, "gauge-corpus.json")
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)
    print(f"Generated corpus with {len(corpus['gaugeCases'])} gauge cases, {len(corpus['gristCases'])} grist cases, and {len(corpus['contrastCases'])} contrast pairs -> {target_path}")
