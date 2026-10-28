# SKILL.md: C4AI Atlas

This file is the working contract for the C4AI Atlas site. It records the product decisions already made and routes design, language, and visualization work to the right skills.

Read this before changing the site, the public data export, or the visual system.

## 1. Confirmed product decisions

- The site is an interactive evidence database, not a paper PDF companion.
- It is deployed on GitHub Pages as a static site. The repository must be directly uploadable and buildable in GitHub Actions.
- Copyright policy is conservative. Public pages use metadata, our coding, short quotes with locators, and links. No PDFs, no full abstracts, no copied figures or tables.
- P0 papers are shown with an `under adjudication` badge. They do not enter headline aggregates until signed.
- The site is bilingual: English and Simplified Chinese.
- The default experience is an interactive data product. Fancier views live one level deeper and are not the landing page.
- The central claim is traceability, not causal uplift. Do not write that causal methods improve AI by a pooled percentage.
- Homepage slogan: **Generalization has a cause.** Chinese: **泛化有因**. The copy states the motivation (paper volume outruns reading) and the mission (problems, causal methods, and evidence in one structure). Do not replace it with a data-count headline.
- The homepage must answer "what is this project?" before it asks the reader to explore.
- Day and night are two designed themes, not an inverted color filter.
- All three deeper views are built: Hamming lattice, UMAP, and 3D. None is the default.
- The site has a dedicated responsibility page that states what is hosted, what is excluded, how attribution works, and how corrections or takedowns are handled.
- Key claims link to their source. Attribution is visible at the point of use, not buried in a footer.
- There is no custom API. Data is published as versioned static files with a data dictionary.
- Newsletter signup replaces a generic community feed.
- The site uses the default GitHub Pages project URL. No custom domain in v1.
- Contribution uses DCO sign-off. No CLA.

The full decision log is in `DECISIONS.md`. Team roles and review gates are in `TEAM.md`. The website is self-contained in `site/` and can be uploaded as its own repository.

## 2. Skill routing

Load the skill that owns the decision. Do not stack overlapping skills on the same artifact without a reason.

| Work | Mandatory skills | Output |
|---|---|---|
| Art direction, anti-template review | `taste-skill`, `ui-ux-pro-max` | visual direction, layout, type and palette checks |
| Design tokens and component specs | `design-system` | token layers, component contracts |
| Frontend components and accessibility | `ui-styling`, `ui-ux-pro-max` | accessible CSS or Tailwind implementation |
| Charts and data graphics | `scientific-visualization`, `ui-ux-pro-max` | chart specs, uncertainty display, table fallback |
| Diagrams and architecture figures | `markdown-mermaid-writing` | Mermaid source and rendered diagram |
| Hero, OG, social images | `banner-design`, `design` | 1200x630 and 1600x900 assets |
| Prose and voice | `humanizer`, `brand` | direct, factual copy without AI tells |
| Claims, evidence, survey structure | `research-writing` | claim-evidence map and section logic |
| Citations and BibTeX | `citation-management` | verified identifiers and reference entries |
| Optional concept sprint | `huashu-design` | three distinct directions before a final pick |
| Optional demo deck | `slides` | HTML slide deck for reviews |

Rules:

- Use `taste-skill` with the real browser inspector and a screenshot loop. Do not judge a page from code alone.
- Use `scientific-visualization` for every quantitative chart, including the audit funnel and κ dot plot.
- Use `humanizer` on every public prose page after the claims are fixed. Do not humanize numbers or technical terms.
- If `huashu-design` is invoked for a new visual direction, follow its three-direction rule. Do not skip to one concept.
- Keep one owner per artifact. A chart spec comes from `scientific-visualization`; a page layout comes from `taste-skill`; the implementation comes from `ui-styling`.

## 3. Visual system

### Direction

Default: **The Survey**, a field guide with ledger discipline.

The site should read like a research instrument or an annotated atlas. It should not read like a SaaS landing page.

References: naturalist field guides, audit ledgers, geological survey plates, Distill, Our World in Data, The Pudding.

