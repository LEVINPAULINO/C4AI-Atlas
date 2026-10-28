import { useEffect, useMemo, useState } from 'react';
import { atlas } from '../lib/atlas';
import { withBase } from '../lib/urls';
import { bitLegend, describeBits } from '../lib/bits';
import { t, type Lang } from '../lib/i18n';
import type { Paper } from '../lib/types';

const LEVEL_ORDER = { L4: 0, L3: 1, L2: 2, L1: 3, L0: 4 } as Record<string, number>;

function Fingerprint({ bits, small = false }: { bits: string; small?: boolean }) {
  return (
    <span className={small ? 'fp fp--small' : 'fp'} aria-label={`bits ${bits}`}>
      {bits.split('').map((b, i) => (
        <i key={i} data-on={b} data-pos={i} />
      ))}
    </span>
  );
}

function PaperRow({ paper }: { paper: Paper }) {
  return (
    <li className="paper-row">
      <span className="mono paper-row__id">{paper.id}</span>
      <span className="paper-row__title">
        <a href={withBase(`/paper/${paper.id}/`)}>{paper.title}</a>
        <a className="paper-row__ext" href={paper.arxiv_url} target="_blank" rel="noreferrer">arXiv ↗</a>
      </span>
      <span className="mono paper-row__meta">{paper.family} · {paper.year} · {paper.tier}</span>
      {paper.p0 && <span className="p0">P0</span>}
    </li>
  );
}

export default function Ledger({ lang }: { lang: Lang }) {
  const c = t(lang);
  const ui = c.ledgerUi;
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('all');
  const [level, setLevel] = useState('all');
  const [pipeline, setPipeline] = useState('all');
  const [p0Only, setP0Only] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const paperMap = useMemo(() => new Map(atlas.papers.map((p) => [p.id, p])), []);
  const families = useMemo(() => Object.keys(atlas.stats.family).sort(), []);
  const levels = ['L4', 'L3', 'L2', 'L1', 'L0'];
  const pipelines = ['before', 'inner', 'after', 'mixed', 'na'];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') ?? '');
    setFamily(params.get('family') ?? 'all');
    setLevel(params.get('level') ?? 'all');
    setPipeline(params.get('pipeline') ?? 'all');
    setP0Only(params.get('p0') === '1');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (family !== 'all') params.set('family', family);
    if (level !== 'all') params.set('level', level);
    if (pipeline !== 'all') params.set('pipeline', pipeline);
    if (p0Only) params.set('p0', '1');
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState(null, '', next);
  }, [query, family, level, pipeline, p0Only]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return atlas.patterns
      .filter((p) => {
        if (family !== 'all' && !p.family_counts[family]) return false;
        if (level !== 'all' && p.level !== level) return false;
        if (pipeline !== 'all' && p.pipeline !== pipeline) return false;
        if (p0Only && !p.paper_ids.some((id) => paperMap.get(id)?.p0)) return false;
        if (!q) return true;
        if (p.bits.includes(q)) return true;
        if (p.level.toLowerCase().includes(q) || p.pipeline.includes(q)) return true;
        if (Object.keys(p.family_counts).some((f) => f.toLowerCase().includes(q))) return true;
        return p.paper_ids.some((id) => paperMap.get(id)?.title.toLowerCase().includes(q));
      })
      .sort((a, b) => (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9) || b.count - a.count);
  }, [query, family, level, pipeline, p0Only, paperMap]);

  const total = filtered.reduce((n, p) => n + p.count, 0);
  const max = Math.max(...atlas.patterns.map((p) => p.count), 1);
  const reset = () => { setQuery(''); setFamily('all'); setLevel('all'); setPipeline('all'); setP0Only(false); };

  return (
    <div className="ledger">
      <div className="ledger__controls">
        <label className="field field--search">
          <span className="eyebrow">{ui.search}</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ui.search} />
        </label>
        <label className="field">
          <span className="eyebrow">{ui.family}</span>
          <select value={family} onChange={(e) => setFamily(e.target.value)}>
            <option value="all">{ui.all}</option>
            {families.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="eyebrow">{ui.level}</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">{ui.all}</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="eyebrow">{ui.pipeline}</span>
          <select value={pipeline} onChange={(e) => setPipeline(e.target.value)}>
            <option value="all">{ui.all}</option>
            {pipelines.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={p0Only} onChange={(e) => setP0Only(e.target.checked)} />
          <span>{ui.p0}</span>
        </label>
        <button className="reset" type="button" onClick={reset}>{ui.reset}</button>
      </div>

      <p className="bit-legend">{bitLegend(lang)}</p>

      <div className="ledger__summary mono">
        {ui.showing} {filtered.length} {ui.patterns} · {total} {ui.papers}
      </div>

      <div className="ledger__table" role="table" aria-label="Pattern ledger">
        <div className="ledger__header" role="row">
          <span role="columnheader">{ui.pattern}</span>
          <span role="columnheader">{ui.count}</span>
          <span role="columnheader">{ui.levelCol}</span>
          <span role="columnheader">{ui.pipelineCol}</span>
          <span role="columnheader">{ui.families}</span>
        </div>
        {filtered.map((p) => {
          const p0Count = p.paper_ids.filter((id) => paperMap.get(id)?.p0).length;
          return (
            <div className="pattern" key={p.bits}>
              <button
                className="pattern__row"
                type="button"
                onClick={() => setOpen(open === p.bits ? null : p.bits)}
                aria-expanded={open === p.bits}
              >
                <span className="pattern__bits"><Fingerprint bits={p.bits} /><span className="pattern__text"><span className="mono">{p.bits}</span><span className="pattern__meaning">{describeBits(p.bits, lang)}</span></span></span>
                <span className="pattern__count mono">{p.count}</span>
                <span className="mono">{p.level}</span>
                <span className="mono">{p.pipeline}</span>
                <span className="pattern__fam mono">
                  {Object.entries(p.family_counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([f, n]) => `${f} ${n}`).join(' · ')}
                </span>
                <span className="pattern__bar" aria-hidden="true"><i style={{ width: `${(p.count / max) * 100}%` }} /></span>
                {p0Count > 0 && <span className="p0">{p0Count} P0</span>}
              </button>
              {open === p.bits && (
                <div className="pattern__papers">
                  <p className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                    {p.bits} · {p.count} {ui.papers} · {p.level} · {p.pipeline}
                  </p>
                  <ul>
                    {p.paper_ids.map((id) => {
                      const paper = paperMap.get(id);
                      return paper ? <PaperRow key={id} paper={paper} /> : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="ledger__empty">{ui.empty}</p>}
      </div>
    </div>
  );
}
