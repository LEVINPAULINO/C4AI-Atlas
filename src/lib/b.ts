import bJson from '../../public/atlas/v1/b/b.json';
import familyHubsJson from '../../public/atlas/v1/b/b_problems.json';

export type ProblemStatus = 'connected' | 'thin' | 'no_in_family_edges';

export interface Problem {
  key: string;
  name_en: string;
  name_zh: string;
  short: string;
  n_method: number;
  n_labelled: number;
  n_edges: number;
  n_origins: number;
  status: ProblemStatus;
  top_hub: {
    paper_id: string;
    title: string;
    year: number;
    family_indegree: number;
  } | null;
}

export interface BPaper {
  id: string;
  title: string;
  year: number;
  family: string;
  tier: string;
  genre: string;
  method: boolean;
  primary_problem: string;
  problems: string[];
  internal_indegree: number;
  downstream_count: number;
  hub_class: string;
  hub_rank: number;
  origin_status: string;
  first_cited_year: number | null;
  lineage_roles: string[];
  global_cited_by: number;
}

export interface BOrigin {
  problem: string;
  rank: number;
  id: string;
  title: string;
  year: number;
  family: string;
  tier: string;
  first_year_in_corpus: number;
  first_cited_year_in_corpus: number;
  years_after_first: number;
  internal_indegree: number;
  downstream_count: number;
  global_cited_by: number;
  status: string;
  scope: string;
}

export interface FamilyHub {
  rank: number;
  id: string;
  title: string;
  year: number;
  family: string;
  tier: string;
  method: boolean;
  family_indegree: number;
  overall_indegree: number;
  downstream_count: number;
  global_cited_by: number;
}

export interface LineageCase {
  label_en: string;
  label_zh: string;
  nodes_with_label: number;
  method_nodes: number;
  case_edges: number;
  paths: number;
  limits: string;
  hubs: Array<{
    paper_id: string;
    title: string;
    year: string;
    family_indegree: number;
    overall_indegree: number;
    tier: string;
    is_method: boolean;
  }>;
  origins: Array<{
    paper_id: string;
    title: string;
    year: string;
    downstream_count: number;
    origin_status: string;
  }>;
}

interface BData {
  meta: {
    version: string;
    schema_version: string;
    atlas_version: string;
    generated_at: string;
    source: string;
    claim: string;
  };
  problems: Problem[];
  papers: BPaper[];
  hubs: Array<Record<string, unknown>>;
  origins: BOrigin[];
  lineage: {
    cases: Record<string, LineageCase>;
    notes: Record<string, Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
  };
  coverage: {
    version: string;
    papers: number;
    any_source_with_refs: number;
    edges: number;
    citing_papers: number;
    cited_papers: number;
    year_anomalies: number;
    same_family_edges: number;
    cross_family_edges: number;
    [key: string]: number | string;
  };
}

export const b = bJson as unknown as BData;
export const familyHubs = familyHubsJson.problems as Record<string, FamilyHub[]>;
export const bVersion = b.meta.version;
export const coverage = b.coverage;

export const problemsBySize = [...b.problems].sort(
  (a, z) => z.n_method - a.n_method || a.name_en.localeCompare(z.name_en),
);

export function problemByKey(key: string): Problem | undefined {
  return b.problems.find((p) => p.key === key);
}

export function hubsForProblem(key: string): FamilyHub[] {
  return familyHubs[key] ?? [];
}

export function originsForProblem(key: string): BOrigin[] {
  return b.origins
    .filter((o) => o.problem === key)
    .sort((a, z) => a.year - z.year || z.downstream_count - a.downstream_count || a.rank - z.rank);
}

export function papersForProblem(key: string, scope: 'method' | 'all'): BPaper[] {
  return b.papers.filter((p) =>
    scope === 'method' ? p.method && p.primary_problem === key : p.problems.includes(key),
  );
}

export function lineageForProblem(key: string): LineageCase | undefined {
  return b.lineage.cases[key];
}

export function paperById(id: string): BPaper | undefined {
  return b.papers.find((p) => p.id === id);
}
