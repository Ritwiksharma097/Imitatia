"""
Optimize copied images:
  - Resize so longest edge <= 1600px
  - Re-encode JPEG/PNG -> WebP at q=82 (keeps quality, much smaller)
  - Keep PNGs that are clearly graphics/transparent as PNG (small ones)
  - Update url_map so content URLs point at the new files

Updates content.json in place, rewriting any /images/.../foo.{jpg,png,webp} URLs.
"""
import os, json, re, io
from PIL import Image

IMG_DIR = '/home/claude/work/site_data/public/images'
CONTENT_JSON = '/home/claude/work/site_data/content.json'
MAX_DIM = 1600
WEBP_QUALITY = 82

# Collect image paths
mapping = {}   # original web URL -> new web URL (where extensions/paths may differ)

def webify(path):
    """Convert a /home/claude/.../public/images/X file path to a web URL '/images/X'."""
    return path.replace('/home/claude/work/site_data/public', '')

for root, _, files in os.walk(IMG_DIR):
    for fname in files:
        fpath = os.path.join(root, fname)
        try:
            with Image.open(fpath) as img:
                orig_format = img.format  # PNG, JPEG, WEBP, GIF
                w, h = img.size
        except Exception as e:
            print(f"SKIP (cannot open): {fpath}: {e}")
            continue

        # Decide target format. For animated GIF/SVG we skip optimization.
        ext = os.path.splitext(fname)[1].lower()
        if ext == '.gif' or ext == '.svg':
            continue
        # For PNG, keep PNG only if it has transparency AND is small. Else WebP.
        # For JPEG, always WebP.
        # For WEBP, just resize if needed.
        try:
            img = Image.open(fpath)
            # Convert mode for safety
            has_alpha = ('A' in img.getbands())

            # Resize if needed
            longest = max(img.size)
            if longest > MAX_DIM:
                ratio = MAX_DIM / longest
                new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
                img = img.resize(new_size, Image.LANCZOS)

            # Determine output format
            if ext == '.webp':
                out_path = fpath  # rewrite in place
                out_url_ext = '.webp'
                save_kwargs = {'format': 'WEBP', 'quality': WEBP_QUALITY, 'method': 6}
                if has_alpha:
                    pass  # webp supports alpha
                img.save(out_path, **save_kwargs)
            else:
                # Convert to webp
                base, _ = os.path.splitext(fpath)
                new_path = base + '.webp'
                if has_alpha:
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
                img.save(new_path, format='WEBP', quality=WEBP_QUALITY, method=6)
                # Remove original if different file
                if new_path != fpath:
                    os.remove(fpath)
                # Record mapping
                old_url = webify(fpath)
                new_url = webify(new_path)
                if old_url != new_url:
                    mapping[old_url] = new_url
        except Exception as e:
            print(f"FAIL: {fpath}: {e}")

# Now rewrite content.json
with open(CONTENT_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

def remap_url(u):
    if not u: return u
    return mapping.get(u, u)

def remap_in_html(html):
    if not html: return html
    for old, new in mapping.items():
        if old in html:
            html = html.replace(old, new)
    return html

for collection in ('posts', 'pages'):
    for item in data[collection]:
        item['featuredImage'] = remap_url(item.get('featuredImage'))
        item['content'] = remap_in_html(item.get('content'))

with open(CONTENT_JSON, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Report
total = 0
count = 0
for root, _, files in os.walk(IMG_DIR):
    for f in files:
        total += os.path.getsize(os.path.join(root, f))
        count += 1
print(f"Final: {count} images, {total/1024/1024:.1f} MB")
print(f"URL remaps: {len(mapping)}")
