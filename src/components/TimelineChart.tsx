import { useEffect, useMemo, useState } from 'react';
import { atlas } from '../lib/atlas';
import { t, type Lang } from '../lib/i18n';

const FAMILY_ORDER = [
  'Agent',
  'CI_for_LLM',
  'CausalDiscovery',
  'CausalRL',
  'CausalRepLearn',
  'OOD',
  'TimeSeries',
  'WorldModel',
];

const FAMILY_COLORS: Record<string, string> = {
  Agent: '#244a63',
  CI_for_LLM: '#b02a6b',
  CausalDiscovery: '#5e6b4a',
  CausalRL: '#b07a1e',
  CausalRepLearn: '#6f5f8f',
  OOD: '#7d5a44',
  TimeSeries: '#3f7c78',
  WorldModel: '#8a4f4f',
};

const W = 1000;
const H = 360;
const M = { top: 24, right: 20, bottom: 46, left: 46 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

export default function TimelineChart({ lang }: { lang: Lang }) {
  const c = t(lang);
  const timeline = c.timeline;
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [hover, setHover] = useState<{ year: number; family: string; count: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const data = useMemo(() => {
    const years = [...new Set(atlas.papers.map((p) => Number(p.year)).filter((y) => Number.isFinite(y)))].sort((a, b) => a - b);
    const families = [
      ...FAMILY_ORDER.filter((f) => atlas.stats.family[f]),
      ...Object.keys(atlas.stats.family).filter((f) => !FAMILY_ORDER.includes(f)),
    ];
    const counts: Record<number, Record<string, number>> = {};
    for (const y of years) counts[y] = Object.fromEntries(families.map((f) => [f, 0]));
    for (const p of atlas.papers) {
      const y = Number(p.year);
      if (!Number.isFinite(y) || !counts[y]) continue;
      if (counts[y][p.family] === undefined) counts[y][p.family] = 0;
      counts[y][p.family] += 1;
    }
    const totals = Object.fromEntries(years.map((y) => [y, Object.values(counts[y]).reduce((a, b) => a + b, 0)]));
    const maxTotal = Math.max(1, ...Object.values(totals));
    const niceMax = Math.ceil(maxTotal / 50) * 50;
    return { years, families, counts, totals, maxTotal, niceMax };
  }, []);

  const { years, families, counts, totals, niceMax } = data;
  const barStep = PW / Math.max(1, years.length);
  const barWidth = Math.min(64, barStep * 0.56);
  const xCenter = (i: number) => M.left + barStep * (i + 0.5);
  const y = (n: number) => M.top + PH - (n / niceMax) * PH;
  const ticks = Array.from({ length: 5 }, (_, i) => (niceMax / 4) * i);
  const maxYear = years[years.length - 1];

  const status = hover
    ? `${hover.year} · ${hover.family} · ${hover.count} ${timeline.count}`
    : active
      ? `${active} · ${families.reduce((n, f) => n + years.reduce((m, y) => m + counts[y][f], 0), 0)} ${timeline.count}`
      : timeline.hover;

  const setFamily = (family: string | null) => {
    setActive(family);
    setHover(null);
  };

  const toggleFamily = (family: string) => {
    const next = pinned === family ? null : family;
    setPinned(next);
    setActive(next);
    setHover(null);
  };

  return (
    <div className="timeline">
      <div className="timeline__head">
        <div>
          <h2>{timeline.title}</h2>
        </div>
        <p className="timeline__status mono">{status}</p>
      </div>

      <div className="timeline__legend" aria-label={timeline.legend}>
        {families.map((family) => (
          <button
            key={family}
            type="button"
            className={active === family ? 'is-active' : undefined}
            aria-pressed={pinned === family}
            onMouseEnter={() => setFamily(family)}
            onMouseLeave={() => setFamily(pinned)}
            onFocus={() => setFamily(family)}
            onBlur={() => setFamily(pinned)}
            onClick={() => toggleFamily(family)}
          >
            <i style={{ background: FAMILY_COLORS[family] ?? 'var(--muted)' }} />
            <span>{family}</span>
          </button>
        ))}
      </div>

      <div className="timeline__plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={timeline.title}>
          <title>{timeline.title}</title>
          {ticks.map((tick) => (
            <g key={tick}>
              <line className="timeline__grid" x1={M.left} x2={W - M.right} y1={y(tick)} y2={y(tick)} />
              <text className="timeline__tick" x={M.left - 10} y={y(tick) + 4} textAnchor="end">{Math.round(tick)}</text>
            </g>
          ))}

          {years.map((year, i) => {
            const x = xCenter(i) - barWidth / 2;
            let stack = 0;
            return (
              <g
                key={year}
                className="timeline__bar"
                style={{ animationDelay: `${i * 55}ms` }}
                onMouseLeave={() => { setHover(null); setFamily(pinned); }}
              >
                {families.map((family) => {
                  const n = counts[year][family] ?? 0;
                  if (!n) return null;
                  const h = (n / niceMax) * PH;
                  const yy = y(stack + n);
                  stack += n;
                  const opacity = active ? (active === family ? 0.95 : 0.1) : 0.46;
                  return (
                    <rect
                      key={family}
                      x={x}
                      y={ready ? yy : y(0)}
                      width={barWidth}
                      height={ready ? h : 0}
                      fill={FAMILY_COLORS[family] ?? 'var(--muted)'}
                      opacity={opacity}
                      onMouseEnter={() => { setActive(family); setHover({ year, family, count: n }); }}
                    >
                      <title>{`${year} · ${family} · ${n} ${timeline.count}`}</title>
                    </rect>
                  );
                })}
                <text className="timeline__year" x={xCenter(i)} y={H - 18} textAnchor="middle">
                  {year}{year === maxYear ? '*' : ''}
                </text>
              </g>
            );
          })}

          <polyline
            className="timeline__total"
            points={years.map((year, i) => `${xCenter(i)},${y(totals[year])}`).join(' ')}
            fill="none"
            pathLength="1"
          />

          {years.map((year, i) => (
            <g key={`total-${year}`}>
              <circle className="timeline__point" cx={xCenter(i)} cy={y(totals[year])} r={3.2} />
              <text className="timeline__total-label" x={xCenter(i)} y={y(totals[year]) - 9} textAnchor="middle">
                {totals[year]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="timeline__note mono">{timeline.partial}</p>

    </div>
  );
}
