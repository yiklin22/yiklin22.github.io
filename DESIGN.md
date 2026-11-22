---
name: Eagle Review Desk
description: An AI engineer's portfolio shown as the review tools the projects really have, on deep forest green.
colors:
  forest: "#0f1f10"
  forest-surface: "#162a17"
  ink: "#ffffff"
  muted: "#9aa39a"
  lime: "#c6f19d"
  band: "#ffffff"
  band-surface: "#ecedec"
  band-ink: "#0f1f10"
  band-muted: "#606c60"
  sage: "#cdd6c6"
  paper: "#f1f4ec"
  receipt: "#fbfaf4"
  leaf: "#4c8f2f"
  leaf-light: "#7fbf4d"
  rust: "#b4541a"
typography:
  display:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "2.925rem"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  figure:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  data:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  control: "4px"
  panel: "6px"
  card: "8px"
  pill: "99px"
  round: "50%"
spacing:
  gutter: "80px"
  gutter-phone: "24px"
  column-gap: "24px"
  section-top: "120px"
  section-bottom: "72px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.forest}"
    rounded: "{rounded.control}"
    padding: "0 24px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.forest-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  panel-lit:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.band-ink}"
    rounded: "{rounded.panel}"
  chip-pass:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
---

# Design System: Eagle Review Desk

## Overview

**Creative North Star: "The review desk"**

The page shows the work as the tools a reviewer would sit at: a review queue with a pass mark you can drag, a receipt
with the approved total marked, a cost chart, a diff waiting for approval. It replaces the earlier "test report" look
(white stock, cobalt fields, yellow stamp), which leaned on rows of figures.

Built on the taste-skill kit (`assets/`), which dealt the system: hero `triptych`, `nav-centre`, `close-type`,
`footer-columns`, one inverse band, tonal buttons, the palette `forest-pale-lime`, the pairing Sora + Figtree +
Martian Mono, sharp radius, the sage lit ground, and two moments (`letters-assemble`, `iris-opens`).

**Key characteristics:**
- Deep forest green owns the whole page; one white band (longhaul) breaks it once.
- Pale lime means "passed": the main button, the approved chip, the pass mark. Nothing else is lime.
- Every project is shown as live UI, cut by its frame, on a light sage panel.
- One figure per project in the running text. The rest stays in the repositories.

## Colors

- **Forest** (`#0f1f10`) page ground; **Forest surface** (`#162a17`) cards and the app window.
- **Lime** (`#c6f19d`) the one accent: primary button, approved state, slider and pass mark, focus ring.
- **Band** (`#ffffff`) the single inverse section, with **Band ink** (`#0f1f10`).
- **Sage** (`#cdd6c6`) the lit ground behind UI in frames and card panels.
- **Paper** (`#f1f4ec`) and **Receipt** (`#fbfaf4`) the hero collage pieces.
- Chart only: **Leaf** (`#4c8f2f`), **Leaf light** (`#7fbf4d`), **Rust** (`#b4541a`).

**The pass rule.** Lime marks something that passed or the one action to take. It is never decoration.

## Typography

- **Display** (h1): Sora 400, 46.8px at 1440, three lines, tracking -3.5%.
- **Headline** (h2): Sora 400, 28 to 40px, kept one step under the h1.
- **Body:** Figtree 400 at 16px; leads at 20px. Body text is always the ink, never the muted grey.
- **Data:** Martian Mono for receipt lines, scores and diff code only.
- Sentence case everywhere; no eyebrows above headings.

## Layout

One section per screen: the hero and every section are exactly one or two viewport heights. A 1280px column on a
12-column grid with 24px gutters; the page has one split line (text on columns 1 to 5, the visual on 6 to 12).
Tablet and phone adjustments are in the page's own `<style>` block and keep each section on its screens.

## Components

- **App window:** the review queue list beside the pass mark pane, in one window across the column. The slider is a
  real range input; it relabels the queue rows, redraws the dot plot and recomputes the three readouts.
- **Split frame:** a 5:4 sage frame holding one UI piece cut by its lower edge (the receipt), or the cost chart.
- **Step card:** number, title, two lines, then a sage panel with one kit fragment (notifications, checklist, diff).
- **Projects:** `projects.html`, two screens of four cards, two by two (`#projects`, `#more`): the name and one sentence
  on the card's left half, one figure with its sample, one limit and "Read the case study" on its right half. Then
  `#about`: the one-line bio, a short About, and six "skill: proof" lines, each linked to a case page. Card order and
  its reasoning: `docs/portfolio-review.md`. Weak projects (no model, invented data, never run) are left out.
- **Case page:** `projects/<name>.html`, one per card, built on `projects/case.css`. Four screens: the hero (problem,
  the one figure in Sora with its sample, the limit, the repository button, real UI on a lit frame cut by its lower
  edge); SOAR in four cards, two by two, with a constraints line; the decision and what was dropped beside a second
  piece of real output; how to run it (a terminal block of README commands) and the file the figure comes from. The
  close links the next project in card order. Real UI only: the repos' own screenshots (`assets/projects/*.webp`,
  under 300 KB each), the homepage's kit fragments, or terminal output copied from a README. A phone hides the
  hero's picture; the decision and run sections carry the UI there.
- **Questions:** open answers, each closed by a hairline, beside the tool icons in their own colours.
- **Close:** one heading and one full-width lime button.

## Motion

The hero's entrance and its collage, which changes project every 2.8 s with a pause button; the letters of the
statement assembling as it scrolls in; the white band opening through a circle; one loop per card group; hover and
press on buttons. Reduced motion shows every finished state.

## Do's and Don'ts

### Do:
- Do keep the pass mark demo interactive and say in the text that its scores are simulated.
- Do keep one figure per project in the copy, with its sample size, and one limit per project.
- Do rewrite kit fragments to the project's real subject.

### Don't:
- Don't add stat strips, rating badges or rows of big numbers.
- Don't add a second accent or use lime as decoration.
- Don't invent customers, quotes or results; longhaul has no live-model run yet.