### Palette

The original warm-paper palette is retired. It reads as generic editorial AI design. Day is a survey blueprint, not a beige magazine.

**Day: Survey Blueprint**

| Token | Value | Use |
|---|---|---|
| ground | `#F4F5F1` | page ground |
| ink | `#1A1D1B` | primary text |
| muted ink | `#59615B` | secondary text |
| rule | `#CDD2C9` | hairlines, table rules |
| signal magenta | `#B02A6B` | measured signal, P0, exceptions |
| survey blue | `#244A63` | components, links |
| moss | `#5E6B4A` | verified, canon |
| ochre | `#B07A1E` | author judgment, provisional |

**Night: Signal Room**

| Token | Value | Use |
|---|---|---|
| chassis | `#14171A` | page ground |
| panel | `#1E2422` | raised surfaces |
| phosphor | `#7CE3B1` | primary data signal |
| amber | `#FFB454` | warnings, provisional |
| cyan | `#6FD3E8` | links, secondary data |
| text | `#E7E9E4` | primary text |
| muted | `#9AA39C` | secondary text |
| alarm | `#FF6B5E` | P0, errors |

Color encodes data or epistemic status. Never use color as decoration. Both themes use the same semantic tokens, not one-to-one inversions.

### Typography

- Display and prose: Newsreader.
- Data, IDs, counts: IBM Plex Mono with tabular numerals.
- UI chrome: system sans or Public Sans.
- Chinese display: Noto Serif SC subset. Chinese body: system CJK stack.
- Do not ship a 5 MB CJK font. Subset display glyphs only.

### Layout

- 12-column asymmetric grid.
- Left reading column, right plate or data column.
- Spacing steps: 24, 48, 96.
- Hairline rules, not cards.
- Numbers right-aligned. Captions hanging or below the plate.
- No centered layout except plates and stamps.

### Marks and icons

Build a glyph language of 10 to 12 marks from causal-graph primitives:

- node, directed edge, undirected edge, collider, confounder;
- intervention node, cut edge, stratum band, gap, open circle, provenance dot.

Set them on a 16x16 grid, 1.5px stroke, square terminals. Do not commission a generic line-icon set. Do not use emoji as icons.

L0 to L4 is a five-tick bar, not a colored dot.

### Wordmark

`C4AI` as one tight token, `ATLAS` in small caps with +0.12em tracking. The `2` is oxide. The mark is a depth bracket: a vertical rule with five ticks, one offset or missing. It must work at 16px and in grayscale.

### Motion

- 120ms micro, 240ms UI, 600ms narrative.
- Animate opacity and transform only.
- No ambient motion, autoplay, scroll-jacking, or parallax for its own sake.
- Respect `prefers-reduced-motion` and provide a visible reduce-motion toggle.

### Taste-skill exceptions

The site uses IBM Plex Mono for IDs, counts, and tabular data. This is a deliberate exception to the taste-skill monospace rule, because the data product needs aligned numbers and stable identifiers. Do not use mono for prose or navigation.

Hairlines are allowed inside real tables, the ledger, and the audit grid. They are not decoration. Do not add rules between prose sections.

The site has no photographs of papers or authors. The glyph wall, ledger, and charts are the imagery. Do not add stock photography or AI-generated paper art to satisfy an image count.

### Anti-template rules

Never:

- gradient hero or mesh gradient;
- glassmorphism or blurred panels;
- floating cards with soft shadows;
- generic three-column feature grid with line icons;
- bento grid as the page skeleton;
- neon dark mode to signal "AI";
- brain, neuron, globe, or network-hairball imagery;
- `580+ papers` count-up as the main proof;
- sparkle icons or "AI-powered" badges;
- mixed icon sets;
- continuous gradients for categorical data;
- centered everything.

Instead:

- one structural spine per page: ledger, plate, strata, or chart;
- a real data fragment above the fold, with n and provenance;
- a visible version number and last-computed date;
- one notation system across the site;
- editorial asymmetry and a reading column.

