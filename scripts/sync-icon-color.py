#!/usr/bin/env python3
"""
Resyncs the app icon/favicon background color (and index.html's theme-color
meta tag) to match src/index.css's --color-primary, after you change it.

These assets can't reference the CSS variable directly — favicon.svg is
loaded outside the page's DOM, the PNGs are rasters, and theme-color is a
plain meta attribute — so this script is the single place that keeps them
in sync instead of hand-editing 5 files. See CLAUDE.md.

Usage: python3 scripts/sync-icon-color.py '#15803d'
"""
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FAVICON = ROOT / "public" / "favicon.svg"
INDEX_HTML = ROOT / "index.html"
PNGS = ["icon-192.png", "icon-512.png", "icon-maskable-512.png"]
BODY_COLOR = (226, 232, 240)  # #e2e8f0, fixed — not part of the primary-color swap


def hexc(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def sync_svg(new_hex: str) -> None:
    svg = FAVICON.read_text()
    fills = set(re.findall(r'fill="(#[0-9a-fA-F]{6})"', svg))
    # The two smallest-count-of-two colors used for bg + divider (same value);
    # BODY_COLOR and the dark handle color are fixed, so exclude those.
    old_bg_candidates = fills - {to_hex(BODY_COLOR), "#0f172a"}
    if len(old_bg_candidates) != 1:
        print(f"Expected exactly one bg color in {FAVICON}, found {old_bg_candidates}")
        sys.exit(1)
    old_hex = old_bg_candidates.pop()
    svg = svg.replace(f'fill="{old_hex}"', f'fill="{new_hex}"')
    FAVICON.write_text(svg)
    print(f"favicon.svg: {old_hex} -> {new_hex}")


def sync_pngs(new_hex: str) -> None:
    new_bg = hexc(new_hex)
    for name in PNGS:
        path = ROOT / "public" / name
        im = Image.open(path).convert("RGB")
        old_bg = im.getpixel((0, 0))
        px = im.load()
        w, h = im.size
        old_v = tuple(old_bg[i] - BODY_COLOR[i] for i in range(3))
        denom = sum(v * v for v in old_v) or 1
        for y in range(h):
            for x in range(w):
                p = px[x, y]
                diff = tuple(p[i] - BODY_COLOR[i] for i in range(3))
                alpha = sum(diff[i] * old_v[i] for i in range(3)) / denom
                alpha = max(0.0, min(1.0, alpha))
                recon = tuple(round(alpha * old_bg[i] + (1 - alpha) * BODY_COLOR[i]) for i in range(3))
                if sum((p[i] - recon[i]) ** 2 for i in range(3)) ** 0.5 < 6:
                    px[x, y] = tuple(round(alpha * new_bg[i] + (1 - alpha) * BODY_COLOR[i]) for i in range(3))
        im.save(path)
        print(f"{name}: {to_hex(old_bg)} -> {new_hex}")


def sync_theme_color(new_hex: str) -> None:
    html = INDEX_HTML.read_text()
    updated = re.sub(
        r'(<meta name="theme-color" content=")#[0-9a-fA-F]{6}(" />)',
        rf"\g<1>{new_hex}\g<2>",
        html,
    )
    if updated == html:
        print("index.html: theme-color meta tag not found / already up to date")
    else:
        INDEX_HTML.write_text(updated)
        print(f"index.html: theme-color -> {new_hex}")


def main() -> None:
    if len(sys.argv) != 2 or not re.fullmatch(r"#[0-9a-fA-F]{6}", sys.argv[1]):
        print("Usage: python3 scripts/sync-icon-color.py '#rrggbb'")
        sys.exit(1)
    new_hex = sys.argv[1].lower()
    sync_svg(new_hex)
    sync_pngs(new_hex)
    sync_theme_color(new_hex)


if __name__ == "__main__":
    main()
