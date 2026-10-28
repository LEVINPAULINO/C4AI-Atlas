#!/usr/bin/env python3
"""Build the static problem-navigator dataset from the current atlas.

The rules are author mappings. Evidence is attached at the capability level;
problem-level evidence needs a separate coding pass.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "site/public/atlas/v1/atlas.json"
OUT = ROOT / "site/public/atlas/v1/navigator.json"

PROBLEMS = [
    {
        "id": "observational_confounding",
        "name_en": "Observational confounding",
        "name_zh": "观测数据中的混杂",
        "desc_en": "Treatment and outcome are observed without randomization. Measured or unmeasured confounding can bias the estimate.",
        "desc_zh": "处理变量和结局来自观测数据，缺少随机化。已测或未测混杂都会影响估计。",
    },
    {
        "id": "distribution_shift",
        "name_en": "Distribution shift and OOD",
        "name_zh": "分布偏移与 OOD",
        "desc_en": "The test distribution differs from training. The question is which relations stay stable and which mechanisms change.",
        "desc_zh": "测试分布与训练分布不同。需要判断哪些关系保持稳定，哪些机制发生变化。",
    },
    {
        "id": "counterfactual_evaluation",
        "name_en": "Counterfactual evaluation",
        "name_zh": "反事实评估",
        "desc_en": "The decision needs an estimate of what would happen under an alternative action, prompt, model, or policy.",
        "desc_zh": "决策需要估计另一个动作、提示、模型或策略下会发生什么。",
    },
    {
        "id": "agent_intervention",
        "name_en": "Agent intervention and exploration",
        "name_zh": "Agent 干预与探索",
        "desc_en": "An agent can act, query, or intervene. The task is to decide what to try and how to update its model.",
        "desc_zh": "Agent 可以行动、查询或干预。任务是决定试什么，以及如何更新模型。",
    },
    {
        "id": "causal_structure",
        "name_en": "Causal structure discovery",
        "name_zh": "因果结构发现",
        "desc_en": "The graph is unknown. The task is to recover edges, orientations, or an equivalence class from data and constraints.",
        "desc_zh": "因果图未知。任务是从数据和约束中恢复边、方向或等价类。",
    },
    {
        "id": "time_series",
        "name_en": "Time-series causal analysis",
        "name_zh": "时间序列因果分析",
        "desc_en": "Observations are ordered in time. The task involves lagged effects, nonstationarity, and changing mechanisms.",
        "desc_zh": "观测按时间排列。任务涉及滞后效应、非平稳性和机制变化。",
    },
    {
        "id": "llm_causal_reasoning",
        "name_en": "LLM causal reasoning",
        "name_zh": "LLM 因果推理",
        "desc_en": "The model reads text or dialogue and must answer causal questions, use background knowledge, or audit a causal claim.",
        "desc_zh": "模型读取文本或对话，回答因果问题、使用背景知识，或核查一条因果主张。",
    },
]

ATTRIBUTES = {
    "data": {
        "label_en": "Data type",
        "label_zh": "数据类型",
        "values": [
            ["any", "Any", "任意"],
            ["text", "Text", "文本"],
            ["tabular", "Tabular", "表格"],
            ["time_series", "Time series", "时间序列"],
            ["agent_logs", "Agent logs", "Agent 日志"],
        ],
    },
    "intervention": {
        "label_en": "Intervention",
        "label_zh": "干预条件",
        "values": [
            ["any", "Any", "任意"],
            ["none", "No intervention", "无干预"],
            ["available", "Intervention data available", "有干预数据"],
            ["can_run", "Can run experiments", "可做实验"],
        ],
    },
    "confounding": {
        "label_en": "Confounding",
        "label_zh": "混杂状态",
        "values": [
            ["any", "Any", "任意"],
            ["measured", "Measured", "已测"],
            ["unmeasured", "Unmeasured", "未测"],
            ["unknown", "Unknown", "未知"],
        ],
    },
}

# Each candidate is an author mapping. "adjacent" means the capability has
# P0 evidence at the capability level. "theoretical" means no problem-level
# corpus evidence was attached in this pilot.

ZH_ASSUMPTIONS = {
    "F5": "机制在环境间保持独立且稳定；有足够的环境或干预来估计不变性。",
    "I1": "不存在未测混杂；正值性成立；调整集来自正确因果图。",
    "I6": "处理版本一致；个体之间无干扰，或干扰可建模。",
    "I12": "有选择图；源域和目标域的机制可迁移。",
    "I13": "无中介与结局的混杂；跨世界假设成立。",
    "I17": "敏感性模型可解释；未测混杂的范围可以设定。",
    "E1": "无未测混杂；正值性；倾向模型正确。",
    "E5": "处理模型或结局模型之一正确；正值性成立。",
    "E6": "Neyman 正交；交叉拟合；重叠足够。",
    "E7": "无未测混杂；重叠足够；每个子组有足够样本。",
    "D1": "马尔可夫与忠实性；PC 需要因果充分性，FCI 允许潜混杂。",
    "D2": "分数等价；无环约束；样本量足够。",
    "D4": "目标可干预；忠实性；干预预算有限。",
    "D5": "平稳性或可建模的非平稳；因果充分性；滞后阶正确。",
    "D6": "可识别性条件；辅助变量或干预；模型容量足够。",
}
ZH_FAILURE = {
    "F5": "机制发生变化或环境标签错误时，不变性约束会失效。",
    "I1": "调整集错误、未测混杂或重叠不足时，后门估计有偏。",
    "I6": "提示版本不同或 Agent 之间互相影响时，处理定义失效。",
    "I12": "选择图错误或目标域缺少支持时，迁移公式失效。",
    "I13": "中介与结局存在混杂或跨世界假设不成立时，效应分解失效。",
    "I17": "敏感性参数难以解释或范围过宽时，结论仍然脆弱。",
    "E1": "倾向模型错误或重叠不足时，匹配样本有偏。",
    "E5": "nuisance 模型误差或有限样本不稳定时，双重稳健性下降。",
    "E6": "重叠不足、nuisance 维度过高或样本小时，估计不稳定。",
    "E7": "CATE 不稳定或子组样本稀疏时，异质效应难以复核。",
    "D1": "CI 检验错误、忠实性违背或样本不足时，图结构错误。",
    "D2": "局部最优、规模化困难或无环惩罚敏感时，结构不稳定。",
    "D4": "干预昂贵或目标有限时，主动发现无法覆盖关键边。",
    "D5": "Granger 关系表示预测关系；非平稳会破坏滞后检验。",
    "D6": "可识别性假设强、评测困难或规模扩大时，表示不稳定。",
}

# Chinese copy for the rule-level guidance. Keyed by "rule id:capability id".
ZH_RULE_TEXT = {
    "obs-i1:I1": (
        "用显式因果图和调整集控制已测混杂。",
        "留出一个负对照结局，检查调整后的估计是否稳定。",
    ),
    "obs-i1:E1": (
        "在已测协变量上对处理组和对照组做匹配或加权。",
        "在留出集上检查匹配前后的协变量平衡。",
    ),
    "obs-i1:E5": (
        "同时建模结局和处理，允许其中一个模型设定错误。",
        "在留出集上比较 AIPW 或 TMLE 与 IPW、g-computation。",
    ),
    "obs-i1:E6": (
        "nuisance 模型维度高时，使用正交矩和交叉拟合。",
        "加入一个安慰剂处理，检查估计效应是否消失。",
    ),
    "obs-i17:I17": (
        "估计未测混杂需要多强才会改变结论。",
        "在点估计旁报告 E 值或 Rosenbaum 边界。",
    ),
    "obs-i17:I1": (
        "未测部分可以被界定或代理时，后门调整仍然可用。",
        "比较加入代理变量前后的调整估计。",
    ),
    "shift-f5:F5": (
        "建模跨环境稳定的机制，对随环境变化的关系施加惩罚。",
        "在留一域划分上比较 ERM 与不变性惩罚。",
    ),
    "shift-f5:I12": (
        "迁移前用选择图说明源人群和目标人群。",
        "做留一站点检验，比较迁移公式与合并训练。",
    ),
    "shift-f5:D6": (
        "学习一种表示，使稳定因子可以与领域特有因子分开。",
        "在带留出域的合成 SCM 上恢复已知潜因子。",
    ),
    "shift-e7:E7": (
        "估计效应在群体或领域间是否有差异，而不是只报告一个合并数字。",
        "检查 CATE 在留出域上的稳定性，并报告子组重叠。",
    ),
    "cf-i13:I13": (
        "干预通过中间变量起作用时，区分直接路径和中介路径。",
        "改变中介模型，检查 NDE/NIE 的符号是否稳定。",
    ),
    "cf-i13:E7": (
        "为接受替代动作的子群体估计异质效应。",
        "在留出的随机子集上校准 CATE 预测。",
    ),
    "cf-i13:D6": (
        "表示回答反事实查询所需的潜因子。",
        "在反事实已知的合成 SCM 上测量恢复误差。",
    ),
    "cf-i17:I17": (
        "报告反事实结论对隐藏混杂的敏感程度。",
        "在一组敏感性参数下重复结论。",
    ),
    "agent-d4:D4": (
        "选择能区分候选因果结构的干预或查询。",
        "在沙盒里随机开关工具权限，比较有无工具时的任务成功率。",
    ),
    "agent-d4:I6": (
        "把 Agent 动作当作处理之前，先定义处理版本和干扰。",
        "用两个版本运行同一提示，检验结局是否变化。",
    ),
    "agent-d4:E7": (
        "估计效应在 Agent 状态或用户群体间的差异。",
        "留出部分状态，检查策略是否改善目标子组。",
    ),
    "agent-f5:F5": (
        "把环境建模为稳定机制，检验 Agent 能否跨分布偏移迁移。",
        "在原始环境和机制偏移环境上比较 Agent 表现。",
    ),
    "struct-d1:D1": (
        "用条件独立检验和边定向恢复因果图或等价类。",
        "在已知 DAG 上运行 PC/FCI，报告 SHD 和定向精度。",
    ),
    "struct-d1:D2": (
        "在图结构上优化评分或可微无环约束。",
        "在相同样本量下，把 GES/NOTEARS 与已知 DAG 比较。",
    ),
    "struct-d1:D4": (
        "干预数据可以定向观测数据无法区分的边。",
        "加入一次干预，测量有多少边变得可识别。",
    ),
    "struct-d5:D5": (
        "对按时间排列的数据使用滞后条件独立或 Granger 类检验。",
        "在已知滞后 SCM 上评估，报告错误边比例。",
    ),
    "time-d5:D5": (
        "检验因果关联之前，先建模滞后阶数和非平稳性。",
        "在合成序列上比较有、无机制突变的 PCMCI。",
    ),
    "time-d5:I12": (
        "把一个时期或站点学到的关系迁移到另一个时期或站点。",
        "留出最后一个时期，在它上面检验迁移。",
    ),
    "time-d5:I17": (
        "检查隐藏混杂会在多大程度上改变时间序列结论。",
        "在若干候选滞后阶数下报告敏感性边界。",
    ),
    "time-d6:D6": (
        "学习带时间结构和可识别因子的潜因果表示。",
        "在合成时序 SCM 上恢复已知潜因子。",
    ),
    "llm-i1:I1": (
        "让 LLM 根据文本回答因果问题之前，先写明调整集。",
        "比较给出和不给出显式调整集时的回答。",
    ),
    "llm-i1:I12": (
        "检查因果回答能否跨语料、领域或提示版本迁移。",
        "留出一个语料，测试同一个因果问题。",
    ),
    "llm-i1:D1": (
        "把文本导出的条件独立证据作为约束式搜索的输入。",
        "比较有、无 LLM 条件独立证据时的图。",
    ),
    "llm-i1:D2": (
        "对文本和数据生成的候选图打分。",
        "用已知 DAG 测量图评分。",
    ),
    "llm-d4:D4": (
        "基准允许时，让模型选择下一次干预检验。",
        "相对随机干预策略测量 regret。",
    ),
}

RULES = [
    {
        "id": "obs-i1",
        "problem": "observational_confounding",
        "when": {"data": ["text", "tabular", "any"], "intervention": ["none", "available", "any"], "confounding": ["measured", "unknown", "any"]},
        "candidates": [
            {"capability": "I1", "status": "adjacent", "why": "Adjust for measured confounders with an explicit graph and adjustment set.", "minimal_test": "Hold out a negative-control outcome and check whether the adjusted estimate stays stable."},
            {"capability": "E1", "status": "adjacent", "why": "Match or weight treated and control units on observed covariates.", "minimal_test": "Check covariate balance before and after matching on a held-out split."},
            {"capability": "E5", "status": "adjacent", "why": "Combine an outcome model and a treatment model so that either one can be wrong.", "minimal_test": "Compare AIPW or TMLE with IPW and g-computation on a held-out split."},
            {"capability": "E6", "status": "adjacent", "why": "Use orthogonal moments and cross-fitting when nuisance models are high-dimensional.", "minimal_test": "Add a placebo treatment and verify that the estimated effect collapses."},
        ],
    },
    {
        "id": "obs-i17",
        "problem": "observational_confounding",
        "when": {"data": ["text", "tabular", "any"], "intervention": ["none", "any"], "confounding": ["unmeasured", "unknown", "any"]},
        "candidates": [
            {"capability": "I17", "status": "adjacent", "why": "Quantify how strong an unmeasured confounder would need to be to change the conclusion.", "minimal_test": "Report an E-value or Rosenbaum bound alongside the point estimate."},
            {"capability": "I1", "status": "theoretical", "why": "Backdoor adjustment is available when the unmeasured part can be bounded or proxied.", "minimal_test": "Compare the adjusted estimate with and without the proxy variable."},
        ],
    },
    {
        "id": "shift-f5",
        "problem": "distribution_shift",
        "when": {"data": ["any"], "intervention": ["any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "F5", "status": "adjacent", "why": "Model stable mechanisms across environments and penalize relations that vary.", "minimal_test": "Compare ERM and an invariance penalty on leave-one-domain-out splits."},
            {"capability": "I12", "status": "adjacent", "why": "State the source and target populations with a selection diagram before transferring.", "minimal_test": "Run leave-one-site-out and check whether the transport formula beats pooled training."},
            {"capability": "D6", "status": "adjacent", "why": "Learn a representation whose stable factors are separable from domain-specific ones.", "minimal_test": "Recover known latent factors on a synthetic SCM with a held-out domain."},
        ],
    },
    {
        "id": "shift-e7",
        "problem": "distribution_shift",
        "when": {"data": ["text", "tabular", "any"], "intervention": ["any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "E7", "status": "adjacent", "why": "Estimate whether the effect differs across groups or domains instead of reporting one pooled number.", "minimal_test": "Check CATE stability across held-out domains and report subgroup overlap."},
        ],
    },
    {
        "id": "cf-i13",
        "problem": "counterfactual_evaluation",
        "when": {"data": ["text", "tabular", "any"], "intervention": ["any"], "confounding": ["measured", "unknown", "any"]},
        "candidates": [
            {"capability": "I13", "status": "adjacent", "why": "Separate direct and mediated pathways when the intervention works through an intermediate variable.", "minimal_test": "Vary the mediator model and check whether the NDE/NIE sign remains stable."},
            {"capability": "E7", "status": "adjacent", "why": "Estimate heterogeneous effects for the subpopulation that receives the alternative action.", "minimal_test": "Calibrate CATE predictions against a held-out randomized subset."},
            {"capability": "D6", "status": "adjacent", "why": "Represent the latent factors needed to answer a counterfactual query.", "minimal_test": "Use a synthetic SCM with known counterfactuals and measure recovery error."},
        ],
    },
    {
        "id": "cf-i17",
        "problem": "counterfactual_evaluation",
        "when": {"data": ["text", "tabular", "any"], "intervention": ["none", "any"], "confounding": ["unmeasured", "unknown", "any"]},
        "candidates": [
            {"capability": "I17", "status": "adjacent", "why": "Report how fragile the counterfactual conclusion is to hidden confounding.", "minimal_test": "Repeat the conclusion under a range of sensitivity parameters."},
        ],
    },
    {
        "id": "agent-d4",
        "problem": "agent_intervention",
        "when": {"data": ["agent_logs", "any"], "intervention": ["available", "can_run", "any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "D4", "status": "adjacent", "why": "Choose interventions or queries that discriminate between candidate causal structures.", "minimal_test": "Randomize tool access in a sandbox and compare task success with and without the tool."},
            {"capability": "I6", "status": "adjacent", "why": "Define treatment versions and interference before treating an agent action as a treatment.", "minimal_test": "Run the same prompt under two versions and test whether the outcome changes."},
            {"capability": "E7", "status": "adjacent", "why": "Estimate effect heterogeneity across agent states or user groups.", "minimal_test": "Hold out states and check whether the policy improves the targeted subgroup."},
        ],
    },
    {
        "id": "agent-f5",
        "problem": "agent_intervention",
        "when": {"data": ["agent_logs", "any"], "intervention": ["any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "F5", "status": "adjacent", "why": "Model the environment as stable mechanisms and test whether the agent transfers across shifts.", "minimal_test": "Compare the agent on original and mechanism-shifted environments."},
        ],
    },
    {
        "id": "struct-d1",
        "problem": "causal_structure",
        "when": {"data": ["tabular", "time_series", "text", "any"], "intervention": ["any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "D1", "status": "adjacent", "why": "Use conditional-independence tests and edge orientation to recover a graph or equivalence class.", "minimal_test": "Run PC/FCI on a known DAG and report SHD and orientation precision."},
            {"capability": "D2", "status": "adjacent", "why": "Optimize a score or a differentiable acyclicity constraint over graph structures.", "minimal_test": "Compare GES/NOTEARS against a known DAG under equal sample sizes."},
            {"capability": "D4", "status": "theoretical", "why": "Interventional data can orient edges that observational data leaves equivalent.", "minimal_test": "Add one intervention and measure how many edges become identifiable."},
        ],
    },
    {
        "id": "struct-d5",
        "problem": "causal_structure",
        "when": {"data": ["time_series", "any"], "intervention": ["any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "D5", "status": "adjacent", "why": "Use lagged conditional independence or Granger-style tests for time-ordered data.", "minimal_test": "Evaluate on a known lagged SCM and report false-edge rate."},
        ],
    },
    {
        "id": "time-d5",
        "problem": "time_series",
        "when": {"data": ["time_series", "any"], "intervention": ["any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "D5", "status": "adjacent", "why": "Model lag order and nonstationarity before testing causal links.", "minimal_test": "Compare PCMCI with and without regime shifts in a synthetic series."},
            {"capability": "I12", "status": "adjacent", "why": "Transport a relationship learned in one period or site to another.", "minimal_test": "Leave out the final period and test transport on it."},
            {"capability": "I17", "status": "adjacent", "why": "Check how much hidden confounding would change the time-series conclusion.", "minimal_test": "Report sensitivity bounds across candidate lag orders."},
        ],
    },
    {
        "id": "time-d6",
        "problem": "time_series",
        "when": {"data": ["time_series", "any"], "intervention": ["any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "D6", "status": "adjacent", "why": "Learn a latent causal representation with temporal structure and identifiable factors.", "minimal_test": "Recover known latent factors from a synthetic temporal SCM."},
        ],
    },
    {
        "id": "llm-i1",
        "problem": "llm_causal_reasoning",
        "when": {"data": ["text", "any"], "intervention": ["any"], "confounding": ["measured", "unknown", "any"]},
        "candidates": [
            {"capability": "I1", "status": "adjacent", "why": "State the adjustment set before asking an LLM to answer a causal question from text.", "minimal_test": "Compare answers with and without the explicit adjustment set."},
            {"capability": "I12", "status": "adjacent", "why": "Check whether a causal answer transfers across corpora, domains, or prompt versions.", "minimal_test": "Hold out a corpus and test the same causal question."},
            {"capability": "D1", "status": "adjacent", "why": "Use text-derived conditional-independence evidence as input to a constraint-based search.", "minimal_test": "Compare the graph with and without LLM-derived CI evidence."},
            {"capability": "D2", "status": "adjacent", "why": "Score candidate graphs produced from text and data.", "minimal_test": "Measure graph score against a known DAG."},
        ],
    },
    {
        "id": "llm-d4",
        "problem": "llm_causal_reasoning",
        "when": {"data": ["text", "any"], "intervention": ["can_run", "any"], "confounding": ["any"]},
        "candidates": [
            {"capability": "D4", "status": "theoretical", "why": "Ask the model to choose the next interventional test when a benchmark allows it.", "minimal_test": "Measure regret against a random intervention policy."},
        ],
    },
]

def main() -> None:
    atlas = json.loads(ATLAS.read_text())
    caps = {c["id"]: c for c in atlas["capabilities"] if c["priority"] == "P0"}
    # P0 records are still under adjudication. Keep them out of navigator
    # evidence lists so a candidate never rests on an unsigned row.
    p0_ids = {paper["id"] for paper in atlas["papers"] if paper.get("p0")}
    papers_by_id = {paper["id"]: paper for paper in atlas["papers"]}
    out_caps = {}
    for cid, c in caps.items():
        ev = c.get("evidence") or {}
        paper_ids = []
        for item in ev.get("exemplars", []):
            if item.get("paper_id"):
                paper_ids.append(item["paper_id"])
        for key in ("acl_llm_case", "negative_case"):
            item = ev.get(key) or {}
            if item.get("paper_id"):
                paper_ids.append(item["paper_id"])
        paper_ids = [pid for pid in paper_ids if pid not in p0_ids]
        out_caps[cid] = {
            "id": cid,
            "name": c["name"],
            "name_zh": c["name_zh"],
            "readiness": c["readiness"],
            "assumptions_en": c["assumptions"],
            "assumptions_zh": ZH_ASSUMPTIONS.get(cid, c["assumptions"]),
            "failure_en": c["failure_mode"],
            "failure_zh": ZH_FAILURE.get(cid, c["failure_mode"]),
            "papers": [
                {"id": pid, "title": papers_by_id[pid]["title"]}
                for pid in dict.fromkeys(paper_ids)
                if pid in papers_by_id
            ],
        }
    # "any" is a wildcard, not a selectable rule value. Drop it so the UI
    # filters on specific attributes and an empty condition means "no restriction".
    for rule in RULES:
        rule["when"] = {
            key: [value for value in values if value != "any"]
            for key, values in rule.get("when", {}).items()
        }
        rule["when"] = {key: values for key, values in rule["when"].items() if values}

    for rule in RULES:
        for cand in rule["candidates"]:
            zh_text = ZH_RULE_TEXT.get(f"{rule['id']}:{cand['capability']}")
            if zh_text:
                cand["why_zh"], cand["minimal_test_zh"] = zh_text

    out = {
        "meta": {
            "version": "0.1.0-pilot",
            "status": "author mapping; capability-level evidence",
            "note": "Problem-level evidence has not been coded yet. Candidate methods are design hypotheses, not measured effects. P0 records under adjudication are excluded from evidence lists.",
        },
        "problems": PROBLEMS,
        "attributes": ATTRIBUTES,
        "capabilities": out_caps,
        "rules": RULES,
    }
    used = {cand["capability"] for rule in RULES for cand in rule["candidates"]}
    unknown = used - set(out_caps)
    if unknown:
        raise SystemExit(f"rules reference unknown capabilities: {sorted(unknown)}")
    unused = set(out_caps) - used
    if unused:
        raise SystemExit(f"P0 capabilities never appear in a rule: {sorted(unused)}")

    attribute_values = {
        key: {value for value, _, _ in spec["values"]} - {"any"}
        for key, spec in ATTRIBUTES.items()
    }
    for rule in RULES:
        for key, values in rule["when"].items():
            bad = set(values) - attribute_values[key]
            if bad:
                raise SystemExit(f"rule {rule['id']} has unknown {key} values: {sorted(bad)}")

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote {OUT} with {len(PROBLEMS)} problems, {len(out_caps)} capabilities, {len(RULES)} rules")


if __name__ == "__main__":
    main()
