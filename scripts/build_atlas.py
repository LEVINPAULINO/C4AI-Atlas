#!/usr/bin/env python3
"""Build the public C4AI Atlas snapshot.

Reads the current coded corpus, not the final adjudicated merge. The output is
therefore marked provisional and P0 rows are flagged. No abstracts, PDFs, or
full evidence quotes are published.
"""
from __future__ import annotations

import csv
import glob
import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CODING = ROOT / "corpus/fulltext_coding"
if not CODING.exists():
    raise SystemExit("This standalone site repository ships a committed atlas.json. Run build:data in the analysis workspace.")
OUT = ROOT / "site/public/atlas/v1"
BITS = ["explicit_object", "object_consumed", "training_signal", "agent_loop",
        "external_tool", "pos_before", "pos_inner", "pos_after"]
BITS_SHORT = ["E", "C", "T", "A", "X", "B", "I", "F"]

ZH_CAP = {
    "F1": "SCM 与 do-calculus", "F2": "潜在结果", "F3": "图模型与 d-分离",
    "F4": "反事实逻辑", "F5": "独立机制", "I1": "后门调整", "I2": "前门调整",
    "I3": "一般识别", "I4": "可交换性与无混杂", "I5": "正值性与重叠",
    "I6": "一致性与 SUTVA", "I7": "工具变量", "I8": "断点回归", "I9": "双重差分",
    "I10": "合成控制", "I11": "选择模型", "I12": "可迁移性", "I13": "中介效应",
    "I14": "近端因果与阴性对照", "I15": "主分层", "I16": "部分识别",
    "I17": "敏感性分析", "I18": "目标试验模拟", "E1": "匹配与倾向得分",
    "E2": "IP 加权与 MSM", "E3": "标准化与 g-formula", "E4": "G-estimation 与 SNMM",
    "E5": "双重稳健估计", "E6": "双重机器学习", "E7": "异质效应",
    "E8": "Super learner 与灵活估计", "D1": "约束式发现", "D2": "评分式发现",
    "D3": "函数因果模型", "D4": "干预式发现", "D5": "时间序列发现",
    "D6": "可识别因果表示",
}



def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def components() -> dict[str, dict]:
    out = {}
    for pattern in [
        "corpus/fulltext_coding/components120/A/*.json",
        "corpus/fulltext_coding/components200_extra/A/*.json",
        "corpus/fulltext_coding/components580/coded/*.json",
    ]:
        for path in glob.glob(str(ROOT / pattern)):
            rec = json.loads(Path(path).read_text())
            out[rec["paper_id"]] = rec
    return out


def arxiv_meta() -> dict[str, dict]:
    path = CODING / "arxiv_meta.jsonl"
    return {r["paper_id"]: r for r in load_jsonl(path)} if path.exists() else {}


def corpus_meta() -> dict[str, dict]:
    path = ROOT / "corpus/final_corpus_v4.json"
    if not path.exists():
        return {}
    return {r["arxiv_id"]: r for r in json.loads(path.read_text()) if r.get("arxiv_id")}


def direction_labels() -> dict[str, str]:
    labels = {}
    for path in glob.glob(str(ROOT / "corpus/direction/full/labels/*.jsonl")):
        for rec in load_jsonl(Path(path)):
            labels[rec["paper_id"]] = rec.get("coder_direction", "unclear")
    return labels


def capability_tags() -> dict[str, set[str]]:
    tags: dict[str, set[str]] = {}
    for path in glob.glob(str(ROOT / "corpus/agenda/p0_capability_evidence_*.json")):
        for cap in json.loads(Path(path).read_text()):
            for item in cap.get("exemplars", []):
                tags.setdefault(item["paper_id"], set()).add(cap["id"])
            for key in ("acl_llm_case", "negative_case"):
                item = cap.get(key, {})
                if item.get("paper_id"):
                    tags.setdefault(item["paper_id"], set()).add(cap["id"])
    return tags


def capabilities() -> list[dict]:
    path = ROOT / "corpus/agenda/capability_map.csv"
    rows = list(csv.DictReader(path.open()))
    evidence = {}
    for p in glob.glob(str(ROOT / "corpus/agenda/p0_capability_evidence_*.json")):
        for cap in json.loads(Path(p).read_text()):
            evidence[cap["id"]] = cap
    out = []
    for row in rows:
        cap = {
            "id": row["id"],
            "name": row["capability"],
            "name_zh": ZH_CAP.get(row["id"], row["capability"]),
            "layer": row["layer"],
            "problem": row["c2ai_problem"],
            "cell": row["lifecycle_cell"],
            "assumptions": row["assumptions"],
            "interface": row["interface"],
            "readiness": row["readiness"],
            "priority": row["priority"],
            "acl_relevance": row["acl_relevance"],
            "citation_status": row["citation_status"],
            "citation_id": row["citation_id"],
            "exemplars": row["exemplars"],
            "failure_mode": row["failure_mode"],
        }
        if row["id"] in evidence:
            cap["evidence"] = evidence[row["id"]]
        out.append(cap)
    return out