## 4. Visualization system

### What the data is

The 580 papers produce 64 observed 8-bit patterns out of 256. The modal pattern `11100010` has 72 papers. 556 of 580 papers share a pattern with at least one other paper. 39 papers are all-zero and are L0.

`object_consumed` implies `explicit_object`. `training_signal` and `pos_inner` are nearly the same bit. L and pipeline are derived rules, not independent ratings.

Do not invent a latent continuous depth. Do not treat a 2D projection as a measurement.

### Default: Fingerprint Ledger

The primary analytical view is a 64-row pattern ledger.

Each row:

- 8-bit fingerprint, split 5 components + 3 positions;
- paper count;
- derived L and pipeline;
- family mix;
- κ badge for the relevant bits;
- expand to the paper list.

Rules:

- Fixed bit order: `explicit_object`, `object_consumed`, `training_signal`, `agent_loop`, `external_tool`, `pos_before`, `pos_inner`, `pos_after`.
- Visible gap between components and positions.
- Filled cell = 1, outlined cell = 0. Add a second channel beyond color.
- L0 collapsed by default, labeled as an all-zero stratum, toggle to show.
- Sort by L descending, then count descending.
- Provide a native table view and a JSON download. No CSV in v0.1.
- Show the filter sentence in plain language: "CausalRL AND agent_loop=1 AND year >= 2024 -> 12 papers."

### Time series

The home page shows annual counts as stacked bars by paper group, with a bold total line. Bars sit at low opacity by default; hovering a legend item or segment highlights one group and dims the rest. 2026 is marked as partial. The chart describes corpus counts, not field growth.

### Human-readable coding

Every 8-bit string has a plain-language mapping:

```text
E explicit object      C downstream use
T training constraint  A agent loop
X external tool        B data stage
I training stage       F inference stage
```

Pattern rows show the bit string and the labels for the 1 bits. The full 8-field legend sits under the table. Paper records, hover titles, and the deep-view panel use the same mapping.

### Secondary: Causal Map

A 64-node graph of observed patterns. An edge connects two patterns that differ by exactly one bit.

- Node size = paper count.
- Node shape = fingerprint glyph.
- Node color = L, with labels.
- Edge hover = which bit flips.
- Side panel lists one-bit moves and counts.
- Layout is precomputed and presentational. The graph is exact; coordinates are not analytical.
- Mobile becomes a sorted list by distance from the selected pattern.

This view answers: "What is one coding change away?" It is the distinctive view.

### Deeper views

All three experimental views are built under a `Deep view` entry. None appears in the default navigation.

- **Hamming lattice**: 64 patterns, one-bit edges, exact adjacency. This is the first tab.
- **UMAP**: exploratory projection. Precompute on the 64 patterns or on papers with a fixed seed. Use Hamming for all 8 bits or Jaccard on the 5 components, never mix metrics silently. Publish seed, `n_neighbors`, `min_dist`, library version, and trustworthiness. Label the tab `Exploratory projection`, not `Map`.
- **3D orbital**: a Three.js or canvas scene of the 64 patterns. It is a presentation view, not an analytical one. Provide a 2D fallback and never require it for access to data.

Also available:

- **PCA**: deterministic 2D projection. Show loadings. Label axes as coding-bit contrasts, not measured depth. Do not standardize bits before PCA unless the methods page explains why.
- **UpSet**: 5 components only, not all 8. Precompute intersections. Sort by L. Show "64 of 256 combinations observed." Do not let an "Other" bucket hide the tail.
- **Parallel coordinates**: aggregate to 64 patterns, width proportional to count, orthogonal step lines, fixed protocol order. Hide on mobile.

Never use t-SNE. Do not make 3D or UMAP the default. Both are presentation layers over the exact ledger.

### Interaction contract

