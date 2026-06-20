from __future__ import annotations

from dataclasses import dataclass
import io
from pathlib import Path
from typing import Iterable

from PIL import Image
from rembg import new_session, remove


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
TARGET_CANVAS_SIZE = 512


@dataclass(frozen=True)
class ProcessPaths:
    base_dir: Path
    input_dir: Path
    output_dir: Path


def get_paths() -> ProcessPaths:
    base_dir = Path(__file__).resolve().parent
    input_dir = base_dir / "input"
    output_dir = base_dir / "output"
    input_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    return ProcessPaths(base_dir=base_dir, input_dir=input_dir, output_dir=output_dir)


def iter_source_images(input_dir: Path) -> Iterable[Path]:
    for path in sorted(input_dir.iterdir()):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def trim_transparent_edges(image: Image.Image) -> Image.Image:
    bbox = image.getbbox()
    if bbox is None:
        return image
    return image.crop(bbox)


def normalize_to_canvas(image: Image.Image, canvas_size: int) -> Image.Image:
    trimmed = trim_transparent_edges(image)
    if trimmed.width == 0 or trimmed.height == 0:
        return Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))

    scale = min(canvas_size / trimmed.width, canvas_size / trimmed.height)
    resized_width = max(1, round(trimmed.width * scale))
    resized_height = max(1, round(trimmed.height * scale))
    resized = trimmed.resize((resized_width, resized_height), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_x = (canvas_size - resized_width) // 2
    offset_y = (canvas_size - resized_height) // 2
    canvas.paste(resized, (offset_x, offset_y), resized)
    return canvas


def remove_background(image: Image.Image, session) -> Image.Image:
    cutout = remove(image, session=session)
    if isinstance(cutout, bytes):
        return Image.open(io.BytesIO(cutout)).convert("RGBA")
    return cutout.convert("RGBA")


def process_image(source_path: Path, output_dir: Path, session) -> Path:
    source_image = Image.open(source_path).convert("RGBA")
    cutout = remove_background(source_image, session)
    normalized = normalize_to_canvas(cutout, TARGET_CANVAS_SIZE)
    output_path = output_dir / f"{source_path.stem}.png"
    normalized.save(output_path)
    return output_path


def main() -> None:
    paths = get_paths()
    source_images = list(iter_source_images(paths.input_dir))

    if not source_images:
        print(f"No images found in {paths.input_dir}")
        return

    session = new_session("u2net")
    print(f"Processing {len(source_images)} image(s)...")
    for source_path in source_images:
        output_path = process_image(source_path, paths.output_dir, session)
        print(f"Saved {output_path.name}")


if __name__ == "__main__":
    main()
