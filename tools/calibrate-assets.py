#!/usr/bin/env python3
"""Analyze retro-phone.png to automatically derive percentage-based positions
for the LCD text overlay, title, divider, and footer markers.

Strategy:
  The retro phone is a paletted PNG with transparent background.
  Instead of trying to detect the LCD interior boundaries directly,
  we detect the phone body outer bounding box (robust via OTSU on
  the paletted alpha channel), then derive LCD position from known
  anatomy ratios of a retro candy-bar phone form factor.

  The phone body detection works with ANY image that has a distinct
  foreground on a transparent/background. If the phone shape changes
  (new image), the LCD offsets are recomputed from the new bounding box.

Usage:
    python3 tools/calibrate-assets.py
    python3 tools/calibrate-assets.py --preview   # save annotated preview
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# Known LCD anatomy as a fraction of the phone body bounding box.
# These ratios are derived from the hand-tuned calibration values
# (left=28.1%, top=20.4%, width=45.4%, height=40.9%) relative to
# the phone body bounding box (left=1.3%, top=1.1%, width=97.3%, height=97.9%).
#
#   lcd_left_fraction  = (28.1 - 1.3) / 97.3 = 0.275
#   lcd_top_fraction   = (20.4 - 1.1) / 97.9 = 0.197
#   lcd_width_fraction = 45.4 / 97.3 = 0.467
#   lcd_height_fraction= 40.9 / 97.9 = 0.418
#
# These describe where the LCD is *within* the phone body, as a
# fraction of the phone body's dimensions. This is robust because
# the phone body bounding box is easy to detect and scales with
# any image size.
LCD = {
    "left": 0.275,
    "top": 0.197,
    "width": 0.467,
    "height": 0.418,
}
# Title/divider/footer are positioned as an offset from the LCD region,
# expressed as a fraction of the image height (since they're card-level %).
TITLE_OFFSET = 4.1      # percentage points below LCD top
DIVIDER_OFFSET = 6.7     # percentage points below LCD top (2.6 below title)
FOOTER_OFFSET = 11.5    # percentage points above LCD bottom
# Note: footer (date+SAVE) sits in the middle of the LCD, not near its bottom.
# The hand-tuned value is: footer_top = 52.5%
# LCD bottom = lcd_top + lcd_height = 20.4 + 40.9 = 61.3%
# So footer_offset = 61.3 - 52.5 = 8.8 from bottom? No... the derived calc is:
# footer_top = lcd_top + lcd_height - footer_offset_from_bottom
# 52.5 = 20.4 + 40.9 - footer_offset → footer_offset = 8.8
# BUT that's measured from LCD bottom edge. Let me use a simpler approach:
# footer_top is at a fixed percentage of LCD height from LCD top.
# footer_top = lcd_top + LCD_height * FOOTER_FRACTION
# FOOTER_FRACTION = (52.5 - 20.4) / 40.9 = 0.785
FOOTER_FRACTION = 0.785  # footer sits at ~78.5% of LCD height from the top


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--preview", action="store_true")
    return parser.parse_args()


def load_image_rgb(input_path: Path) -> np.ndarray:
    """Load image as RGB numpy array, handling paletted PNG with alpha."""
    pil_img = Image.open(str(input_path))
    # Convert paletted with alpha to RGBA first
    if pil_img.mode == "P":
        pil_img = pil_img.convert("RGBA")
    elif pil_img.mode != "RGBA":
        pil_img = pil_img.convert("RGBA")
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGBA2RGB)


def detect_phone_body_bbox(img: np.ndarray) -> tuple[int, int, int, int]:
    """Detect the phone body bounding box.

    Works by thresholding the image brightness to find the foreground
    (phone body) vs. background/transparent areas.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    # OTSU separates phone body (brighter) from transparent background (darker)
    _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), dtype=np.uint8))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise RuntimeError("Could not detect phone body.")
    return cv2.boundingRect(max(contours, key=cv2.contourArea))


def compute_positions(
    bbox: tuple[int, int, int, int], img_w: int, img_h: int,
) -> dict[str, dict[str, float]]:
    """Convert phone body bbox to percentage positions using known anatomy."""
    bx, by, bw, bh = bbox

    # LCD as fraction of phone body
    lcd_left = round((bx + bw * LCD["left"]) / img_w * 100, 1)
    lcd_top = round((by + bh * LCD["top"]) / img_h * 100, 1)
    lcd_width = round((bw * LCD["width"]) / img_w * 100, 1)
    lcd_height = round((bh * LCD["height"]) / img_h * 100, 1)

    # Derived positions
    title_top = round(lcd_top + TITLE_OFFSET, 1)
    divider_top = round(lcd_top + DIVIDER_OFFSET, 1)
    footer_top = round(lcd_top + lcd_height * FOOTER_FRACTION, 1)

    return {
        "lcd": {"left": lcd_left, "top": lcd_top, "width": lcd_width, "height": lcd_height},
        "title": {"top": title_top},
        "divider": {"top": divider_top},
        "footer": {"top": footer_top},
    }


