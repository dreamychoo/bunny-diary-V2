#!/usr/bin/env python3
from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np


@dataclass
class ExtractionOptions:
    white_threshold: int = 245
    min_area: float = 1200
    min_width: int = 24
    min_height: int = 24
    padding: int = 8
    close_kernel: int = 3
    edge_cleanup: bool = True
    erode: int = 1
    feather: float = 0.8
    save_preview: bool = False


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Detect non-white regions with OpenCV contours and export each element as a transparent PNG."
    )
    parser.add_argument("input", type=Path, help="Input image path.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Output directory. Defaults to ./extracted-next-to-source/<image-stem>/",
    )
    parser.add_argument(
        "--white-threshold",
        type=int,
        default=245,
        help="Pixels darker than this are treated as non-white foreground. Default: 245",
    )
    parser.add_argument(
        "--min-area",
        type=float,
        default=1200,
        help="Ignore contours smaller than this area. Default: 1200",
    )
    parser.add_argument(
        "--min-width",
        type=int,
        default=24,
        help="Ignore boxes narrower than this. Default: 24",
    )
    parser.add_argument(
        "--min-height",
        type=int,
        default=24,
        help="Ignore boxes shorter than this. Default: 24",
    )
    parser.add_argument(
        "--padding",
        type=int,
        default=8,
        help="Transparent padding around each exported element. Default: 8",
    )
    parser.add_argument(
        "--close-kernel",
        type=int,
        default=3,
        help="Morph close kernel size. Increase to merge broken strokes. Default: 3",
    )
    parser.add_argument(
        "--edge-cleanup",
        dest="edge_cleanup",
        action="store_true",
        default=True,
        help="Enable alpha edge cleanup. Default: on",
    )
    parser.add_argument(
        "--no-edge-cleanup",
        dest="edge_cleanup",
        action="store_false",
        help="Disable alpha edge cleanup.",
    )
    parser.add_argument(
        "--erode",
        type=int,
        default=1,
        help="Light alpha erosion in pixels before feathering. Default: 1",
    )
    parser.add_argument(
        "--feather",
        type=float,
        default=0.8,
        help="Light alpha feather radius in pixels. Default: 0.8",
    )
    parser.add_argument(
        "--save-preview",
        action="store_true",
        help="Also save a preview image with bounding boxes.",
    )
    return parser.parse_args()


def output_dir_for(input_path: Path, output_dir: Path | None = None) -> Path:
    default_output = input_path.parent / "extracted-next-to-source" / input_path.stem
    return output_dir.expanduser().resolve() if output_dir else default_output


def load_image_rgba(path: Path) -> tuple[np.ndarray, np.ndarray]:
    image = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if image is None:
        raise SystemExit(f"Could not read image: {path}")

    if image.ndim == 2:
        bgr = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        alpha = np.full(image.shape[:2], 255, dtype=np.uint8)
    elif image.shape[2] == 4:
        bgr = image[:, :, :3]
        alpha = image[:, :, 3]
    else:
        bgr = image[:, :, :3]
        alpha = np.full(image.shape[:2], 255, dtype=np.uint8)

    rgba = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGBA)
    rgba[:, :, 3] = alpha
    return rgba, alpha


