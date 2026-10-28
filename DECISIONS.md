# C4AI Atlas decisions

Confirmed 2026-10-27. Update this file when a decision changes.

## Brand and visual

| # | Decision | Choice |
|---|---|---|
| 1 | Site name | **C4AI Atlas** |
| 2 | Visual direction | **The Survey**: field guide plus ledger discipline |
| 3 | Mark | **Depth bracket plus fingerprint** |
| 4 | Icons | **Custom 10 to 12 causal-graph glyphs** |
| 5 | Theme | Day: **Survey Blueprint**. Night: **Signal Room** |
| 6 | Type | **Newsreader + IBM Plex Mono + Noto Serif SC subset** |
| 7 | Dark mode | **Optional Lab mode**, not default |
| 8 | Motion | **Editorial**: 120/240/600ms, no ambient motion |

The original warm-paper palette is retired. It reads as generic AI editorial design.

## Home and views

| # | Decision | Choice |
|---|---|---|
| 9 | Hero | Claim plus three numbers plus 580-glyph wall |
| 10 | Default explore | **64-row Fingerprint Ledger**, table toggle |
| 11 | Deeper views | **Build all three**: Hamming lattice, UMAP, 3D |
| 12 | UMAP | Deep exploratory tab, not default |
| 13 | UpSet | **5 components only**, not all 8 |
| 14 | L0 | Collapsed, labeled as all-zero stratum, toggle to show |
| 15 | Reliability toggle | Default off, visible |
| 16 | P0 aggregates | Shown with badge, excluded from headline totals |
| 17 | Bilingual routing | `/en/` and `/zh-Hans/`, reciprocal hreflang |
| 18 | Bilingual scope | UI, methods, capabilities, paper summaries |

All deeper views live under `/deep/`. None is in the default navigation.

## Language and content

| # | Decision | Choice |
|---|---|---|
| 19 | Tone | Maintainer voice, not marketing or academic padding |
| 20 | Paper detail | Static page plus drawer |
| 21 | Negative case label | **negative or cautionary** |
| 22 | Default language | English first, full Chinese mirror |
| 23 | Quote policy | One quote per paper, at most 25 words |
| 24 | Full evidence | Request-only, not public |
| 25 | License | Code MIT, annotations CC BY 4.0, metadata CC0 |

Tone references: PostgreSQL docs, The Rust Book, pandas docs, Linux kernel documentation, Observable, Our World in Data.

## Data, community, operations

| # | Decision | Choice |
|---|---|---|
| 26 | API | **No API**. Versioned static files and a data dictionary |
| 27 | Search | MiniSearch for records, Pagefind for prose |
| 28 | Feedback | Issue forms, form, email |
| 29 | Updates | **Newsletter** plus changelog |
| 30 | Analytics | GoatCounter, cookieless |
| 31 | Deployment | GitHub Actions artifact deploy |
| 32 | Repo layout | Single repo: `data/`, `scripts/`, `site/` |
| 33 | Domain | **Default GitHub Pages project URL**. No custom domain in v1 |
| 34 | Versioning | Semver plus Zenodo DOI |
| 35 | Contribution | DCO sign-off, no CLA |
| 36 | Download format | **JSON only**. No CSV in v0.1 |
| 37 | P0 disclosure | Public badge and aggregate count only. No public internal audit page. |

## Copyright

- Public: metadata, coding, short quotes with locators, own summaries, redrawn charts.
- Not public: PDFs, abstracts, publisher figures and tables, bulk quote exports.
- Key claims link to the source at the point of use.
- `RESPONSIBILITY.md` and `/responsibility/` explain hosting, exclusion, attribution, correction, and takedown.
- Quoted text is excluded from the site license.