- Hover previews. Click pins.
- One selection store shared by ledger, map, table, and paper drawer.
- URL state for filters and pinned selections. Hover never writes history.
- Keyboard: roving tabindex on rows and nodes, Escape closes overlays, focus ring visible.
- Live region announces "72 papers selected."
- Every chart has a "view as table" link.
- Never encode selection with color alone.
- Animate opacity and outline, not layout coordinates.
- Year animation is off by default. Label 2026 as partial. Use equal-count cohorts or cumulative reveal, not raw year playback.
- Mobile: no hover-dependent information, no parallel coordinates, tap targets at least 44px.

### Reliability display

Show κ next to each bit where it exists. `external_tool` has no κ, show a dash.

Use a "reliable only" toggle for `explicit_object`, `training_signal`, `agent_loop`, `pos_inner`. Do not build a pipeline-shift story on `pos_before` or `pos_after`.

### Chinese copy rules

- Page titles are noun phrases. The subtitle explains the noun in one sentence.
- Use plain Chinese. Do not coin a metaphor when a common noun exists.
- Use these terms consistently:
  - 编码总表, not 账本
  - 编码位 or 8 位编码, not bit or 指纹
  - 耦合程度, not 耦合等级 or 因果参与程度
  - 介入阶段, not pipeline 位置
  - 对照强度, not tier
  - 论文分组, not family
  - 待核定, not 待签 or 待裁定
  - 数据核查, not 审计
  - 代表论文, not exemplar
  - 反例, not negative case
  - 原文位置, not locator
- P0 has two meanings. Write "P0 记录（待核定）" for papers and "P0 能力（优先验证）" for capabilities. Explain both in the glossary.
- Avoid "不是……而是……" and standalone "不是……" as rhetoric. State the positive fact.
- Do not leave English UI labels in Chinese pages. Keep technical names such as SCM, DAG, UMAP, PCA, DOI, arXiv, and JSON, and explain them at first use.
- Every page that uses coding terms links to the glossary in `/methods/#glossary`.

### P0 disclosure

There is no public P0 audit page. The internal worksheet, reviewer notes, and signatures stay out of the site.

The public site shows:

- a `P0 pending` badge on the affected paper records;
- the count and its exclusion from headline totals;
- the aggregate P0 count on `/audit/`;
- a plain explanation of what P0 means in `/methods/#glossary`.

The article can report aggregate audit results. The website does not publish the internal adjudication workflow.

## 5. Language and content

### Tone

Write like a maintainer of a long-lived open-source project, not like a launch page.

Reference voices:

- PostgreSQL documentation: plain, exact, no filler.
- The Rust Book: second person for instructions, examples before abstraction.
- pandas documentation: task-first, honest about limits.
- Linux kernel documentation: terse, operational, no marketing.
- Observable and Our World in Data: explain the chart, then show the caveat.

Rules:

- Short sentences. Concrete nouns. One claim per paragraph.
- Use "you" for instructions and "we" for project decisions.
- Show the number, the denominator, and the source.
- No throat-clearing, no "in today's rapidly evolving landscape".
- No academic padding, no false modesty, no marketing.
- Humor is allowed when it comes from the material, not from a persona.

Good:

> 580 papers. 64 coding combinations. 10 P0 rows still unsigned.

Good:

> The corpus has more causal vocabulary than causal identification.

Bad:

> Causality is transforming AI.

Bad:

> Our comprehensive, novel atlas provides valuable insights.

### Claims

Every quantitative sentence needs a denominator, a source, and a version. If the number is provisional, say so.

Do not write:

- "causal methods improve AI by X%";
- "causality is increasing";
- "pipeline position moved inward";
- "the field has converged."

These claims are not identified by the corpus.

### Bilingual rules

- Use `/en/` and `/zh-Hans/` paths with reciprocal `hreflang`.
- Root serves a real default-language page with a visible switcher. No JS auto-redirect.
- One dataset, separate label catalogs keyed by stable IDs.
- Translate UI, methods, codebook labels, capability names, and page summaries.
- Do not publish translated abstracts. Translating an abstract creates a derivative work.
- Paper titles may be translated, but keep the original title visible.
- Set `lang="zh-Hans"` on Chinese blocks even inside an English page.
- Test the Chinese layout at 320px with the longest labels.

