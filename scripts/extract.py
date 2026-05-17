"""
Comprehensive WordPress -> JSON extractor for imitatia.com.

Pulls:
  - All published posts and pages
  - Categories per post (via term_relationships + term_taxonomy + terms)
  - Featured image (postmeta._thumbnail_id -> attachment guid)
  - AIOSEO SEO title/description (from wpgi_aioseo_posts table)
  - Author name (from wpgi_users)
  - Inline images referenced in content

Writes:
  /home/claude/work/extracted.json
"""
import re, json, os, sys
sys.path.insert(0, '/home/claude/work')
from parse_sql import find_insert_blocks, parse_values, POSTS_COLS

SQL_FILE = '/mnt/user-data/uploads/inteqyyc_wp79_1_.sql'
OUT_FILE = '/home/claude/work/extracted.json'

TERMS_COLS    = ['term_id','name','slug','term_group']
TT_COLS       = ['term_taxonomy_id','term_id','taxonomy','description','parent','count']
TR_COLS       = ['object_id','term_taxonomy_id','term_order']
POSTMETA_COLS = ['meta_id','post_id','meta_key','meta_value']
USERS_COLS    = ['ID','user_login','user_pass','user_nicename','user_email','user_url',
                 'user_registered','user_activation_key','user_status','display_name']

print("Reading SQL...", file=sys.stderr)
with open(SQL_FILE, 'r', encoding='utf-8', errors='replace') as f:
    sql = f.read()

# --- terms / taxonomies ---
print("Parsing terms...", file=sys.stderr)
terms = {}
for body in find_insert_blocks(sql, 'wpgi_terms'):
    vals = parse_values(body)
    if len(vals) != 4: continue
    r = dict(zip(TERMS_COLS, vals))
    terms[r['term_id']] = r

tts = {}
for body in find_insert_blocks(sql, 'wpgi_term_taxonomy'):
    vals = parse_values(body)
    if len(vals) != 6: continue
    r = dict(zip(TT_COLS, vals))
    t = terms.get(r['term_id'])
    if t:
        tts[r['term_taxonomy_id']] = {
            'taxonomy': r['taxonomy'],
            'name':     t['name'],
            'slug':     t['slug'],
        }

# object_id -> list of category dicts
print("Parsing term relationships...", file=sys.stderr)
obj_terms = {}
for body in find_insert_blocks(sql, 'wpgi_term_relationships'):
    vals = parse_values(body)
    if len(vals) < 2: continue
    oid, ttid = vals[0], vals[1]
    t = tts.get(ttid)
    if t:
        obj_terms.setdefault(oid, []).append(t)

# --- postmeta: featured images, also AIOSEO sometimes here ---
print("Parsing postmeta...", file=sys.stderr)
thumb_for = {}     # post_id -> attachment_id
post_meta = {}     # post_id -> {meta_key: meta_value}
for body in find_insert_blocks(sql, 'wpgi_postmeta'):
    vals = parse_values(body)
    if len(vals) != 4: continue
    r = dict(zip(POSTMETA_COLS, vals))
    pid = r['post_id']
    key = r['meta_key']
    if key == '_thumbnail_id':
        thumb_for[pid] = r['meta_value']
    # keep useful subset
    if key in ('_aioseop_title','_aioseop_description','_yoast_wpseo_title','_yoast_wpseo_metadesc'):
        post_meta.setdefault(pid, {})[key] = r['meta_value']

# --- users ---
print("Parsing users...", file=sys.stderr)
users = {}
for body in find_insert_blocks(sql, 'wpgi_users'):
    vals = parse_values(body)
    if len(vals) != len(USERS_COLS): continue
    r = dict(zip(USERS_COLS, vals))
    users[r['ID']] = r['display_name'] or r['user_login']

# --- AIOSEO ---
# Schema can vary. Find CREATE TABLE for wpgi_aioseo_posts and get columns.
print("Parsing AIOSEO...", file=sys.stderr)
aioseo_cols = None
m = re.search(r"CREATE TABLE `wpgi_aioseo_posts` \((.*?)\) ENGINE", sql, re.DOTALL)
if m:
    col_defs = re.findall(r"`(\w+)`\s+\w+", m.group(1))
    aioseo_cols = col_defs

