# C4AI Atlas public data v0.1

Files:

- `atlas.json`: snapshot of 580 papers, 64 patterns, 37 capabilities.
- `manifest.json`: version, counts, build time, SHA-256.
- `layouts.json`: precomputed PCA and UMAP coordinates for the 64 patterns.
- `navigator.json`: pilot rules and capability-level exemplars for `/navigator/`. Derived from `atlas.json`; not included in the manifest hash.

There is no API. Read the files directly.

## `navigator.json`

Pilot file for the static problem navigator. It carries author mappings, not problem-level evidence.

| Field | Type | Meaning |
|---|---|---|
| `meta` | object | version, status, and evidence note |
| `problems` | array | seven problem families with English and Chinese names |
| `attributes` | object | data type, intervention, and confounding options |
| `capabilities` | object | 15 P0 capabilities with assumptions, failure modes, and up to three capability-level papers |
| `rules` | array | 14 author rules; each has a `when` object and candidate capabilities |

A `when` key lists only the values that match. A missing key means no restriction. P0 records under adjudication are excluded from `capabilities[].papers`.

## `atlas.json`

### `meta`

| Field | Type | Meaning |
|---|---|---|
| `name` | string | C4AI Atlas |
| `version` | string | data version |
| `protocol_version` | string | coding protocol |
| `built_at` | ISO string | build time |
| `data_status` | string | `provisional` until P0 closes |
| `p0_signed` | boolean | whether the 10 P0 rows are signed |

### `stats`

Counts and audit values. `p0` is the number of unsigned P0 rows. `authors`, `venue`, `doi`, and `capability_tagged` are metadata coverage counts. `a_audit` is 12 justified out of 20 audited. `scale_sweep` is 8 out of 353 A+B papers. `kappa` is the reliability estimate per field.

### `papers[]`

| Field | Type | Meaning |
|---|---|---|
| `id` | string | arXiv ID or record ID |
| `title` | string | paper title |
| `authors` | array | author list from arXiv |
| `venue` | string | venue or `arXiv preprint` |
| `doi` | string | DOI when available |
| `arxiv_url` | string | arXiv abstract URL |
| `primary_category` | string | arXiv primary category |
| `family` | string | corpus family |
| `year` | string | publication year |
| `direction` | string | `ai_for_cd`, `cd_for_ai`, `both`, `unclear` |
| `tier` | string | A/B/C/D/NA |
| `level` | string | L0-L4, derived from bits |
| `pipeline` | string | before/inner/after/mixed/na, derived from bits |
| `confidence` | string | coder confidence |
| `pair_type` | string | ablation/matched-separate/scale-sweep/none |
| `secondary` | array | secondary levels |
| `bits` | string | 8 bits, order `E C T A X B I F` |
| `capabilities` | array | P0 capability tags, from the evidence table |
| `p0` | boolean | unsigned P0 row |
| `p0_reason` | string | why it is P0 |
| `needs_adjudication` | boolean | old adjudication flag |

### `patterns[]`

| Field | Type | Meaning |
|---|---|---|
| `bits` | string | 8-bit combination |
| `count` | number | papers with this combination |
| `level` | string | L level |
| `pipeline` | string | pipeline position |
| `family_counts` | object | papers by family |
| `paper_ids` | array | papers with this combination |

### `capabilities[]`

| Field | Type | Meaning |
|---|---|---|
| `id` | string | F1, I1, E1, D1, etc. |
| `name` | string | capability name |
| `name_zh` | string | Chinese capability name |
| `layer` | string | framework/identify/estimate/discover |
| `problem` | string | C4AI problem |
| `cell` | string | lifecycle cell |
| `assumptions` | string | identification assumptions |
| `interface` | string | data/model/inference interface |
| `readiness` | string | R1-R5 |
| `priority` | string | P0/P1/P2 |
| `citation_status` | string | verified/textbook/partial/author-year |
| `citation_id` | string | DOI or OpenAlex ID |
| `exemplars` | string | short citation list |
| `failure_mode` | string | main failure mode |
| `evidence` | object | P0 evidence, when available |

The P0 evidence object has `exemplars`, `acl_llm_case`, `negative_case`, `when_not_to_use`, and optional `notes`. It is present for the 15 P0 capabilities.

## Bit order

```text
E explicit_object
C object_consumed
T training_signal
A agent_loop
X external_tool
B pos_before
I pos_inner
F pos_after
```

L and pipeline are rules over these bits, not independent ratings.

## Copyright

This file describes metadata, coding labels, and derived counts. It does not include paper text, abstracts, PDFs, or publisher figures. Quoted text remains with the authors and publishers. See the repository `RESPONSIBILITY.md`.

## License

Coding labels and this data dictionary: CC BY 4.0. Metadata: CC0 where sourced from OpenAlex, Crossref, or arXiv. Code: MIT.
