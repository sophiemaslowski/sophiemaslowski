#!/usr/bin/env python3
import os, re

def fix_file(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        txt = f.read()

    orig = txt

    # Fix href/src values ending with \1 caused by prior replacement
    # Fix link href ending with literal \1
    def link_repl(m):
        full = m.group(0)
        val = m.group(1)
        if val.endswith(r"\1"):
            new = val[:-2] + ".css"
            return full.replace(val, new, 1)
        return full
    txt = re.sub(r"<link[^>]*href=['\"]([^'\"]+)['\"]", link_repl, txt, flags=re.IGNORECASE)
    # Fix script src ending with literal \1
    def script_repl(m):
        full = m.group(0)
        val = m.group(1)
        if val.endswith(r"\1"):
            new = val[:-2] + ".js"
            return full.replace(val, new, 1)
        return full
    txt = re.sub(r"<script[^>]*src=['\"]([^'\"]+)['\"]", script_repl, txt, flags=re.IGNORECASE)

    # Normalize google fonts dns-prefetch/hrefs like https://../fonts.googleapis.com to proper
    txt = re.sub(r"https://(?:\./|\../)+fonts\.googleapis\.com", "https://fonts.googleapis.com", txt)

    if txt != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(txt)
        return True
    return False

def main():
    changed = 0
    for root, _, files in os.walk('.'):
        for name in files:
            if name.endswith('.xml') or '.html' in name or 'xmlrpc.php' in name:
                p = os.path.join(root, name)
                if fix_file(p):
                    changed += 1
    print(f"Fixed {changed} files")

if __name__ == '__main__':
    main()
