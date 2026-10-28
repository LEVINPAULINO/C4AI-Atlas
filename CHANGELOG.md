# Changelog

All data releases use semantic versioning. The first frozen release gets a Zenodo DOI.

## v0.1.0-provisional, 2026-10-28

### Added

- 580-paper public coding snapshot.
- 64 observed 8-bit patterns.
- 37 capability rows with 15 P0 evidence tables.
- Fingerprint Ledger, Hamming lattice, UMAP projection, 3D orbital, PCA, UpSet, and parallel coordinates.
- Searchable paper table and 580 static paper records in both languages.
- Authors from arXiv; venue and DOI where available.
- 69 papers with P0 capability tags and a capability filter.
- Per-record BibTeX block and copy button.
- English and Simplified Chinese routes.
- Static problem navigator with 7 problem families, 15 P0 capabilities, and 14 author rules.
- Responsibility, methods, audit, download, newsletter, and about pages.
- GitHub Pages deployment workflow.

### Changed

- Day theme moved from warm paper to Survey Blueprint.
- Night theme uses Signal Room tokens.
- No custom domain in v1.
- No API. Public data is versioned static JSON.

### Known

- 10 P0 rows are unsigned. They are marked and excluded from headline aggregates.
- A precision and scale-sweep counts are provisional.
- Newsletter provider and Zenodo DOI are not configured yet.
- Contact email and repository URL are live.
- Full evidence quotations are not in the public snapshot.
- Problem-level evidence is not coded; navigator results use capability-level exemplars and author rules.