## 6. Data, copyright, release

### Public data

Publish:

- metadata: title, authors, year, venue, DOI, arXiv ID;
- coding labels and codebook;
- one short quote per paper where it carries the argument, at most 25 words, with locator;
- own-words summaries;
- redrawn charts and their source numbers.

Withhold:

- PDFs and full text;
- abstracts;
- publisher figures and tables as images;
- bulk quote exports;
- reviewer names and internal notes.

### Quote discipline

- At most one quote per paper in the public record. A second quote only for P0 capability exemplars.
- At most 50 words of verbatim text per paper in total.
- Never quote the abstract or a full conclusion.
- Every quote gets a three-part locator: section, paragraph or table, and page if available.
- Store quotes as evidence for a label, not as a reading substitute.

### Attribution in context

Every claim visible on the site links to its source at the point of use:

- paper title -> DOI or arXiv landing page;
- quote -> locator plus DOI or arXiv link;
- capability exemplar -> paper record;
- chart -> methods page and downloadable source numbers.

A global footer is not enough. Attribution must sit next to the claim.

### Responsibility page

`RESPONSIBILITY.md` and `/responsibility/` state:

- what the site hosts and what it deliberately excludes;
- that labels are our judgments, not peer review or legal advice;
- that quoted text remains with its authors and publishers;
- how to report a factual error, a mislabel, or a copyright concern;
- the response window and tombstone policy;
- that arXiv and publishers have not endorsed the project;
- the jurisdictions considered: US, EU, China.

### Licenses

- Code: MIT.
- Annotations, codebook, site prose: CC BY 4.0.
- Metadata: CC0 where sourced from OpenAlex, Crossref, or arXiv.
- Quoted third-party text: explicitly excluded from the site license.

Add `LICENSES.md`, `CITATION.cff`, and the responsibility page.

### Build source

Build the public snapshot from the adjudicated merge, not from a glob of A/B coding folders. Until P0 is closed:

- set `data_status: provisional`;
- flag P0 rows;
- exclude them from headline aggregates;
- do not publish final A precision or scale-sweep counts as facts.

## 7. Site architecture

```
/
  SKILL.md
  README.md
  CITATION.cff
  LICENSE
  LICENSES.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  CHANGELOG.md
  .github/
    workflows/pages.yml
    ISSUE_TEMPLATE/data-error.yml
    ISSUE_TEMPLATE/new-paper.yml
    ISSUE_TEMPLATE/bug.yml
    ISSUE_TEMPLATE/accessibility.yml
  data/
    raw/
    coded/
    codebook.yml
    schema/
  scripts/
    validate.py
    build_atlas.py
    build_og.py
  site/
    src/pages/index.astro
    src/pages/explore.astro
    src/pages/deep.astro
    src/pages/capabilities.astro
    src/pages/audit.astro
    src/pages/methods.astro
    src/pages/responsibility.astro
    src/pages/newsletter.astro
    src/pages/download.astro
    src/pages/about.astro
    src/components/
    public/
      atlas/v1/
  site/dist/
```

GitHub Pages:

- Use GitHub Actions artifact deploy with `actions/configure-pages`, `upload-pages-artifact`, and `deploy-pages`.
- Set Astro `base` from `SITE_BASE`, defaulting to `/`. The Pages workflow sets it to the repository name. Test under the repository subpath.
- Add `.nojekyll`.
- Use static multi-page routes. No history-mode SPA routing.
- Add `404.html`.
- Version data paths. `manifest.json` is the only mutable file.
- Add `sitemap.xml`, `robots.txt`, canonical tags, and one default OG image.
- No custom domain in v1. Canonical URLs use the GitHub Pages project path.

### Static data, no API

There is no API promise. Publish versioned files and a data dictionary:

```text
/atlas/v1/manifest.json
/atlas/v1/papers.json
/atlas/v1/patterns.json
/atlas/v1/capabilities.json
/atlas/v1/codebook.json
/atlas/v1/README.md
```

