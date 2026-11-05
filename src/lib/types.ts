export type Paper = {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  doi: string;
  arxiv_url: string;
  primary_category: string;
  family: string;
  year: string;
  direction: string;
  tier: string;
  level: string;
  pipeline: string;
  confidence: string;
  pair_type: string;
  genre: string;
  genres?: string[];
  secondary: string[];
  bits: string;
  capabilities: string[];
};

export type Pattern = {
  bits: string;
  count: number;
  level: string;
  pipeline: string;
  family_counts: Record<string, number>;
  paper_ids: string[];
};

export type EvidenceItem = {
  paper_id: string;
  title: string;
  family: string;
  year: string;
  tier: string;
  coupling_level: string;
  why: string;
  quote: string;
  locator: string;
  role?: string;
  notes?: string;
};

export type CapabilityEvidence = {
  id: string;
  exemplars: EvidenceItem[];
  acl_llm_case: EvidenceItem;
  negative_case: EvidenceItem;
  when_not_to_use: string;
  notes?: string;
};

export type Capability = {
  id: string;
  name: string;
  name_zh: string;
  layer: string;
  problem: string;
  cell: string;
  assumptions: string;
  interface: string;
  readiness: string;
  priority: string;
  acl_relevance: string;
  citation_status: string;
  citation_id: string;
  exemplars: string;
  failure_mode: string;
  evidence?: CapabilityEvidence;
};

export type Atlas = {
  meta: {
    name: string;
    version: string;
    protocol_version: string;
    built_at: string;
    data_status: string;
    p0_signed?: boolean;
    p0_signed_rows?: number;
    note: string;
  };
  stats: {
    papers: number;
    patterns: number;
    authors: number;
    venue: number;
    doi: number;
    capability_tagged: number;
    double_coded?: number;
    p0?: number;
    p0_signed_rows?: number;
    a_audit?: { audited: number; justified: number; precision: number; ci95?: number[] };
    kappa?: Record<string, number>;
    direction: Record<string, number>;
    tier: Record<string, number>;
    level: Record<string, number>;
    pipeline: Record<string, number>;
    family: Record<string, number>;
    pair_type: Record<string, number>;
    confidence: Record<string, number>;
    genre?: Record<string, number>;
    genre_multi?: number;
    scale_sweep: { justified: number; denominator: number; rate: number; ci95?: number[] };
  };
  papers: Paper[];
  patterns: Pattern[];
  capabilities: Capability[];
};