aioseo = {}  # post_id -> {title, description, og_title, og_description, ...}
# AIOSEO stores template placeholders like "#post_title #separator_sa #site_title".
# Those are useless to a static site — strip them so the page falls back to real values.
TEMPLATE_RE = re.compile(r'#[a-z_]+', re.IGNORECASE)
def is_template(s):
    return bool(s) and bool(TEMPLATE_RE.search(s)) and '#' in s and len(s) < 150

if aioseo_cols:
    for body in find_insert_blocks(sql, 'wpgi_aioseo_posts'):
        vals = parse_values(body)
        if len(vals) != len(aioseo_cols): continue
        r = dict(zip(aioseo_cols, vals))
        pid = r.get('post_id')
        if pid:
            entry = {}
            for k in ['title','description','og_title','og_description','keyphrases','keywords','schema']:
                v = r.get(k)
                if v and not is_template(v):
                    entry[k] = v
            if entry:
                aioseo[pid] = entry

# --- posts ---
print("Parsing posts...", file=sys.stderr)
all_posts = {}
for body in find_insert_blocks(sql, 'wpgi_posts'):
    vals = parse_values(body)
    if len(vals) != len(POSTS_COLS): continue
    r = dict(zip(POSTS_COLS, vals))
    all_posts[r['ID']] = r

# Build attachment guid map
attach = {}
for pid, p in all_posts.items():
    if p['post_type'] == 'attachment':
        # Sometimes guid is the URL — pull canonical from _wp_attached_file too if present
        attach[pid] = p['guid']

# --- Decode HTML entities in titles for cleanliness ---
import html
def clean_text(s):
    if s is None: return ''
    return html.unescape(s)

# --- Extract referenced images from content ---
IMG_RE = re.compile(r'https?://[^\s"\'<>\)]+\.(?:jpg|jpeg|png|webp|gif|svg|avif)', re.IGNORECASE)

def find_images(html_str):
    return list({m.group(0) for m in IMG_RE.finditer(html_str or '')})

# --- Pull only published posts and pages ---
print("Building output...", file=sys.stderr)
out_posts = []
out_pages = []
for pid, p in all_posts.items():
    if p['post_status'] != 'publish':
        continue
    if p['post_type'] not in ('post', 'page'):
        continue

    cats = []
    for t in obj_terms.get(pid, []):
        if t['taxonomy'] in ('category', 'post_tag'):
            cats.append({'taxonomy': t['taxonomy'], 'slug': t['slug'], 'name': t['name']})

    feat_id = thumb_for.get(pid)
    feat_url = attach.get(feat_id) if feat_id else None

    seo = aioseo.get(pid, {})

    item = {
        'id': pid,
        'type': p['post_type'],
        'slug': p['post_name'],
        'title': clean_text(p['post_title']),
        'excerpt': clean_text(p['post_excerpt']),
        'content_html': p['post_content'],
        'date': p['post_date'],
        'modified': p['post_modified'],
        'author': users.get(p['post_author'], 'Nin Nin'),
        'categories': cats,
        'featured_image': feat_url,
        'inline_images': find_images(p['post_content']),
        'seo': seo,
    }
    if p['post_type'] == 'post':
        out_posts.append(item)
    else:
        out_pages.append(item)

# Sort
out_posts.sort(key=lambda x: x['date'])
out_pages.sort(key=lambda x: x['slug'])

print(f"\nPosts: {len(out_posts)}, Pages: {len(out_pages)}", file=sys.stderr)

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({'posts': out_posts, 'pages': out_pages}, f, indent=2, ensure_ascii=False)

print(f"Written: {OUT_FILE}", file=sys.stderr)
print(f"Size: {os.path.getsize(OUT_FILE)/1024:.0f} KB", file=sys.stderr)
