"""
Step 2: build clean content + image bundle.

Reads extracted.json, then:
  1. Cleans WordPress block comments
  2. Strips MetaSlider shortcodes and other unsupported shortcodes
  3. Rewrites image URLs from http(s)://imitatia.com/wp-content/uploads/... -> /images/...
  4. Strips WP "-1024x683" size suffixes so we serve originals
  5. Converts [chapter_nav category="..."] into a marker the renderer can detect
  6. Converts [readnow_live ...] into a marker
  7. Converts YouTube embeds into clean iframes
  8. Copies the actually-referenced images (originals only) into ./public/images/...
  9. Renames files with · -> dot or similar URL-safe form, mapping URLs

Outputs:
  - /home/claude/work/site_data/content.json
  - /home/claude/work/site_data/public/images/...
"""
import json, re, os, shutil, urllib.parse, sys, html

SRC_JSON = '/home/claude/work/extracted.json'
WP_UPLOADS = '/home/claude/work/wp_dump/imitatia.com/wp-content/uploads/'
OUT_DIR = '/home/claude/work/site_data'
PUB_IMG_DIR = os.path.join(OUT_DIR, 'public', 'images')
OUT_JSON = os.path.join(OUT_DIR, 'content.json')

os.makedirs(PUB_IMG_DIR, exist_ok=True)