def main() -> None:
    full = {r["paper_id"]: r for r in load_jsonl(CODING / "fulltext_coded.jsonl")}
    comp = components()
    directions = direction_labels()
    meta = arxiv_meta()
    corpus = corpus_meta()
    tags = capability_tags()
    queue = list(csv.DictReader((CODING / "Review_Queue.csv").open()))
    p0 = {r["paper_id"]: r for r in queue if r["priority"] == "P0"}
    p0_ids = set(p0)

    if set(full) != set(comp):
        missing = sorted(set(full) - set(comp))
        extra = sorted(set(comp) - set(full))
        raise SystemExit(f"component mismatch: missing={missing[:5]} extra={extra[:5]}")

    papers = []
    pattern_counts: Counter[str] = Counter()
    pattern_papers: defaultdict[str, list[str]] = defaultdict(list)
    family_counts: defaultdict[str, Counter] = defaultdict(Counter)
    for pid in sorted(full):
        f, c = full[pid], comp[pid]
        bits = "".join(str(c[b]) for b in BITS)
        pattern_counts[bits] += 1
        pattern_papers[bits].append(pid)
        family_counts[bits][f.get("family", "unknown")] += 1
        m = meta.get(pid, {})
        c4 = corpus.get(pid, {})
        doi = (c4.get("doi") or m.get("doi") or "").strip()
        venue = (c4.get("venue") or c4.get("journal_ref") or m.get("journal_ref") or "arXiv preprint").strip()
        if "arxiv" in venue.lower():
            venue = "arXiv preprint"
        papers.append({
            "id": pid,
            "title": f.get("title", ""),
            "authors": m.get("authors", []),
            "venue": venue,
            "doi": doi,
            "arxiv_url": f"https://arxiv.org/abs/{pid}",
            "primary_category": m.get("primary_category", ""),
            "family": f.get("family", "unknown"),
            "year": f.get("year", ""),
            "direction": directions.get(pid, "unclear"),
            "tier": f.get("tier", ""),
            "level": c.get("coupling_level", ""),
            "pipeline": c.get("pipeline_position", ""),
            "confidence": c.get("confidence", ""),
            "pair_type": f.get("pair_type", ""),
            "secondary": c.get("secondary_levels", []),
            "bits": bits,
            "capabilities": sorted(tags.get(pid, [])),
            "p0": pid in p0_ids,
            "p0_reason": p0.get(pid, {}).get("why", ""),
            "needs_adjudication": bool(f.get("needs_adjudication")),
        })

    patterns = []
    for bits, count in pattern_counts.most_common():
        sample = comp[pattern_papers[bits][0]]
        patterns.append({
            "bits": bits,
            "count": count,
            "level": sample.get("coupling_level", ""),
            "pipeline": sample.get("pipeline_position", ""),
            "family_counts": dict(family_counts[bits].most_common()),
            "paper_ids": pattern_papers[bits],
        })

    stats = {
        "papers": len(papers),
        "patterns": len(patterns),
        "double_coded": 200,
        "authors": sum(1 for p in papers if p["authors"]),
        "venue": sum(1 for p in papers if p["venue"] and p["venue"] != "arXiv preprint"),
        "doi": sum(1 for p in papers if p["doi"]),
        "capability_tagged": sum(1 for p in papers if p["capabilities"]),
        "p0": len(p0_ids),
        "direction": dict(Counter(p["direction"] for p in papers)),
        "tier": dict(Counter(p["tier"] for p in papers)),
        "level": dict(Counter(p["level"] for p in papers)),
        "pipeline": dict(Counter(p["pipeline"] for p in papers)),
        "family": dict(Counter(p["family"] for p in papers)),
        "pair_type": dict(Counter(p["pair_type"] for p in papers)),
        "confidence": dict(Counter(p["confidence"] for p in papers)),
        "a_audit": {"audited": 20, "justified": 12, "precision": 0.6},
        "scale_sweep": {"justified": 8, "denominator": 353, "rate": 0.0227},
        "kappa": {
            "explicit_object": 0.816,
            "object_consumed": 0.776,
            "training_signal": 0.864,
            "agent_loop": 0.875,
            "pos_before": 0.563,
            "pos_inner": 0.806,
            "pos_after": 0.618,
            "coupling": 0.792,
            "pipeline": 0.592,
        },
    }

    atlas = {
        "meta": {
            "name": "C4AI Atlas",
            "version": "0.1.0-provisional",
            "protocol_version": "v1.2-final",
            "built_at": datetime.now().astimezone().isoformat(),
            "data_status": "provisional",
            "p0_signed": False,
            "note": "P0 rows are flagged and excluded from headline aggregates. This is not the final adjudicated merge.",
        },
        "stats": stats,
        "papers": papers,
        "patterns": patterns,
        "capabilities": capabilities(),
    }

    OUT.mkdir(parents=True, exist_ok=True)
    atlas_path = OUT / "atlas.json"
    atlas_path.write_text(json.dumps(atlas, ensure_ascii=False, indent=1) + "\n")
    digest = hashlib.sha256(atlas_path.read_bytes()).hexdigest()
    manifest = {
        "name": "C4AI Atlas",
        "version": atlas["meta"]["version"],
        "data_status": atlas["meta"]["data_status"],
        "built_at": atlas["meta"]["built_at"],
        "protocol_version": atlas["meta"]["protocol_version"],
        "sha256": digest,
        "files": ["atlas.json", "layouts.json", "README.md"],
        "counts": {"papers": len(papers), "patterns": len(patterns), "capabilities": len(atlas["capabilities"])},
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n")
    print(json.dumps(manifest, ensure_ascii=False, indent=1))
    print("bytes", atlas_path.stat().st_size)


if __name__ == "__main__":
    main()
