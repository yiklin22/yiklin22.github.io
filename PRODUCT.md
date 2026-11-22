# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Hiring managers and recruiters filling forward-deployed engineer, AI engineer and solutions engineer roles. They
arrive from a link in an application or a GitHub profile, usually on a laptop between other candidates, and decide
within a minute whether to read one project in depth. Success: they read one project closely and then get in touch.

## Product Purpose
A one-page portfolio for an AI engineer who wants FDE / AI engineering work. It presents three projects as measured
answers to the questions a customer asks before trusting an AI system: can I check its work, what will it cost, and
when does a person still have to look.

## Positioning
Every project is answered with a number from a real report in its repository, plus what that number does not show.
Most AI portfolios show demos; this one shows measurements and their limits.

## Operating Context
Visitors compare many candidates quickly. The page is static (no build step, no Node on the author's machine) and is
meant for GitHub Pages. Project repositories are currently private; repo links work only once they are made public.

## Capabilities and Constraints
- One static `index.html` with inline SVG and a small inline script. `tools/chart.py` regenerates the longhaul chart
  between the `LONGHAUL_CHART` markers.
- Projects: fieldgate (document field extraction with a certified approval cut), longhaul (Inspect AI eval of agent
  context strategies and caching cost), Personal Knowledge System (AI proposes, code checks quotes, a person approves).
  Also: Looking Game (Godot co-op demo).
- The interactive approval-gate demo (drag a cut-off, watch approvals, errors and hand-offs change) must survive any
  redesign. Its scores are simulated and must stay labelled as such.

## Brand Commitments
- Display name "Eagle"; the only contact is github.com/yiklin22. No real name, email or LinkedIn is published.
- Voice: plain, specific, no hype. Figures carry their sample size.

## Evidence on Hand
Figures are copied from the project reports (`fieldgate/docs/results/cord.md`, `longhaul/README.md`,
`longhaul/docs/results/sweeps.md`, `ai-knowledge-system/docs/*.md`). Change them there first, then here. There are no
testimonials, employers, clients or photos; none may be invented. longhaul has no live-model run yet.

## Product Principles
- A number, its sample size, and its limit travel together.
- Show the mechanism working rather than describing it.
- A visitor should find one project worth reading within a minute.
