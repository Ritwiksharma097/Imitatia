#!/usr/bin/env python3
"""
optimize-image.py — drop a new image, get a web-ready WebP saved in the right place.

Usage:
    python scripts/optimize-image.py <path-to-image>
    python scripts/optimize-image.py ~/Desktop/cover.jpg

What it does:
  - Resizes the longest edge to 1600px max (preserves aspect ratio)
  - Converts to WebP at quality 82 (best size/quality tradeoff)
  - Saves to public/images/YYYY/MM/ using a slugified filename
  - Prints the URL path you can use in content.json

Requires: pillow (pip install Pillow)
"""
import sys
import os
import re
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = PROJECT_ROOT / "public" / "images"
MAX_DIM = 1600
WEBP_QUALITY = 82

def slugify_filename(name):
    stem, _ = os.path.splitext(name)
    s = stem.lower().strip()
    s = re.sub(r"[^a-z0-9\s\-_.]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    src = Path(sys.argv[1]).expanduser().resolve()
    if not src.exists():
        print(f"ERROR: {src} not found")
        sys.exit(1)

    try:
        img = Image.open(src)
    except Exception as e:
        print(f"ERROR: can't open as image: {e}")
        sys.exit(1)

    print(f"Source: {src.name}  {img.size}  mode={img.mode}")

    # Resize if needed
    longest = max(img.size)
    if longest > MAX_DIM:
        ratio = MAX_DIM / longest
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.LANCZOS)
        print(f"Resized to: {img.size}")

    # Mode conversion
    has_alpha = "A" in img.getbands()
    if has_alpha:
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    # Determine destination path
    now = datetime.now()
    dest_dir = IMAGES_DIR / f"{now.year:04d}" / f"{now.month:02d}"
    dest_dir.mkdir(parents=True, exist_ok=True)

    stem = slugify_filename(src.name)
    dest = dest_dir / f"{stem}.webp"

    # Avoid clobber
    if dest.exists():
        i = 2
        while (dest_dir / f"{stem}-{i}.webp").exists():
            i += 1
        dest = dest_dir / f"{stem}-{i}.webp"

    img.save(dest, format="WEBP", quality=WEBP_QUALITY, method=6)

    size_kb = dest.stat().st_size / 1024
    web_path = "/" + str(dest.relative_to(PROJECT_ROOT / "public")).replace(os.sep, "/")

    print()
    print("═══════════════════════════════════════════════════════")
    print(f"  ✓ Saved: {dest.relative_to(PROJECT_ROOT)}  ({size_kb:.0f} KB)")
    print(f"  Web URL:  {web_path}")
    print("═══════════════════════════════════════════════════════")
    print()
    print("Paste this into content.json as the featuredImage:")
    print(f'  "featuredImage": "{web_path}",')

if __name__ == "__main__":
    main()