def write_calibration_ts(pos: dict, output_path: Path) -> None:
    def fmt(v: float) -> str:
        return str(v) if v == int(v) else f"{v}"

    lcd = pos["lcd"]
    t = pos["title"]
    d = pos["divider"]
    f = pos["footer"]

    content = f"""\
// auto-generated by tools/calibrate-assets.py
// Do not edit manually. Re-run `npm run calibrate` after changing retro-phone.png.

export const RETRO_PHONE = {{
  lcd:  {{ left: {fmt(lcd["left"])}, top: {fmt(lcd["top"])}, width: {fmt(lcd["width"])}, height: {fmt(lcd["height"])} }},
  title:  {{ top: {fmt(t["top"])} }},
  divider: {{ top: {fmt(d["top"])} }},
  footer: {{ top: {fmt(f["top"])} }},
}} as const;
"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    print(f"[output] {output_path}")


def write_json(pos: dict, json_path: Path) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(pos, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[json]   {json_path}")


def save_preview(img: np.ndarray, bbox: tuple[int, int, int, int],
                 pos: dict, output_path: Path) -> None:
    h, w = img.shape[:2]
    vis = img.copy()

    # Phone body bounding box (blue)
    bx, by, bw, bh = bbox
    cv2.rectangle(vis, (bx, by), (bx + bw, by + bh), (100, 150, 255), 2)
    _put_label(vis, "phone body", bx, by - 6, (100, 150, 255))

    # LCD rectangle (green)
    lx = int(pos["lcd"]["left"] * w / 100)
    ly = int(pos["lcd"]["top"] * h / 100)
    lw = int(pos["lcd"]["width"] * w / 100)
    lh = int(pos["lcd"]["height"] * h / 100)
    cv2.rectangle(vis, (lx, ly), (lx + lw, ly + lh), (55, 200, 55), 3)
    _put_label(vis, "LCD", lx, ly - 6, (55, 200, 55))

    # Title/divider/footer guidelines
    for label, key, color in [
        ("title", "title", (255, 180, 50)),
        ("divider", "divider", (200, 130, 255)),
        ("footer", "footer", (100, 180, 255)),
    ]:
        py = int(pos[key]["top"] * h / 100.0)
        cv2.line(vis, (20, py), (w - 20, py), color, 2)
        _put_label(vis, f"{label} {pos[key]['top']}%", w - 20, py - 6, color, anchor="right")

    cv2.imwrite(str(output_path), vis)
    print(f"[preview] {output_path}")


def _put_label(img: np.ndarray, text: str, x: int, y: int,
               color: tuple[int, int, int], anchor: str = "left") -> None:
    font = cv2.FONT_HERSHEY_SIMPLEX
    fs, thick = 0.5, 2
    (tw, th), _ = cv2.getTextSize(text, font, fs, thick)
    px = (x - tw - 6) if anchor == "right" else (x + 6)
    py = max(16, y - 2)
    cv2.rectangle(img, (px - 4, py - th - 2), (px + tw + 4, py + 4), (30, 30, 30), -1)
    cv2.putText(img, text, (px, py), font, fs, color, thick)


def run_calibration(input_path: Path, output_path: Path, save_preview_img: bool = False) -> int:
    if not input_path.exists():
        print(f"[error] Input not found: {input_path}")
        return 1

    img = load_image_rgb(input_path)
    img_h, img_w = img.shape[:2]
    print(f"[image] {input_path}  ({img_w}×{img_h})")

    bbox = detect_phone_body_bbox(img)
    bx, by, bw, bh = bbox
    print(f"[detect] phone body: ({bx},{by}) → ({bx + bw},{by + bh}) = {bw}×{bh}")
    print(f"         → left={bx/img_w*100:.1f}% top={by/img_h*100:.1f}% "
          f"width={bw/img_w*100:.1f}% height={bh/img_h*100:.1f}%")

    pos = compute_positions(bbox, img_w, img_h)
    print()
    print(f"  LCD:     left={pos['lcd']['left']:<5} top={pos['lcd']['top']:<5} "
          f"width={pos['lcd']['width']:<5} height={pos['lcd']['height']:<5}")
    print(f"  Title:   top={pos['title']['top']}")
    print(f"  Divider: top={pos['divider']['top']}")
    print(f"  Footer:  top={pos['footer']['top']}")

    write_calibration_ts(pos, output_path)
    write_json(pos, output_path.with_suffix(".json"))

    if save_preview_img:
        preview_path = output_path.parent.parent.parent / "output/calibrate-preview.png"
        save_preview(img, bbox, pos, preview_path)

    print()
    print("[ok] Calibration complete.")
    return 0


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent.parent
    input_path = args.input or (repo_root / "public/assets/v2/frames/retro-phone.png")
    output_path = args.output or (repo_root / "src/app/lib/calibration.ts")
    return run_calibration(input_path, output_path, save_preview_img=args.preview)


if __name__ == "__main__":
    raise SystemExit(main())
