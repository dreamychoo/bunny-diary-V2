# Bunny Asset Processing

This tool reads every `PNG`, `JPG`, and `JPEG` image from `./input`, removes the background with `rembg`, trims transparent empty edges, and exports centered transparent `512x512` PNG files to `./output`.

## Structure

```text
tools/bunny_asset_processing/
├── input/
├── output/
├── process_bunny_assets.py
├── requirements.txt
└── README.md
```

## Setup

```bash
cd tools/bunny_asset_processing
python3 -m pip install -r requirements.txt
```

## Usage

1. Put source `PNG`, `JPG`, or `JPEG` files into `./input`
2. Run:

```bash
python3 process_bunny_assets.py
```

3. Processed files will appear in `./output`

The first run will download the `u2net` model used by `rembg`, so it may take longer than later runs.

## Output Rules

- Background removed with `rembg`
- Transparent edges trimmed
- Final canvas normalized to `512x512`
- Character centered on the canvas
- Output always saved as transparent PNG
- Original filenames kept, with `.png` extension
