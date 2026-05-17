"""
Parse the WordPress wpgi_posts INSERT statements robustly.
Handles MySQL-escaped strings including \', \\, \n, \r, etc.
"""
import re, sys, json, os

SQL_FILE = '/mnt/user-data/uploads/inteqyyc_wp79_1_.sql'

POSTS_COLS = [
    'ID','post_author','post_date','post_date_gmt','post_content','post_title',
    'post_excerpt','post_status','comment_status','ping_status','post_password',
    'post_name','to_ping','pinged','post_modified','post_modified_gmt',
    'post_content_filtered','post_parent','guid','menu_order','post_type',
    'post_mime_type','comment_count'
]

def parse_values(s):
    """Parse a single VALUES tuple (without the outer parens). Returns list of values."""
    vals = []
    i = 0
    n = len(s)
    while i < n:
        # skip whitespace and commas
        while i < n and s[i] in ' \t\n\r,':
            i += 1
        if i >= n:
            break
        ch = s[i]
        if ch == "'":
            # quoted string
            i += 1
            buf = []
            while i < n:
                c = s[i]
                if c == '\\' and i + 1 < n:
                    nxt = s[i+1]
                    if nxt == 'n':
                        buf.append('\n')
                    elif nxt == 'r':
                        buf.append('\r')
                    elif nxt == 't':
                        buf.append('\t')
                    elif nxt == '0':
                        buf.append('\0')
                    elif nxt == "'":
                        buf.append("'")
                    elif nxt == '"':
                        buf.append('"')
                    elif nxt == '\\':
                        buf.append('\\')
                    else:
                        buf.append(nxt)
                    i += 2
                elif c == "'":
                    # check for doubled '' (MySQL alt escape)
                    if i + 1 < n and s[i+1] == "'":
                        buf.append("'")
                        i += 2
                    else:
                        i += 1
                        break
                else:
                    buf.append(c)
                    i += 1
            vals.append(''.join(buf))
        elif ch == 'N' and s[i:i+4].upper() == 'NULL':
            vals.append(None)
            i += 4
        else:
            # number or unquoted
            j = i
            while j < n and s[j] not in ',)':
                j += 1
            tok = s[i:j].strip()
            vals.append(tok)
            i = j
    return vals

def find_insert_blocks(sql, table):
    """Find all INSERT INTO `table` [(cols)] VALUES (...),(...); blocks and yield each tuple body."""
    # Match optional column list (anything inside balanced parens up to ` VALUES`)
    pat = re.compile(rf"INSERT INTO `{table}`\s*(?:\([^)]*\)\s*)?VALUES\s*", re.IGNORECASE)
    for m in pat.finditer(sql):
        start = m.end()
        # Now we walk through reading (...) tuples separated by commas, ending at ;
        i = start
        n = len(sql)
        in_str = False
        while i < n:
            # skip whitespace
            while i < n and sql[i] in ' \t\n\r,':
                i += 1
            if i >= n or sql[i] == ';':
                break
            if sql[i] != '(':
                # done
                break
            # find matching closing paren respecting strings
            i += 1
            depth = 1
            tuple_start = i
            in_str = False
            while i < n and depth > 0:
                c = sql[i]
                if in_str:
                    if c == '\\' and i + 1 < n:
                        i += 2
                        continue
                    elif c == "'":
                        # doubled?
                        if i + 1 < n and sql[i+1] == "'":
                            i += 2
                            continue
                        in_str = False
                        i += 1
                    else:
                        i += 1
                else:
                    if c == "'":
                        in_str = True
                        i += 1
                    elif c == '(':
                        depth += 1
                        i += 1
                    elif c == ')':
                        depth -= 1
                        if depth == 0:
                            yield sql[tuple_start:i]
                            i += 1
                            break
                        i += 1
                    else:
                        i += 1

if __name__ == '__main__':
    with open(SQL_FILE, 'r', encoding='utf-8', errors='replace') as f:
        sql = f.read()

    posts = []
    for body in find_insert_blocks(sql, 'wpgi_posts'):
        vals = parse_values(body)
        if len(vals) != len(POSTS_COLS):
            print(f"WARN: got {len(vals)} cols, expected {len(POSTS_COLS)}", file=sys.stderr)
            continue
        row = dict(zip(POSTS_COLS, vals))
        posts.append(row)

    # Filter to published posts only
    published = [p for p in posts if p['post_status'] == 'publish' and p['post_type'] == 'post']
    pages = [p for p in posts if p['post_status'] == 'publish' and p['post_type'] == 'page']
    attachments = [p for p in posts if p['post_type'] == 'attachment']
    print(f"Total post rows: {len(posts)}")
    print(f"Published posts (post): {len(published)}")
    print(f"Published pages: {len(pages)}")
    print(f"Attachments: {len(attachments)}")
    print()
    print("Published posts (title, slug, date):")
    for p in sorted(published, key=lambda x: x['post_date']):
        print(f"  {p['post_date']}  {p['post_name']:60s}  {p['post_title'][:60]}")
    print()
    print("Published pages:")
    for p in pages:
        print(f"  {p['post_name']:30s}  {p['post_title']}")
