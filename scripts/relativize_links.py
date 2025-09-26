#!/usr/bin/env python3
import os
import re
import sys
from urllib.parse import urlparse

ROOT = os.path.abspath(os.getcwd())

# Domain to strip
DOMAIN = re.compile(r"^https?://sophiemaslowski\.com/?", re.IGNORECASE)

ASSET_EXT_RE = re.compile(r"\.(css|js|woff2?|eot|svg|ttf)(?:[?#].*)?$", re.IGNORECASE)

def strip_asset_query(u: str) -> str:
    if ASSET_EXT_RE.search(u):
        # remove any ?... after the extension
        q = u.find('?')
        if q != -1:
            return u[:q]
    return u

def relpath(from_dir: str, target_url: str) -> str:
    # strip domain
    t = DOMAIN.sub("/", target_url)
    # leave data:, mailto:, tel:, javascript: untouched
    if re.match(r"^(data:|mailto:|tel:|javascript:)", t, re.IGNORECASE):
        return target_url
    # external domains untouched
    if re.match(r"^https?://", t):
        return target_url
    # Map to filesystem path
    if t.startswith('/'):
        abs_target = os.path.join(ROOT, t.lstrip('/'))
    else:
        # resolve relative to from_dir
        abs_target = os.path.normpath(os.path.join(from_dir, t))
    # If target is a directory, point to its index.html when present
    if os.path.isdir(abs_target):
        index_cand = os.path.join(abs_target, 'index.html')
        if os.path.exists(index_cand):
            abs_target = index_cand
        else:
            # keep directory path; relpath will point to dir (host dependent)
            pass
    # If target path doesn't exist but directory/index.html does, point to that
    if not os.path.exists(abs_target):
        cand = os.path.join(ROOT, t.lstrip('/'), 'index.html')
        if os.path.exists(cand):
            abs_target = cand
    # Compute relative path from from_dir
    rel = os.path.relpath(abs_target, start=from_dir)
    # Normalize to URL separators
    rel_url = rel.replace(os.sep, '/')
    return rel_url

ATTRS = [
    'href', 'src', 'content'
]

def process_file(path: str):
    basedir = os.path.dirname(os.path.abspath(path))
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    changed = False

    # Replace in attributes
    def repl_attr(m):
        nonlocal changed
        attr = m.group('attr')
        quote = m.group('q')
        url = m.group('url')
        # Keep Google Fonts absolute
        if re.search(r"fonts\.googleapis\.com", url, re.IGNORECASE):
            if not url.startswith('http'):
                new_url = 'https://' + url.lstrip('/').lstrip('\n')
            else:
                new_url = url
        else:
            new_url = relpath(basedir, url)
        # Drop cache-busting queries for static assets
        new_url = strip_asset_query(new_url)
        if new_url != url:
            changed = True
        return f"{attr}={quote}{new_url}{quote}"

    attr_re = re.compile(r"(?P<attr>href|src|content)=(?P<q>['\"])\s*(?P<url>[^'\"]+?)\s*(?P=q)", re.IGNORECASE)
    text = attr_re.sub(repl_attr, text)

    # Replace plain absolute URLs to the domain in text nodes
    def repl_plain(m):
        nonlocal changed
        url = m.group(0)
        new_url = relpath(basedir, url)
        if new_url != url:
            changed = True
        return new_url

    plain_url_re = re.compile(r"https?://sophiemaslowski\.com[^\s'\"<>]*", re.IGNORECASE)
    text = plain_url_re.sub(repl_plain, text)

    # Also handle CSS url(...) patterns inside style blocks
    def repl_css(m):
        nonlocal changed
        inner = m.group(1)
        raw = inner.strip()
        if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
            url = raw[1:-1]
            quote = raw[0]
        else:
            url = raw
            quote = ''
        # Keep Google Fonts absolute
        if re.search(r"fonts\.googleapis\.com", url, re.IGNORECASE):
            new_url = url if url.startswith('http') else 'https://' + url.lstrip('/')
        elif DOMAIN.match(url) or url.startswith('/') or not re.match(r'^https?://', url):
            new_url = relpath(basedir, url)
            # Drop queries for static assets
            new_url = strip_asset_query(new_url)
        if new_url != url:
            changed = True
        if quote:
            return f"url({quote}{new_url}{quote})"
        return f"url({new_url})"
        return m.group(0)

    css_re = re.compile(r"url\(([^)]*)\)")
    text = css_re.sub(repl_css, text)

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
        return True
    return False

def main():
    changed_files = []
    for root, dirs, files in os.walk('.'):
        # Skip WordPress includes source directory
        if root.startswith('./wp-includes'):
            continue
        for name in files:
            should_process = False
            if root.startswith('./wp-json'):
                should_process = True
            elif any(ext in name for ext in ('.html', '.xml', '.txt')) or 'xmlrpc.php' in name:
                should_process = True
            if should_process:
                path = os.path.join(root, name)
                if process_file(path):
                    changed_files.append(path)
    print(f"Updated {len(changed_files)} files")
    for p in changed_files[:20]:
        print(f" - {p}")

if __name__ == '__main__':
    main()