The download page explains the schema, version, checksum, and citation. Do not document endpoints, CORS, rate limits, or an OpenAPI contract.

### Problem navigator

`/navigator/` is a static rule engine, not a model demo:

- Inputs: problem family, data type, intervention condition, confounding status.
- Outputs: candidate capabilities, assumptions, failure mode, minimal test, capability-level exemplars.
- Rules live in `public/atlas/v1/navigator.json` and are rebuilt by `scripts/build_navigator.py`.
- No runtime LLM, no API key, no server, no personalization.
- Do not show a confidence score, a match percentage, or a ranked recommendation.
- Label every result as an author mapping. Distinguish capability-level evidence from problem-level evidence.
- A gap means "no direct work in this corpus", never "this method does not work".
- Do not present candidate methods as measured effects. They are design hypotheses with a test.
- Exclude P0 records under adjudication from evidence lists. A candidate must not rest on an unsigned row.

Problem-level evidence needs its own coding pass. Until then, the navigator must not imply that a problem-capability pair has been validated.

## 8. Required pages and docs

- `/`: claim, three numbers, 580-glyph wall, ledger preview, entry points.
- `/explore/`: filters, fingerprint ledger, paper drawer.
- `/papers/`: searchable paper table with author, venue, DOI, level, pipeline, capability, and P0 filters.
- `/navigator/`: static problem navigator with problem, data, intervention, and confounding inputs.
- `/paper/{id}/`: static paper record with authors, venue, source links, coding, capability tags, related pattern, and BibTeX.
- `/deep/`: Hamming lattice, UMAP, 3D, PCA, UpSet, parallel coordinates. One level below the default.
- `/capabilities/`: 2x3 matrix, 37 capabilities, P0 details, exemplars, negative cases.
- `/audit/`: direction split, κ dot plot, A precision, scale-sweep, funnel.
- `/methods/`: codebook, derivation rules, reliability, P0 status, seeds and parameters.
- `/responsibility/`: hosting, exclusion, attribution, correction, takedown, no endorsement.
- `/newsletter/`: signup and archive.
- `/download/`: JSON, codebook, `SHA256SUMS`, license, citation.
- `/about/`: team, contact, citation, version, language statement.
- `/changelog/`: data-specific release history.
- `/cite/`: BibTeX, RIS, APA.

README sections:

- one-sentence description;
- live demo link;
- screenshot or GIF;
- what the data is and is not;
- quickstart for local development;
- data download and data dictionary, not an API;
- citation;
- license;
- contribution and feedback;
- newsletter.

## 9. Review gates

Every major page passes these gates before merge:

1. **Design**: `taste-skill` screenshot review. No template smell. Check at 320, 768, 1280, 1600.
2. **Visualization**: `scientific-visualization` audit. Denominators, uncertainty, table fallback, colorblind check.
3. **Accessibility**: WCAG 2.2 AA. Keyboard, focus, contrast, reduced motion, screen reader labels.
4. **Data**: schema and derivation validation. 580 IDs, bit strings, L and pipeline rules, pattern counts sum to 580.
5. **Copyright**: no abstract, no PDF, no figure copy, quote cap, locator present, source link next to each claim, responsibility page reachable.
6. **Bilingual**: `hreflang`, language switcher, no auto-redirect, Chinese layout.
7. **Performance**: initial JS under 180KB gzip, data under 500KB gzip on the landing page, LCP under 2.5s on 4G.
8. **Content**: `humanizer` pass, claim-evidence map, no causal uplift claim, maintainer voice.

## 10. Definition of done

A page is done when:

- it has a real data fragment, not a placeholder;
- every number has a denominator and a source;
- every chart has a table fallback;
- every interactive state is in the URL;
- every P0 row is marked and excluded from headline aggregates;
- both languages are complete for UI and methods;
- the page passes the eight review gates;
- the build works under the GitHub Pages base path;
- the data version and hash are visible in the footer.
