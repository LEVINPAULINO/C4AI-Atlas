#!/usr/bin/env python3
"""Precompute 2D/3D layouts for the 64 observed patterns.

Run with site/.venv/bin/python because numpy, scikit-learn, and umap-learn are
needed at build time only. The output is a small JSON file consumed by the static
site.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import sklearn
import umap
from sklearn.manifold import trustworthiness

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "site/public/atlas/v1/atlas.json"
OUT = ROOT / "site/public/atlas/v1/layouts.json"
BITS = 8


def main() -> None:
    atlas = json.loads(ATLAS.read_text())
    patterns = atlas["patterns"]
    X = np.array([[int(b) for b in p["bits"]] for p in patterns], dtype=float)

    # PCA: center only. Do not standardize bits; rare bits would be overweighted.
    centered = X - X.mean(axis=0, keepdims=True)
    u, s, vt = np.linalg.svd(centered, full_matrices=False)
    pca = centered @ vt[:3].T
    variance = (s ** 2) / (s ** 2).sum()

    reducer = umap.UMAP(
        n_neighbors=12,
        min_dist=0.15,
        n_components=2,
        metric="hamming",
        random_state=42,
        init="spectral",
    )
    umap_2d = reducer.fit_transform(X)
    trust = trustworthiness(X, umap_2d, n_neighbors=10, metric="hamming")

    out = {
        "seed": 42,
        "n_patterns": len(patterns),
        "library": {"umap": umap.__version__, "sklearn": sklearn.__version__},
        "pca": {
            "explained_variance": [round(float(v), 4) for v in variance[:3]],
            "coords": {
                p["bits"]: [round(float(x), 4) for x in pca[i, :3]]
                for i, p in enumerate(patterns)
            },
        },
        "umap": {
            "n_neighbors": 12,
            "min_dist": 0.15,
            "metric": "hamming",
            "trustworthiness": round(float(trust), 4),
            "coords": {
                p["bits"]: [round(float(x), 4) for x in umap_2d[i]]
                for i, p in enumerate(patterns)
            },
        },
    }
    OUT.write_text(json.dumps(out, indent=1) + "\n")
    print(json.dumps({
        "patterns": len(patterns),
        "pca_variance": out["pca"]["explained_variance"],
        "umap_trustworthiness": out["umap"]["trustworthiness"],
    }, indent=1))


if __name__ == "__main__":
    main()