with open(SRC_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

# -----------------------------------------------------------------------------
# URL/path utilities
# -----------------------------------------------------------------------------
SIZE_SUFFIX_RE = re.compile(r'-\d+x\d+(?=\.[a-zA-Z]+$)')

def url_to_uploads_rel(url):
    """Get the path after /wp-content/uploads/ from an imitatia URL. URL-decoded."""
    m = re.search(r'/wp-content/uploads/(.+)$', url)
    if not m: return None
    rel = urllib.parse.unquote(m.group(1))
    return rel

def safe_filename(rel):
    """Make a filesystem-safe (and URL-safe) destination filename."""
    rel = rel.replace('·', '.')
    # Replace anything outside [\w./-] with '_'
    rel = re.sub(r'[^A-Za-z0-9._/-]', '_', rel)
    return rel

def find_local_src(rel):
    """Given a uploads-relative path (e.g. '2025/07/foo-1024x768.jpg'), find a local
       file. Try original (no size suffix) first, then the original given path."""
    candidates = []
    orig = SIZE_SUFFIX_RE.sub('', rel)
    candidates.append(orig)
    if rel != orig:
        candidates.append(rel)
    for c in candidates:
        # Also try replacing · with #U00b7 (the unzip mangled form)
        variants = [c]
        if '·' in c:
            variants.append(c.replace('·', '#U00b7'))
        for v in variants:
            path = WP_UPLOADS + v
            if os.path.exists(path):
                return path, orig
    return None, orig

# -----------------------------------------------------------------------------
# Image copy + URL rewriting
# -----------------------------------------------------------------------------
url_map = {}  # full original URL -> /images/... new URL

def register_image(url):
    """Copy the underlying file to ./public/images/<safe_path> and return the new web URL."""
    if url in url_map:
        return url_map[url]
    rel = url_to_uploads_rel(url)
    if rel is None:
        return url  # external image, leave alone (none exist now, but safe)
    src_path, orig_rel = find_local_src(rel)
    if src_path is None:
        sys.stderr.write(f"WARN: missing local file for {url}\n")
        return url
    dest_rel = safe_filename(orig_rel)
    dest_path = os.path.join(PUB_IMG_DIR, dest_rel)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if not os.path.exists(dest_path):
        shutil.copy2(src_path, dest_path)
    new_url = '/images/' + dest_rel
    url_map[url] = new_url
    return new_url

# -----------------------------------------------------------------------------
# HTML cleaner
# -----------------------------------------------------------------------------
WP_COMMENT_RE = re.compile(r'<!--\s*/?wp:[^>]*-->')
METASLIDER_RE = re.compile(r'<div[^>]*class="alignnormal"[^>]*>\s*\[metaslider[^\]]*\]\s*</div>', re.IGNORECASE)
EMPTY_METASLIDER_BLOCK_RE = re.compile(r'<!-- wp:metaslider/slider[^>]*-->.*?<!-- /wp:metaslider/slider -->', re.DOTALL)
IMG_SRC_RE = re.compile(r'(<img[^>]*\bsrc=")([^"]+)(")', re.IGNORECASE)
A_HREF_IMG_RE = re.compile(r'(<a[^>]*\bhref=")(https?://imitatia\.com/wp-content/uploads/[^"]+)(")', re.IGNORECASE)
A_HREF_SITE_RE = re.compile(r'(<a[^>]*\bhref=")(https?://imitatia\.com/?)([^"]*)(")', re.IGNORECASE)
YT_BLOCK_RE = re.compile(
    r'<figure class="wp-block-embed[^"]*is-provider-youtube[^"]*"[^>]*>'
    r'<div class="wp-block-embed__wrapper">\s*'
    r'(https?://(?:www\.)?youtube\.com/watch\?v=([\w-]+)|https?://youtu\.be/([\w-]+))'
    r'\s*</div>\s*</figure>',
    re.DOTALL,
)

def yt_replace(m):
    vid = m.group(2) or m.group(3)
    return (
        f'<div class="aspect-video my-6 rounded-xl overflow-hidden">'
        f'<iframe src="https://www.youtube.com/embed/{vid}" '
        f'title="YouTube video" frameborder="0" '
        f'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
        f'allowfullscreen class="w-full h-full"></iframe>'
        f'</div>'
    )

CHAPTER_NAV_RE = re.compile(r'\[chapter_nav\s+category="([^"]+)"\]')
READNOW_RE = re.compile(r'\[readnow_live[^\]]*category="([^"]+)"[^\]]*\]')

def clean_html(content, site_links_external=True):
    """Clean WP HTML for static rendering."""
    if not content:
        return ''

    # 1. Convert YouTube embed blocks before stripping comments
    content = YT_BLOCK_RE.sub(yt_replace, content)

    # 2. Drop MetaSlider blocks entirely (we replace these with curated UI)
    content = EMPTY_METASLIDER_BLOCK_RE.sub('', content)
    content = METASLIDER_RE.sub('', content)

    # 3. Strip Gutenberg block comments
    content = WP_COMMENT_RE.sub('', content)

    # 4. Rewrite all imitatia.com image URLs in <img src=...>
    def fix_img_src(m):
        prefix, url, suffix = m.group(1), m.group(2), m.group(3)
        if 'imitatia.com' in url and '/wp-content/uploads/' in url:
            return prefix + register_image(url) + suffix
        return m.group(0)
    content = IMG_SRC_RE.sub(fix_img_src, content)

    # 5. Rewrite <a href> linking to image uploads
    def fix_a_img(m):
        return m.group(1) + register_image(m.group(2)) + m.group(3)
    content = A_HREF_IMG_RE.sub(fix_a_img, content)

    # 6. Convert internal imitatia.com links to relative
    def fix_internal_link(m):
        prefix, host, rest, quote = m.group(1), m.group(2), m.group(3), m.group(4)
        # If host has trailing slash already, rest starts immediately
        path = rest if rest.startswith('/') else '/' + rest if rest else '/'
        return prefix + path + quote
    content = A_HREF_SITE_RE.sub(fix_internal_link, content)

    # 7. Replace chapter_nav / readnow_live with placeholder markers that the renderer recognizes
    content = CHAPTER_NAV_RE.sub(
        lambda m: f'<!--CHAPTER_NAV:{m.group(1)}-->',
        content,
    )
    content = READNOW_RE.sub(
        lambda m: f'<!--READ_NOW:{m.group(1)}-->',
        content,
    )

    # 8. Strip ShortPixel "Adaptive Images" markup if present — not seen but safe
    # 9. Collapse 3+ blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)

    # 10. Drop a leading featured image figure if it matches the post's featured image
    # (handled at render-time instead so we keep raw HTML truthful)

    return content.strip()

# -----------------------------------------------------------------------------
# Build output records
# -----------------------------------------------------------------------------
def build_record(item):
    feat = register_image(item['featured_image']) if item.get('featured_image') else None
    cleaned = clean_html(item['content_html'])
    # Plain-text excerpt for cards / meta description
    excerpt = item.get('excerpt') or ''
    if not excerpt:
        txt = re.sub(r'<[^>]+>', ' ', cleaned)
        txt = re.sub(r'&nbsp;', ' ', txt)
        txt = html.unescape(txt)
        txt = re.sub(r'\s+', ' ', txt).strip()
        excerpt = txt[:300]
    # SEO fields fallback
    seo = item.get('seo') or {}
    return {
        'id': item['id'],
        'type': item['type'],
        'slug': item['slug'],
        'title': item['title'],
        'excerpt': excerpt,
        'content': cleaned,
        'date': item['date'],
        'modified': item['modified'],
        'author': item.get('author') or 'Nin Nin',
        'categories': item.get('categories') or [],
        'featuredImage': feat,
        'seo': {
            'title': seo.get('title') or '',
            'description': seo.get('description') or '',
        },
    }

posts = [build_record(p) for p in data['posts']]
pages = [build_record(p) for p in data['pages']]

# Sort posts newest first for the JSON
posts.sort(key=lambda x: x['date'], reverse=True)

output = {
    'posts': posts,
    'pages': pages,
    'categories': [
        {'slug': 'imitatia-dreams',          'name': 'Imitatia Dreams'},
        {'slug': 'imitatia-reviews',         'name': 'Reviews'},
        {'slug': 'poems',                    'name': 'Poems'},
        {'slug': 'web-novel',                'name': 'Web Novels'},
        {'slug': 'novels',                   'name': 'Novels'},
        {'slug': 'published-novels',         'name': 'Published Novels'},
        {'slug': 'utcb',                     'name': 'Under The Cherry Blossoms'},
        {'slug': 'audrey',                   'name': 'Audrey'},
        {'slug': 'coincidence-or-jeanie',    'name': 'Coincidence or Jeanie?'},
        {'slug': 'updates',                  'name': 'Updates'},
        {'slug': 'infection',                'name': 'Infection'},
    ],
}

with open(OUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Wrote {OUT_JSON}: {os.path.getsize(OUT_JSON)/1024:.0f} KB")
print(f"Posts: {len(posts)} | Pages: {len(pages)}")
print(f"Images copied: {len(url_map)}")

# Total image size
total = 0
for root, _, files in os.walk(PUB_IMG_DIR):
    for f in files:
        total += os.path.getsize(os.path.join(root, f))
print(f"Images dir size: {total/1024/1024:.1f} MB")
