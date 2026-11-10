# B layer data

Version `b1.0.0`. One file, `b.json`, with 580 papers, 8 problem families, 580 hub rows, 31 origins, and 3 lineage cases.

Every `internal_indegree` is a count inside the 580-paper corpus. It is not an OpenAlex citation count. `global_cited_by` is context only and is never used to order hubs.

Coverage: 554 / 580 papers have a reference list in OpenAlex or Semantic Scholar. A zero means no recorded internal citation, not that nobody cites the paper.

`manifest.json` pins the SHA-256 of `b.json`.

## Derived file

`b_problems.json` holds the per-problem family hub rows (222 rows, 7 keys). `counterfactual_evaluation` has no key because it has no in-family edges. Its SHA-256 and row count are in `manifest.json` under `derived_files`.
