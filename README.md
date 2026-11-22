# Portfolio site

One static page, no build step: `index.html`, with its drawings inline.

## Look at it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000     # then http://localhost:8000
```

## Change it

- **Name and links:** search `index.html` for `Eagle` and `yiklin22`.
- **Numbers:** each project keeps one figure in its section's text. They are copied from the reports in the project
  repositories (`fieldgate/docs/results/cord.md`, `longhaul/README.md`, `ai-knowledge-system/docs/*.md`); update them
  there first, then here. The pass mark demo in the second section runs on simulated scores and says so.
- **Colours and type:** the `:root` block at the top of `index.html` (deep forest green, one pale lime accent; Sora,
  Figtree and Martian Mono). `DESIGN.md` records the system.
- **Design tooling:** built with [taste-skill](https://github.com/Leonxlnx/taste-skill) and
  [Impeccable](https://github.com/pbakaus/impeccable). `assets/` holds the taste-skill kit files the page loads (keep
  them unedited) and the tool icons; `PRODUCT.md`, `DESIGN.md` and `.impeccable/` are Impeccable's context files;
  `.taste-skill/` holds check reports and can stay out of git.

## Put it online with GitHub Pages

1. Make this repository public (Pages on a private repository needs a paid plan), or rename it to
   `yiklin22.github.io` to serve it at the root address.
2. Repository **Settings → Pages → Deploy from a branch → `main` / root**.
3. The project links on the page point at `github.com/yiklin22/<project>`; they only work for visitors once those
   repositories are public too.

## Redraw the cost chart

The longhaul chart is inline SVG generated from the figures in `longhaul/docs/results/sweeps.md`:

```bash
python3 tools/chart.py     # rewrites the chart between the LONGHAUL_CHART markers in index.html
```
