# C4AI Atlas team

This file defines the working team for the site. The site is self-contained in `site/`. Each role owns one class of decision and one review gate. The lead integrates changes and keeps the public story coherent.

## Roles

| Role | Owns | Required skills | Main artifacts |
|---|---|---|---|
| Product and IA | page map, user journeys, URL state, bilingual content model | `research-writing`, `humanizer` | `SKILL.md`, `DECISIONS.md`, page specs |
| Visual identity | art direction, palette, type, wordmark, icon grammar, OG | `taste-skill`, `ui-ux-pro-max`, `design-system`, `banner-design` | tokens, brand sheet, OG templates |
| Data visualization | ledger, lattice, UMAP, 3D, UpSet, interaction contract | `scientific-visualization`, `ui-ux-pro-max` | chart specs, `atlas.json` schema, table fallback |
| Frontend and platform | Astro, React islands, CSS tokens, GitHub Pages, build | `ui-styling`, `ui-ux-pro-max`, `taste-skill` | `site/`, Actions, performance budget |
| Editorial and bilingual | English and Chinese copy, terminology, citation | `humanizer`, `research-writing`, `citation-management` | page copy, codebook labels, citation blocks |
| Copyright and data governance | quote policy, licenses, responsibility page, provenance | `research-writing`, `citation-management` | `RESPONSIBILITY.md`, `LICENSES.md`, takedown flow |
| QA | accessibility, data correctness, visual regression, performance | `taste-skill`, `scientific-visualization`, `ui-styling` | review notes, screenshots, gate report |

## Review gates

1. Design review with `taste-skill` and real browser screenshots.
2. Visualization review with `scientific-visualization`.
3. Accessibility review at WCAG 2.2 AA.
4. Data review: 580 IDs, bit strings, L and pipeline derivation, pattern counts.
5. Copyright review: no abstracts, no PDFs, quote cap, locator, source link.
6. Bilingual review: hreflang, switcher, Chinese layout.
7. Performance review: initial JS under 180KB gzip, data under 500KB gzip, LCP under 2.5s on 4G.
8. Content review: humanizer pass, claim-evidence map, no causal uplift claim.

## Subagent workflow

- Each subagent works in one directory or one file set. Do not let two agents edit the same component.
- The lead writes the interface contract first: data schema, page props, token names, URL parameters.
- A subagent returns a short memo, changed files, and verification output. It does not publish.
- The lead runs the review gates and integrates.
- Design and visualization subagents must review screenshots of the built page, not only source code.

## Current research inputs

- GitHub Pages data-product architecture memo.
- Anti-template visual identity memo.
- Copyright and data-publishing memo.
- High-dimensional visualization memo.

These are summarized in `SKILL.md`. The raw memos are not part of the public site.
