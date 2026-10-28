import { useEffect, useMemo, useState } from 'react';
import navigator from '../../public/atlas/v1/navigator.json';
import { t, type Lang } from '../lib/i18n';
import { withBase } from '../lib/urls';

type AttrValue = string;
type Rule = (typeof navigator.rules)[number];
type Candidate = Rule['candidates'][number];
type Cap = (typeof navigator.capabilities)[keyof typeof navigator.capabilities];

const STATUS_ORDER: Record<string, number> = { adjacent: 0, theoretical: 1 };

function match(values: string[] | undefined, selected: string): boolean {
  if (selected === 'any') return true;
  if (!values || values.length === 0) return true;
  return values.includes(selected);
}

function candidateCap(id: string): Cap | undefined {
  return (navigator.capabilities as Record<string, Cap>)[id];
}

export default function Navigator({ lang }: { lang: Lang }) {
  const c = t(lang).navigator;
  const [problemId, setProblemId] = useState(navigator.problems[0].id);
  const [data, setData] = useState<AttrValue>('any');
  const [intervention, setIntervention] = useState<AttrValue>('any');
  const [confounding, setConfounding] = useState<AttrValue>('any');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextProblem = params.get('problem');
    if (nextProblem && navigator.problems.some((item) => item.id === nextProblem)) {
      setProblemId(nextProblem);
    }
    const restore = (key: 'data' | 'intervention' | 'confounding', set: (value: string) => void) => {
      const value = params.get(key);
      if (value && navigator.attributes[key].values.some(([id]) => id === value)) set(value);
    };
    restore('data', setData);
    restore('intervention', setIntervention);
    restore('confounding', setConfounding);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    params.set('problem', problemId);
    if (data !== 'any') params.set('data', data);
    if (intervention !== 'any') params.set('intervention', intervention);
    if (confounding !== 'any') params.set('confounding', confounding);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [ready, problemId, data, intervention, confounding]);


  const results = useMemo(() => {
    const byCap = new Map<string, Candidate>();
    for (const rule of navigator.rules as Rule[]) {
      if (rule.problem !== problemId) continue;
      if (!match(rule.when?.data, data)) continue;
      if (!match(rule.when?.intervention, intervention)) continue;
      if (!match(rule.when?.confounding, confounding)) continue;
      for (const cand of rule.candidates) {
        const existing = byCap.get(cand.capability);
        if (!existing || STATUS_ORDER[cand.status] < STATUS_ORDER[existing.status]) {
          byCap.set(cand.capability, cand);
        }
      }
    }
    return [...byCap.values()].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }, [problemId, data, intervention, confounding]);

  const reset = () => {
    setProblemId(navigator.problems[0].id);
    setData('any');
    setIntervention('any');
    setConfounding('any');
  };

  const attrSelect = (key: 'data' | 'intervention' | 'confounding', value: string, set: (v: string) => void) => {
    const attr = navigator.attributes[key];
    return (
      <label className="field">
        <span className="eyebrow">{lang === 'zh' ? attr.label_zh : attr.label_en}</span>
        <select value={value} onChange={(e) => set(e.target.value)}>
          {attr.values.map(([v, en, zh]) => (
            <option key={v} value={v}>{lang === 'zh' ? zh : en}</option>
          ))}
        </select>
      </label>
    );
  };

  return (
    <div className="navigator">
      <header className="navigator__head">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p>{c.body}</p>
      </header>

      <section className="navigator__problems" aria-label={c.problem}>
        {navigator.problems.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === problemId ? 'is-active' : undefined}
            aria-pressed={p.id === problemId}
            onClick={() => setProblemId(p.id)}
          >
            <span>{lang === 'zh' ? p.name_zh : p.name_en}</span>
            <small>{lang === 'zh' ? p.desc_zh : p.desc_en}</small>
          </button>
        ))}
      </section>

      <section className="navigator__controls">
        {attrSelect('data', data, setData)}
        {attrSelect('intervention', intervention, setIntervention)}
        {attrSelect('confounding', confounding, setConfounding)}
        <button className="reset navigator__reset" type="button" onClick={reset}>{c.reset}</button>
      </section>

      <section className="navigator__results" aria-live="polite">
        <div className="navigator__results-head">
          <h2>{c.results}</h2>
          <span className="mono">{results.length} {c.count}</span>
        </div>
        <p className="navigator__note">{c.note}</p>
        <ul className="navigator__legend">
          <li><span className="navigator__status navigator__status--adjacent">{c.statusAdjacent}</span>{' '}{c.legendAdjacent}</li>
          <li><span className="navigator__status navigator__status--theoretical">{c.statusTheoretical}</span>{' '}{c.legendTheoretical}</li>
        </ul>

        {results.length === 0 ? (
          <p className="ledger__empty">{intervention === 'can_run' ? c.gapExperiment : c.gap}</p>
        ) : (
          <div className="navigator__cards">
            {results.map((cand) => {
              const cap = candidateCap(cand.capability);
              if (!cap) return null;
              const status = cand.status === 'adjacent' ? c.statusAdjacent : c.statusTheoretical;
              return (
                <article className="navigator-card" key={cand.capability}>
                  <div className="navigator-card__top">
                    <span className="mono navigator-card__id">{cand.capability}</span>
                    <span className={`navigator__status navigator__status--${cand.status}`}>{status}</span>
                  </div>
                  <h3>{lang === 'zh' ? cap.name_zh : cap.name}</h3>
                  <p className="navigator-card__why">{lang === 'zh' ? cand.why_zh ?? cand.why : cand.why}</p>
                  <dl className="navigator-card__facts">
                    <div><dt>{c.assumptions}</dt><dd>{lang === 'zh' ? cap.assumptions_zh : cap.assumptions_en}</dd></div>
                    <div><dt>{c.failure}</dt><dd>{lang === 'zh' ? cap.failure_zh : cap.failure_en}</dd></div>
                    <div><dt>{c.minimalTest}</dt><dd>{lang === 'zh' ? cand.minimal_test_zh ?? cand.minimal_test : cand.minimal_test}</dd></div>
                  </dl>
                  {cap.papers.length > 0 && (
                    <div className="navigator-card__evidence">
                      <span className="eyebrow">{c.evidence}</span>
                      <ul>
                        {cap.papers.slice(0, 3).map((paper) => (
                          <li key={paper.id}>
                            <a href={withBase(`${lang === 'zh' ? '/zh-Hans' : ''}/paper/${paper.id}/`)}>{paper.title}</a>
                            <span className="mono">{paper.id}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
