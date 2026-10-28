# Contributing to C4AI Atlas

Thanks for checking the data. Most useful contributions are corrections, missing papers, and small documentation fixes.

## Three ways to contribute

### 1. Report a data error

Open the `Data error` issue form. Include:

- paper ID;
- field name;
- current value;
- proposed value;
- source and locator;
- why the current value is wrong.

You do not need a GitHub account for the feedback form linked in the site footer. A GitHub issue is faster to triage.

### 2. Suggest a paper

Open the `New paper` issue form. Include:

- title;
- authors;
- year;
- DOI or arXiv ID;
- family;
- why it meets the inclusion criteria;
- one sentence on the causal object, if any.

### 3. Submit code or documentation

1. Open an issue or comment on an existing one.
2. Fork the repository and create a branch.
3. Run `cd site && npm install && npm run build`.
4. Keep changes scoped to one concern.
5. Sign off your commit with the Developer Certificate of Origin:

```bash
git commit -s -m "fix: correct I12 evidence locator"
```

The `Signed-off-by` line certifies that you wrote the change or have the right to submit it. No CLA is required.

## Data rules

- Do not add PDFs, abstracts, publisher figures, or long quotations.
- One short quotation per paper, at most 25 words, with a locator.
- Do not change a coding label without evidence and a codebook reference.
- Do not silently change a release. Add a changelog entry.
- P0 rows stay marked until a human signs the adjudication worksheet.

## Code rules

- Astro + React islands. Do not add a chart library without a review.
- Use the design tokens in `site/src/styles/tokens.css`.
- Every chart needs a table fallback.
- Every page must build under the GitHub Pages subpath.
- Check keyboard navigation and `prefers-reduced-motion`.

## Review

A change is merged when it passes:

- data validation;
- build;
- copyright review;
- bilingual review;
- accessibility review;
- visual review with a screenshot.

Small fixes can skip the visual review. Data and label changes cannot.
