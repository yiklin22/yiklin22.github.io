"""Redraw the longhaul cost chart inside index.html from the figures in longhaul/docs/results/sweeps.md.

    python3 tools/chart.py

The chart is inline SVG styled by the page's own colour tokens, so it follows the light and dark themes.
"""
import math
import re
from pathlib import Path

PAUSES = ["10 s", "2 min", "4.7 min", "6.7 min", "15 min", "40 min", "67 min"]
SERIES = [  # name, css class, dollars per shift at each pause, y nudge for the end label
    ("5-minute cache only", "hold", [1.84, 1.84, 1.84, 24.33, 24.33, 24.33, 24.33], 6),
    ("Summarise", "aux", [1.34, 1.34, 1.35, 1.77, 1.77, 1.79, 15.53], 0),
    ("Full history, cached", "go", [1.84, 1.84, 1.84, 2.06, 2.06, 2.06, 38.60], 0),
]
NO_CACHE = 28.56
X0, X1, TOP, BOTTOM, HIGH = 64, 540, 44, 318, 50.0


def x(i: int) -> float:
    return X0 + i * (X1 - X0) / (len(PAUSES) - 1)


def y(v: float) -> float:
    return BOTTOM - math.log10(v) / math.log10(HIGH) * (BOTTOM - TOP)


def svg() -> str:
    out = ['<svg viewBox="0 0 760 372" role="img" aria-label="Line chart of modelled cost per shift against the pause between '
           'operator turns. Full history with caching costs $1.84 up to a 4.7 minute pause, $2.06 up to 40 minutes and $38.60 at '
           '67 minutes, above the $28.56 it costs with no cache. With only a 5-minute cache it jumps to $24.33 once pauses pass '
           'five minutes. Summarising costs $15.53 at 67 minutes, the cheapest.">']
    lx = X0
    for name, cls, _, _ in reversed(SERIES):
        out.append(f'<path class="s-{cls}" d="M{lx} 18 h26"/><text x="{lx + 34}" y="22">{name}</text>')
        lx += 34 + 6.4 * len(name) + 24
    out.append(f'<path class="s-ref" d="M{lx:.0f} 18 h26"/><text x="{lx + 34:.0f}" y="22">No cache</text>')
    for tick in (1, 2, 5, 10, 20, 50):
        out.append(f'<path class="gridline" d="M{X0} {y(tick):.1f} H{X1}"/><text x="{X0 - 10}" y="{y(tick) + 4:.1f}" text-anchor="end">${tick}</text>')
    for i, label in enumerate(PAUSES):
        out.append(f'<text x="{x(i):.1f}" y="{BOTTOM + 22}" text-anchor="middle">{label}</text>')
    out.append(f'<text x="{(X0 + X1) / 2:.0f}" y="{BOTTOM + 44}" text-anchor="middle">pause between operator turns</text>')
    out.append(f'<path class="axis" d="M{X0} {BOTTOM} H{X1}"/>')
    out.append(f'<path class="s-ref" d="M{X0} {y(NO_CACHE):.1f} H{X1}"/>')
    out.append(f'<text class="strong" x="{X1 + 12}" y="{y(NO_CACHE) + 1:.1f}">No cache ${NO_CACHE:.2f}</text>')
    for name, cls, values, nudge in SERIES:
        points = " L".join(f"{x(i):.1f} {y(v):.1f}" for i, v in enumerate(values))
        out.append(f'<path class="s-{cls}" d="M{points}"/>')
        for i, v in enumerate(values):
            out.append(f'<circle class="f-{cls} ring" cx="{x(i):.1f}" cy="{y(v):.1f}" r="4.5"><title>{name}, {PAUSES[i]} pause: ${v:.2f}</title></circle>')
        out.append(f'<text class="strong" x="{X1 + 12}" y="{y(values[-1]) + 4 + nudge:.1f}">{name} ${values[-1]:.2f}</text>')
    out.append(f'<text x="{x(3) + 10:.1f}" y="{y(24.33) + 20:.1f}">expires before every turn</text>')
    out.append(f'<text x="{x(0):.1f}" y="{y(1.84) - 12:.1f}">$1.84</text>')
    out.append("</svg>")
    return "".join(out)


def main() -> None:
    page = Path(__file__).resolve().parent.parent / "index.html"
    text = page.read_text()
    block = re.compile(r"<!--LONGHAUL_CHART-->.*?<!--/LONGHAUL_CHART-->", re.S)
    if not block.search(text):
        text = text.replace("<!--LONGHAUL_CHART-->", "<!--LONGHAUL_CHART--><!--/LONGHAUL_CHART-->")
    page.write_text(block.sub(lambda m: "<!--LONGHAUL_CHART-->" + svg() + "<!--/LONGHAUL_CHART-->", text))


if __name__ == "__main__":
    main()
