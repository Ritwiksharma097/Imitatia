#!/usr/bin/env python3
"""
new-post.py — guided prompt to add a new post or page to data/content.json.

Usage:
    python scripts/new-post.py

The script will ask you for the post details one by one, build a JSON entry,
slot it into the right place in content.json, and print the new slug so you
know what URL it'll have.

This script is conservative: it won't overwrite an existing post with the
same slug. If you need to edit a post, edit content.json directly.
"""
import json
import os
import sys
import re
from datetime import datetime
from pathlib import Path

CONTENT_PATH = Path(__file__).resolve().parent.parent / "data" / "content.json"

CATEGORIES = [
    ("imitatia-dreams",   "Imitatia Dreams"),
    ("imitatia-reviews",  "Reviews"),
    ("poems",             "Poems"),
    ("audrey",            "Audrey (chapter)"),
    ("utcb",              "Under The Cherry Blossoms (chapter)"),
    ("coincidence-or-jeanie", "Coincidence or Jeanie? (chapter)"),
    ("infection",         "The Infection (chapter)"),
    ("updates",           "Updates / Dev blog"),
]

def ask(prompt, default=None, required=True, multiline=False):
    suffix = f" [{default}]" if default else ""
    while True:
        if multiline:
            print(f"{prompt}{suffix}")
            print("(end with a single '.' on its own line)")
            lines = []
            while True:
                line = input()
                if line.strip() == ".":
                    break
                lines.append(line)
            val = "\n".join(lines).strip()
        else:
            val = input(f"{prompt}{suffix}: ").strip()
        if not val and default is not None:
            return default
        if val or not required:
            return val
        print("  (required)")

def slugify(s):
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")

def main():
    if not CONTENT_PATH.exists():
        print(f"ERROR: {CONTENT_PATH} not found. Run from project root.", file=sys.stderr)
        sys.exit(1)

    data = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))

    print()
    print("═══════════════════════════════════════════════════════")
    print("  New post helper")
    print("═══════════════════════════════════════════════════════")
    print()

    title = ask("Title")
    slug_default = slugify(title)
    slug = ask("URL slug", default=slug_default)

    # Check uniqueness
    all_slugs = {p["slug"] for p in data["posts"]} | {p["slug"] for p in data["pages"]}
    if slug in all_slugs:
        print(f"\n  ✗ A post or page with slug '{slug}' already exists.")
        print(f"    Edit data/content.json directly to modify it, or pick a different slug.")
        sys.exit(1)

    print()
    print("Categories — type the slug(s), comma-separated:")
    for s, name in CATEGORIES:
        print(f"  - {s:30s}  {name}")
    cats_raw = ask("Categories", default="imitatia-dreams")
    cat_slugs = [c.strip() for c in cats_raw.split(",") if c.strip()]
    cat_lookup = dict(CATEGORIES)
    categories = []
    for cs in cat_slugs:
        if cs in cat_lookup:
            categories.append({"taxonomy": "category", "slug": cs, "name": cat_lookup[cs]})
        else:
            print(f"  WARN: unknown category '{cs}', adding anyway with title-cased name")
            categories.append({"taxonomy": "category", "slug": cs, "name": cs.replace("-", " ").title()})

    print()
    date_default = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    date = ask("Date (YYYY-MM-DD HH:MM:SS)", default=date_default)

    print()
    print("Featured image path — should already exist under public/images/YYYY/MM/")
    print("(if not, run scripts/optimize-image.py first)")
    featured = ask("Featured image", default="", required=False)
    if featured and not featured.startswith("/"):
        featured = "/" + featured
    if featured and not featured.startswith("/images/"):
        print(f"  WARN: featured image should start with /images/  ('{featured}')")

    print()
    excerpt = ask("Excerpt (1-2 sentences, shown in cards and meta description)",
                  multiline=False)

    print()
    print("Body HTML — paste it then end with a single '.' on its own line.")
    print("Hint: <p>paragraphs</p>, <h2>headings</h2>, <blockquote>, <em>, <strong>")
    content = ask("Body", multiline=True)

    # Generate a new ID (find max existing)
    all_ids = [int(p["id"]) for p in data["posts"] + data["pages"] if p["id"].isdigit()]
    new_id = str(max(all_ids) + 1) if all_ids else "1000"

    entry = {
        "id": new_id,
        "type": "post",
        "slug": slug,
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "date": date,
        "modified": date,
        "author": "Nin Nin",
        "categories": categories,
        "featuredImage": featured if featured else None,
        "seo": {"title": "", "description": ""},
    }

    # Insert at the front of posts (newest first)
    data["posts"].insert(0, entry)

    CONTENT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    print()
    print("═══════════════════════════════════════════════════════")
    print(f"  ✓ Post added!")
    print(f"  Slug:       {slug}")
    print(f"  Will live at: imitatia.com/{slug}/")
    print(f"  Categories: {', '.join(c['slug'] for c in categories)}")
    print("═══════════════════════════════════════════════════════")
    print()
    print("Next steps:")
    print("  1. Run 'npm run build' locally to test, OR just push:")
    print("       git add data/content.json public/images/")
    print(f"       git commit -m \"Add post: {title}\"")
    print("       git push")
    print("  2. Cloudflare rebuilds in ~2 min. Done.")
    print()

if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nCancelled.")
        sys.exit(130)