def build_foreground_mask(rgba: np.ndarray, alpha: np.ndarray, white_threshold: int, close_kernel: int) -> np.ndarray:
    rgb = rgba[:, :, :3]
    non_white = np.any(rgb < white_threshold, axis=2).astype(np.uint8) * 255
    alpha_mask = (alpha > 0).astype(np.uint8) * 255
    mask = cv2.bitwise_and(non_white, alpha_mask)

    if close_kernel > 1:
        kernel = np.ones((close_kernel, close_kernel), dtype=np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    return mask


def contour_boxes(mask: np.ndarray, min_area: float, min_width: int, min_height: int) -> list[tuple[int, int, int, int]]:
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes: list[tuple[int, int, int, int]] = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            continue
        x, y, w, h = cv2.boundingRect(contour)
        if w < min_width or h < min_height:
            continue
        boxes.append((x, y, w, h))
    boxes.sort(key=lambda box: (box[1], box[0]))
    return boxes


def feather_alpha(mask: np.ndarray, feather: float) -> np.ndarray:
    if feather <= 0:
        return mask
    sigma = max(0.01, float(feather))
    kernel = max(3, int(round(sigma * 6)) | 1)
    blurred = cv2.GaussianBlur(mask.astype(np.float32), (kernel, kernel), sigmaX=sigma, sigmaY=sigma)
    return np.clip(blurred, 0, 255).astype(np.uint8)


def suppress_bright_desaturated_halo(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    saturation = hsv[:, :, 1].astype(np.float32)
    value = hsv[:, :, 2].astype(np.float32)
    channel_min = np.min(rgb, axis=2).astype(np.float32)
    channel_spread = (np.max(rgb, axis=2) - np.min(rgb, axis=2)).astype(np.float32)

    # Only target near-paper halos:
    # - semi-transparent fringe, not solid painted petals
    # - very bright across all channels
    # - low chroma / low spread, close to white paper contamination
    edge_band = (alpha > 0) & (alpha < 190)
    bright_desaturated = (value > 235) & (saturation < 34) & (channel_min > 210) & (channel_spread < 28)
    target = edge_band & bright_desaturated
    if not np.any(target):
        return alpha

    alpha_out = alpha.astype(np.float32).copy()
    penalty = np.clip((value[target] - 235.0) / 20.0, 0.0, 1.0)
    penalty *= np.clip((34.0 - saturation[target]) / 34.0, 0.0, 1.0)
    penalty *= np.clip((28.0 - channel_spread[target]) / 28.0, 0.0, 1.0)
    alpha_out[target] *= (1.0 - 0.42 * penalty)
    return np.clip(alpha_out, 0, 255).astype(np.uint8)


def decontaminate_white(rgb: np.ndarray, alpha: np.ndarray, near_white_threshold: int) -> np.ndarray:
    cleaned = rgb.astype(np.float32).copy()
    alpha_f = alpha.astype(np.float32) / 255.0
    edge_mask = (alpha > 0) & (alpha < 255)
    bright_mask = np.mean(cleaned, axis=2) >= float(near_white_threshold - 12)
    target = edge_mask & bright_mask
    if not np.any(target):
        return rgb

    a = np.clip(alpha_f[target], 1e-3, 1.0)[:, None]
    unblended = (cleaned[target] - (1.0 - a) * 255.0) / a
    cleaned[target] = np.clip(unblended, 0, 255)
    return cleaned.astype(np.uint8)


def cleanup_edges(crop_rgba: np.ndarray, crop_mask: np.ndarray, options: ExtractionOptions) -> np.ndarray:
    if not options.edge_cleanup:
        crop_rgba[:, :, 3] = np.where(crop_mask > 0, crop_rgba[:, :, 3], 0)
        crop_rgba[crop_mask == 0, :3] = 0
        return crop_rgba

    working_mask = crop_mask.copy()
    if options.erode > 0:
        radius = max(1, int(options.erode))
        kernel_size = radius * 2 + 1
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
        working_mask = cv2.erode(working_mask, kernel, iterations=1)

    alpha = feather_alpha(working_mask, options.feather)
    alpha = np.where(crop_mask > 0, alpha, 0).astype(np.uint8)
    alpha = suppress_bright_desaturated_halo(crop_rgba[:, :, :3], alpha)

    rgb = crop_rgba[:, :, :3]
    rgb = decontaminate_white(rgb, alpha, options.white_threshold)
    rgb[alpha == 0] = 0

    cleaned = crop_rgba.copy()
    cleaned[:, :, :3] = rgb
    cleaned[:, :, 3] = alpha
    return cleaned


def crop_with_transparency(
    rgba: np.ndarray,
    mask: np.ndarray,
    box: tuple[int, int, int, int],
    options: ExtractionOptions,
) -> np.ndarray:
    x, y, w, h = box
    height, width = mask.shape
    left = max(0, x - options.padding)
    top = max(0, y - options.padding)
    right = min(width, x + w + options.padding)
    bottom = min(height, y + h + options.padding)

    crop_rgba = rgba[top:bottom, left:right].copy()
    crop_mask = mask[top:bottom, left:right]
    return cleanup_edges(crop_rgba, crop_mask, options)


def save_png(path: Path, rgba: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA))


def save_preview(path: Path, rgba: np.ndarray, boxes: list[tuple[int, int, int, int]]) -> None:
    preview = cv2.cvtColor(rgba[:, :, :3], cv2.COLOR_RGB2BGR)
    for index, (x, y, w, h) in enumerate(boxes, start=1):
        cv2.rectangle(preview, (x, y), (x + w, y + h), (55, 140, 255), 2)
        cv2.putText(preview, str(index), (x, max(18, y - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (40, 90, 220), 2)
    cv2.imwrite(str(path), preview)


def extract_assets(
    input_path: Path,
    options: ExtractionOptions,
    output_dir: Path | None = None,
) -> tuple[list[Path], list[tuple[int, int, int, int]], Path, Path | None]:
    input_path = input_path.expanduser().resolve()
    target_dir = output_dir_for(input_path, output_dir)

    rgba, alpha = load_image_rgba(input_path)
    mask = build_foreground_mask(rgba, alpha, options.white_threshold, options.close_kernel)
    boxes = contour_boxes(mask, options.min_area, options.min_width, options.min_height)

    if not boxes:
        raise ValueError("No valid non-white contours found. Try lowering --min-area or raising --white-threshold.")

    target_dir.mkdir(parents=True, exist_ok=True)
    exported_paths: list[Path] = []

    for index, box in enumerate(boxes, start=1):
        crop = crop_with_transparency(rgba, mask, box, options)
        output_path = target_dir / f"asset_{index:03d}.png"
        save_png(output_path, crop)
        exported_paths.append(output_path)

    preview_path: Path | None = None
    if options.save_preview:
        preview_path = target_dir / "_preview-boxes.png"
        save_preview(preview_path, rgba, boxes)

    return exported_paths, boxes, target_dir, preview_path


def main() -> int:
    args = parse_args()
    options = ExtractionOptions(
        white_threshold=args.white_threshold,
        min_area=args.min_area,
        min_width=args.min_width,
        min_height=args.min_height,
        padding=args.padding,
        close_kernel=args.close_kernel,
        edge_cleanup=args.edge_cleanup,
        erode=args.erode,
        feather=args.feather,
        save_preview=args.save_preview,
    )
    exported_paths, boxes, output_dir, preview_path = extract_assets(args.input, options, args.output_dir)

    for index, (output_path, box) in enumerate(zip(exported_paths, boxes), start=1):
        x, y, w, h = box
        print(f"[{index:03d}] {output_path.name}  box=({x},{y},{w},{h})")

    if preview_path is not None:
        print(f"[preview] {preview_path}")

    print(f"[done] exported {len(exported_paths)} elements -> {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
