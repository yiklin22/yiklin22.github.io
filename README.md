# Portfolio site

One static page, no build step: `index.html` plus two chart images in `assets/`.

## Look at it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000     # then http://localhost:8000
```

## Change it

- **Name and links:** search `index.html` for `Eagle` and `yiklin22`.
- **Numbers:** each project's figures sit in its `<dl class="readings">` block. They are copied from the reports in
  the project repositories (`fieldgate/docs/results/cord.md`, `longhaul/README.md`,
  `ai-knowledge-system/docs/*.md`); update them there first, then here.
- **Colours and type:** the tokens at the top of the `<style>` block. Light and dark values are defined together.

## Put it online with GitHub Pages

1. Make this repository public (Pages on a private repository needs a paid plan), or rename it to
   `yiklin22.github.io` to serve it at the root address.
2. Repository **Settings → Pages → Deploy from a branch → `main` / root**.
3. The project links on the page point at `github.com/yiklin22/<project>`; they only work for visitors once those
   repositories are public too.
