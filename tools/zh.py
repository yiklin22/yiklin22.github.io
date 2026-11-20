#!/usr/bin/env python3
"""Build the Traditional Chinese (Taiwan) copy of the site in zh-tw/.

The English pages are the source. Each piece of text in them (a heading, a paragraph, a nav word, an alt or
aria-label, a label the demo script writes) is looked up in tools/zh-tw.json, keyed by its English HTML with
runs of whitespace collapsed to one space. A value of null keeps the English (a name, a sample receipt).

    python3 tools/zh.py     # rewrites zh-tw/ from the English pages

When English text has no translation yet, it writes those strings to tools/zh-tw.missing.json, builds
nothing and exits 1: add them to tools/zh-tw.json and run it again.
"""
import html.parser
import json
import posixpath
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = 'zh-tw'
STRINGS = ROOT / 'tools' / 'zh-tw.json'
MISSING = ROOT / 'tools' / 'zh-tw.missing.json'
LANG = 'zh-Hant-TW'
PAGES = ['index.html', 'projects.html'] + sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / 'projects').glob('*.html'))

# tags that sit inside a run of text; a unit is the largest element holding text and only these
INLINE = {'a', 'abbr', 'b', 'br', 'button', 'cite', 'code', 'data', 'em', 'i', 'img', 'input', 'kbd', 'label', 'mark',
          'output', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'wbr', 'tspan'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
SKIP = {'script', 'style', 'pre'}
ATTRS = ('alt', 'title', 'aria-label', 'placeholder', 'data-kind', 'data-msg', 'data-where')
META = {'description', 'og:title', 'og:description', 'og:image:alt', 'twitter:title', 'twitter:description'}
CJK_FONTS = '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif'
ZH_HEAD = f"""<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400..700&display=swap" rel="stylesheet">
<style>
  /* zh-tw: Chinese characters fall back to a Traditional Chinese face (Noto Sans TC, loaded above, where the device
     has no PingFang); headings drop the tight Latin tracking */
  :root {{ --font-display: "Sora", {CJK_FONTS}; --font-text: "Figtree", {CJK_FONTS};
          --font-mono: "Martian Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, {CJK_FONTS};
          --display-tracking: -0.01em; --display-tracking-xl: -0.015em; }}
  /* letters-assemble keeps each space-separated word on one line; a Chinese statement has no spaces, so it
     wraps between characters instead (html: outranks moment.css, which loads later) */
  html .mo-la.is-live .mo-w {{ display: inline; white-space: normal; }}
  html .mo-la__type {{ letter-spacing: 0; }}
</style>
"""


def key(s):
    return re.sub(r'\s+', ' ', s).strip()


def has_words(s):
    return re.search(r'[A-Za-z]{2,}', re.sub(r'<[^>]+>|&[a-z]+;', ' ', s)) is not None


class Node:
    def __init__(self, tag, attrs, start, inner_start):
        self.tag, self.attrs, self.start, self.inner_start = tag, dict(attrs), start, inner_start
        self.inner_end = None
        self.children, self.text = [], False


class Parser(html.parser.HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.src, self.lines = src, [0]
        for m in re.finditer('\n', src):
            self.lines.append(m.end())
        self.root = Node('#root', [], 0, 0)
        self.stack = [self.root]

    def pos(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        start = self.pos()
        node = Node(tag, attrs, start, start + len(self.get_starttag_text()))
        self.stack[-1].children.append(node)
        if tag in VOID:
            node.inner_end = node.inner_start
        else:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        start = self.pos()
        node = Node(tag, attrs, start, start + len(self.get_starttag_text()))
        node.inner_end = node.inner_start
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        tags = [n.tag for n in self.stack]
        if tag not in tags:
            sys.exit(f'zh.py: stray </{tag}> at {self.getpos()}')
        if self.stack[-1].tag != tag:
            sys.exit(f'zh.py: <{self.stack[-1].tag}> not closed before </{tag}> at {self.getpos()}')
        self.stack.pop().inner_end = self.pos()

    def handle_data(self, data):
        if data.strip():
            self.stack[-1].text = True


def inline_only(n):
    """True when n holds no element but INLINE ones (an svg without text counts as one inline picture)."""
    if n.tag in SKIP:
        return False
    for c in n.children:
        if c.tag == 'svg' and not has_text(c):
            continue
        if c.tag not in INLINE or not inline_only(c):
            return False
    return True


def has_text(n):
    return n.tag not in SKIP and (n.text or any(has_text(c) for c in n.children))


def units(src):
    """(start, end, english) for every piece of text to translate, in document order."""
    root = Parser(src)
    root.feed(src)
    root.close()
    out = []

    def attrs(n):
        tag_src = src[n.start:n.inner_start]
        names = list(ATTRS)
        if n.tag == 'meta' and (n.attrs.get('name') in META or n.attrs.get('property') in META):
            names.append('content')
        for name in names:
            m = re.search(r'\s%s\s*=\s*(["\'])(.*?)\1' % re.escape(name), tag_src, re.S)
            if m and has_words(m.group(2)):
                out.append((n.start + m.start(2), n.start + m.end(2), m.group(2)))

    def walk(n):
        for c in n.children:
            if c.tag in SKIP or c.attrs.get('translate') == 'no':
                continue
            attrs(c)
            if has_text(c) and inline_only(c):
                inner = src[c.inner_start:c.inner_end]
                if has_words(inner):
                    lead = len(inner) - len(inner.lstrip())
                    trail = len(inner) - len(inner.rstrip())
                    out.append((c.inner_start + lead, c.inner_end - trail, inner.strip()))
            else:
                if c.text:
                    print(f'zh.py: text beside block elements in <{c.tag}> at offset {c.start} is not translated', file=sys.stderr)
                walk(c)

    walk(root.root)
    # labels the page's own scripts write (the pass mark demo): a quoted string that starts with a capital word
    for m in re.finditer(r'<script>(.*?)</script>', src, re.S):
        for s in re.finditer(r"'([A-Z][a-z]+(?: [^'\n]*)?)'", m.group(1)):
            out.append((m.start(1) + s.start(1), m.start(1) + s.end(1), s.group(1)))
    return sorted(out)


URL_ATTR = re.compile(r'''(\s(?:href|src|poster)\s*=\s*)(["'])(.*?)\2''', re.S)
CSS_URL = re.compile(r'''url\((["']?)(.*?)\1\)''')


def move(url, page):
    """The URL as written on the zh-tw copy of page: other pages stay in zh-tw/, everything else is reached from there."""
    if not url or re.match(r'^([a-z][a-z0-9+.-]*:|//|#)', url, re.I):
        return url
    path, sep, rest = re.match(r'([^?#]*)([?#]?)(.*)', url).groups()
    if not path:
        return url
    target = posixpath.normpath(posixpath.join(posixpath.dirname(page), path))
    if target in PAGES:
        return url
    return posixpath.relpath(target, posixpath.join(OUT, posixpath.dirname(page)) or '.') + sep + rest


def build(page, src, strings):
    edits = []
    for start, end, en in units(src):
        zh = strings[key(en)]
        if zh is not None:
            edits.append((start, end, zh))
    for start, end, zh in reversed(edits):
        src = src[:start] + zh + src[end:]
    src = src.replace('<html lang="en"', f'<html lang="{LANG}"', 1)
    src = URL_ATTR.sub(lambda m: m.group(1) + m.group(2) + move(m.group(3), page) + m.group(2), src)
    src = re.sub(r'(<meta property="og:image" content=")([^"]*)', lambda m: m.group(1) + move(m.group(2), page), src)
    src = CSS_URL.sub(lambda m: f'url({m.group(1)}{move(m.group(2), page)}{m.group(1)})', src)
    # the switch: EN goes back to the English page, 繁中 is this one
    up = posixpath.relpath(page, posixpath.join(OUT, posixpath.dirname(page)) or '.')
    here = posixpath.basename(page)
    src = re.sub(r'(<a class="lang__opt" href=")[^"]*(" lang="en"[^>]*?)( aria-current="true")?>', rf'\g<1>{up}\g<2>>', src)
    src = re.sub(rf'(<a class="lang__opt" href=")[^"]*(" lang="{LANG}"[^>]*?)>', rf'\g<1>{here}\g<2> aria-current="true">', src)
    # a Chinese headline has no spaces to split into rising words, so it rises whole
    src = re.sub(r'<h1(?![^>]*data-enter-whole)', '<h1 data-enter-whole', src)
    return src.replace('</head>', ZH_HEAD + '</head>', 1)


def main():
    strings = json.loads(STRINGS.read_text(encoding='utf-8')) if STRINGS.exists() else {}
    sources = {page: (ROOT / page).read_text(encoding='utf-8') for page in PAGES}
    missing = {}
    for page, src in sources.items():
        for _, _, en in units(src):
            k = key(en)
            if k not in strings and k not in missing:
                missing[k] = page
    if missing:
        MISSING.write_text(json.dumps(missing, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(f'zh.py: {len(missing)} strings have no translation; see {MISSING.relative_to(ROOT)}', file=sys.stderr)
        sys.exit(1)
    MISSING.unlink(missing_ok=True)
    for page, src in sources.items():
        out = ROOT / OUT / page
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(build(page, src, strings), encoding='utf-8')
    print(f'zh.py: wrote {len(sources)} pages to {OUT}/')


if __name__ == '__main__':
    main()
