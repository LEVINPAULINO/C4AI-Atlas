import { useEffect, useMemo, useRef, useState } from 'react';
import { atlas } from '../lib/atlas';
import { withBase } from '../lib/urls';
import { t, type Lang } from '../lib/i18n';
import type { Paper } from '../lib/types';

const PAGE = 50;

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    const to = value;
    previous.current = to;
    if (from === to) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 420);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toLocaleString('en-US')}</>;
}
const pipeLabel = (x: string, lang: Lang) => lang === 'zh' ? ({ before: '数据', inner: '训练', after: '推理', mixed: '混合', na: '无' } as Record<string,string>)[x] ?? x : x;
const venueLabel = (x: string, lang: Lang) => lang === 'zh' && x === 'arXiv preprint' ? 'arXiv 预印本' : x;

function authors(p: Paper): string {
  if (!p.authors.length) return '—';
  return p.authors.slice(0, 3).join(', ') + (p.authors.length > 3 ? ' et al.' : '');
}

export default function PaperTable({ lang }: { lang: Lang }) {
  const c = t(lang);
  const ui = c.ledgerUi;
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('all');
  const [year, setYear] = useState('all');
  const [level, setLevel] = useState('all');
  const [pipeline, setPipeline] = useState('all');
  const [tier, setTier] = useState('all');
  const [capability, setCapability] = useState('all');
  const [p0Only, setP0Only] = useState(false);
  const [page, setPage] = useState(0);

  const families = useMemo(() => Object.keys(atlas.stats.family).sort(), []);
  const years = useMemo(() => [...new Set(atlas.papers.map((p) => p.year))].sort().reverse(), []);
  const capIds = useMemo(() => atlas.capabilities.map((c) => c.id).sort(), []);
  const capNames = useMemo(() => new Map(atlas.capabilities.map((c) => [c.id, lang === 'zh' ? c.name_zh : c.name])), [lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = atlas.papers.filter((p) => {
      if (family !== 'all' && p.family !== family) return false;
      if (year !== 'all' && p.year !== year) return false;
      if (level !== 'all' && p.level !== level) return false;
      if (pipeline !== 'all' && p.pipeline !== pipeline) return false;
      if (tier !== 'all' && p.tier !== tier) return false;
      if (capability !== 'all' && !p.capabilities.includes(capability)) return false;
      if (p0Only && !p.p0) return false;
      if (!q) return true;
      return p.id.toLowerCase().includes(q)
        || p.title.toLowerCase().includes(q)
        || p.authors.some((a) => a.toLowerCase().includes(q))
        || p.venue.toLowerCase().includes(q)
        || p.capabilities.some((x) => x.toLowerCase() === q);
    });
    return rows.sort((a, b) => (b.year || '').localeCompare(a.year || '') || a.title.localeCompare(b.title));
  }, [query, family, year, level, pipeline, tier, capability, p0Only]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE, current * PAGE + PAGE);

  const reset = () => {
    setQuery(''); setFamily('all'); setYear('all'); setLevel('all'); setPipeline('all');
    setTier('all'); setCapability('all'); setP0Only(false); setPage(0);
  };

  return (
    <div className="papers">
      <div className="papers__controls">
        <label className="field field--search">
          <span className="eyebrow">{lang === 'en' ? 'Search title, author, venue, ID' : '搜索标题、作者、期刊、编号'}</span>
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder={lang === 'en' ? 'Title, author, venue, arXiv ID' : '标题、作者、期刊、arXiv ID'} />
        </label>
        <label className="field"><span className="eyebrow">{lang === 'en' ? 'Family' : '论文分组'}</span>
          <select value={family} onChange={(e) => { setFamily(e.target.value); setPage(0); }}>
            <option value="all">{ui.all}</option>{families.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="field"><span className="eyebrow">{lang === 'en' ? 'Year' : '年份'}</span>
          <select value={year} onChange={(e) => { setYear(e.target.value); setPage(0); }}>
            <option value="all">{ui.all}</option>{years.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="field"><span className="eyebrow">{ui.level}</span>
          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(0); }}>
            <option value="all">{ui.all}</option>{['L4','L3','L2','L1','L0'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="field"><span className="eyebrow">{ui.pipeline}</span>
          <select value={pipeline} onChange={(e) => { setPipeline(e.target.value); setPage(0); }}>
            <option value="all">{ui.all}</option>{['before','inner','after','mixed','na'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="field"><span className="eyebrow">{lang === 'en' ? 'Tier' : '对照强度'}</span>
          <select value={tier} onChange={(e) => { setTier(e.target.value); setPage(0); }}>
            <option value="all">{ui.all}</option>{['A','B','C','D','NA'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="field"><span className="eyebrow">{lang === 'en' ? 'P0 capability' : 'P0 能力'}</span>
          <select value={capability} onChange={(e) => { setCapability(e.target.value); setPage(0); }}>
            <option value="all">{ui.all}</option>{capIds.map((x) => <option key={x} value={x}>{x} · {capNames.get(x)}</option>)}
          </select>
        </label>
        <label className="check"><input type="checkbox" checked={p0Only} onChange={(e) => { setP0Only(e.target.checked); setPage(0); }} /><span>{ui.p0}</span></label>
        <button className="reset" type="button" onClick={reset}>{ui.reset}</button>
      </div>

      <div className="papers__summary mono">
        <AnimatedNumber value={filtered.length} /> {lang === 'en' ? 'papers' : '篇论文'} · {lang === 'en' ? 'page' : '第'} {current + 1} / {pages}
      </div>

      <div className="papers__table" role="table" aria-label="Paper table">
        <div className="papers__head" role="row">
          <span>{lang === 'en' ? 'Paper' : '论文'}</span>
          <span>{lang === 'en' ? 'Venue / year' : '期刊 / 年份'}</span>
          <span>{ui.level}</span>
          <span>{lang === 'en' ? 'Pipeline' : '介入阶段'}</span>
          <span>{lang === 'en' ? 'Capabilities' : '能力'}</span>
        </div>
        {rows.map((p) => (
          <a className="paper-table__row" key={p.id} href={withBase(`/paper/${p.id}/`)}>
            <span className="paper-table__main">
              <span className="mono paper-table__id">{p.id}</span>
              <span className="paper-table__title">{p.title}</span>
              <span className="paper-table__authors">{authors(p)}</span>
            </span>
            <span className="paper-table__venue"><span>{venueLabel(p.venue, lang)}</span><span className="mono">{p.year}</span></span>
            <span className="mono">{p.level}{p.p0 ? <span className="p0"> · P0</span> : null}</span>
            <span className="mono">{pipeLabel(p.pipeline, lang)}</span>
            <span className="paper-table__caps">
              {p.capabilities.length ? p.capabilities.slice(0, 3).map((x) => <span className="cap-chip" key={x}>{x}</span>) : <span className="muted">—</span>}
            </span>
          </a>
        ))}
        {rows.length === 0 && <p className="ledger__empty">{lang === 'en' ? 'No paper matches these filters.' : '没有符合筛选条件的论文。'}</p>}
      </div>

      {pages > 1 && (
        <div className="papers__pager">
          <button type="button" onClick={() => setPage(Math.max(0, current - 1))} disabled={current === 0}>{lang === 'en' ? 'Previous' : '上一页'}</button>
          <span className="mono">{current + 1} / {pages}</span>
          <button type="button" onClick={() => setPage(Math.min(pages - 1, current + 1))} disabled={current >= pages - 1}>{lang === 'en' ? 'Next' : '下一页'}</button>
        </div>
      )}
    </div>
  );
}
