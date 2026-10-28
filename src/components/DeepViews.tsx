import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { arxivUrl, atlas, bitLabels, bitOrder } from '../lib/atlas';
import { describeBits } from '../lib/bits';
import { t, type Lang } from '../lib/i18n';
import { hammingEdges, layouts, normalize360, ringLayout, round2, type BitEdge, type Vec3 } from '../lib/layouts';
import type { Pattern } from '../lib/types';

type TabKey = 'lattice' | 'umap' | 'orbital' | 'pca';

const TAB_KEYS: TabKey[] = ['lattice', 'umap', 'orbital', 'pca'];
const MODAL = '11100010';
const SCATTER_WIDTH = 900;
const SCATTER_HEIGHT = 560;
const SCATTER_PAD = 56;
const NARROW_SCATTER_WIDTH = 540;
const NARROW_SCATTER_HEIGHT = 540;
const NARROW_SCATTER_PAD = 44;
const ORBITAL_WIDTH = 760;
const ORBITAL_HEIGHT = 620;
const DEFAULT_TILT = -18;
const DEFAULT_TURN = 28;

const deepCopy = {
  en: {
    eyebrow: 'Deep view / experimental',
    title: 'Four views of the same 64 patterns.',
    body: 'The ledger is the exact table. These charts show the same 64 patterns in four views. The Hamming lattice draws one-bit adjacency; the projections place the patterns in two or three coordinates.',
    hero: {
      patterns: 'Observed patterns',
      papers: 'Papers',
      edges: 'One-bit edges',
      seed: 'Projection seed',
    },
    tabsLabel: 'Deep views',
    tabs: {
      lattice: 'Hamming lattice',
      umap: 'UMAP · exploratory',
      orbital: '3D orbital',
      pca: 'PCA · 2D',
    },
    hashHint: 'Direct links: #lattice, #umap, #orbital, #pca.',
    lattice: {
      badge: 'Exact adjacency',
      note: 'Ring = BFS distance from the modal pattern 11100010. Edges connect patterns that differ by exactly one bit. Only the 64 observed patterns appear; 192 of 256 combinations are absent.',
      hint: 'Click a node to pin it. Hover a node or edge to see which bit flips. Press Escape to clear.',
    },
    umap: {
      badge: 'Exploratory projection',
      note: 'Positions come from a fixed UMAP run. The coordinates order patterns by coding similarity.',
      axis1: 'UMAP 1',
      axis2: 'UMAP 2',
      params: {
        seed: 'Seed',
        neighbors: 'n_neighbors',
        minDist: 'min_dist',
        metric: 'Metric',
        trust: 'Trustworthiness',
      },
    },
    orbital: {
      badge: 'PCA 3D projection',
      note: 'A rotated view of the PCA coordinates. Drag the scene or use the two sliders. The table lists the same rows.',
      tilt: 'Tilt X',
      turn: 'Turn Y',
      reset: 'Reset view',
      fallback: '2D fallback table',
    },
    pca: {
      badge: 'Deterministic projection',
      note: 'Axes are coding-bit contrasts, not measured depth. The projection is deterministic.',
      axis1: 'Coding-bit contrast 1',
      axis2: 'Coding-bit contrast 2',
      axisShort1: 'Contrast 1',
      axisShort2: 'Contrast 2',
      variance: 'Explained variance',
      notPlotted: 'PC3 (not plotted)',
    },
    legend: {
      title: 'L / shape',
      note: 'Shape, size, and text encode level and paper count.',
      size: 'Node size = paper count',
    },
    panel: {
      title: 'Selected pattern',
      hint: 'Select a pattern to inspect its coding, family mix, and paper IDs.',
      bits: 'Bits',
      papers: 'papers',
      level: 'Level',
      pipeline: 'Pipeline',
      families: 'Family counts',
      paperIds: 'Paper IDs',
      neighbours: 'One-bit moves',
      clear: 'Clear selection',
      noPattern: 'No pattern selected.',
    },
    status: {
      hoverEmpty: 'Hover a node or edge to inspect a one-bit change.',
      moves: 'one-bit moves',
      flips: 'flips',
      none: 'No pattern selected.',
      isolated: 'No observed one-bit neighbour.',
    },
    table: {
      view: 'View as table',
      hide: 'Hide table',
      caption: 'Table view. 64 observed patterns; paper counts sum to 580.',
      pattern: 'Pattern',
      papers: 'Papers',
      level: 'Level',
      pipeline: 'Pipeline',
      families: 'Families',
      ring: 'Ring',
      x: 'X',
      y: 'Y',
      z: 'Z',
    },
  },
  zh: {
    eyebrow: '深层视图 / 实验性',
    title: '同一批编码的四种图形',
    body: '精确数据在编码总表。汉明图保留相邻关系，投影图用于辅助阅读。',
    hero: {
      patterns: '编码组合',
      papers: '论文',
      edges: '相邻连接',
      seed: '投影种子',
    },
    tabsLabel: '深层视图',
    tabs: {
      lattice: '汉明图',
      umap: 'UMAP · 探索性',
      orbital: '三维旋转图',
      pca: 'PCA · 二维',
    },
    hashHint: '直接链接：#lattice、#umap、#orbital、#pca。',
    lattice: {
      badge: '精确邻接',
      note: '圆环表示离中心组合 11100010 的不同位数。边连接相差一位的组合。图中只画出现过 64 种组合，另外 192 种没有论文。',
      hint: '点击节点固定选择。悬停节点或边查看哪一位翻转。按 Escape 清除。',
    },
    umap: {
      badge: '探索性投影',
      note: '位置来自一次固定参数的 UMAP 运行，按编码相似度排列。',
      axis1: 'UMAP 1',
      axis2: 'UMAP 2',
      params: {
        seed: '随机种子',
        neighbors: '邻居数',
        minDist: '最小距离',
        metric: '度量',
        trust: '可信度',
      },
    },
    orbital: {
      badge: 'PCA 三维投影',
      note: 'PCA 坐标的旋转视图。拖动场景或使用两个滑块。表格列出同一批记录。',
      tilt: '俯仰 X',
      turn: '旋转 Y',
      reset: '重置视角',
      fallback: '二维回退表格',
    },
    pca: {
      badge: '确定性投影',
      note: '坐标轴表示编码位对比。投影是确定性的。',
      axis1: '编码位对比 1',
      axis2: '编码位对比 2',
      axisShort1: '对比 1',
      axisShort2: '对比 2',
      variance: '解释方差',
      notPlotted: 'PC3（未绘制）',
    },
    legend: {
      title: '等级与图形',
      note: '图形形状表示等级，大小表示论文数，文字同时标出等级。',
      size: '节点大小 = 论文数',
    },
    panel: {
      title: '已选组合',
      hint: '选择一个组合，查看编码、论文分组分布和论文 ID。',
      bits: '编码',
      papers: '篇论文',
      level: '耦合程度',
      pipeline: '介入阶段',
      families: '论文分组分布',
      paperIds: '论文 ID',
      neighbours: '相邻组合',
      clear: '清除选择',
      noPattern: '未选择组合。',
    },
    status: {
      hoverEmpty: '悬停节点或边，查看哪一位变化。',
      moves: '个相邻组合',
      flips: '翻转',
      none: '未选择组合。',
      isolated: '没有观察到相邻组合。',
    },
    table: {
      view: '查看表格',
      hide: '收起表格',
      caption: '表格视图。64 种编码组合，论文计数合计 580 篇。',
      pattern: '编码组合',
      papers: '论文',
      level: '耦合程度',
      pipeline: '介入阶段',
      families: '论文分组',
      ring: '圈',
      x: 'X',
      y: 'Y',
      z: 'Z',
    },
  },
} as const;

type DeepCopy = (typeof deepCopy)[Lang];

type ExtraColumn = {
  label: string;
  value: (pattern: Pattern) => string;
};

function isTab(value: string): value is TabKey {
  return (TAB_KEYS as string[]).includes(value);
}

function radiusFor(count: number): number {
  return round2(4 + Math.sqrt(Math.max(0, count)) * 1.7);
}

function formatCoord(value: number | undefined): string {
  return typeof value === 'number' ? value.toFixed(2) : '—';
}

function hexagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    return `${round2(cx + Math.cos(angle) * r)},${round2(cy + Math.sin(angle) * r)}`;
  }).join(' ');
}

type GlyphProps = {
  level: string;
  cx: number;
  cy: number;
  r: number;
};

function Glyph({ level, cx, cy, r }: GlyphProps) {
  const fill = `var(--l${level.slice(1)})`;
  const common = {
    className: 'deep-node__shape',
    fill,
    stroke: 'var(--ground)',
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  if (level === 'L1') {
    const half = round2(r * 0.74);
    return (
      <rect
        x={round2(cx - half)}
        y={round2(cy - half)}
        width={round2(half * 2)}
        height={round2(half * 2)}
        {...common}
      />
    );
  }
  if (level === 'L2') {
    return (
      <polygon
        points={`${round2(cx)},${round2(cy - r * 1.08)} ${round2(cx + r * 0.96)},${round2(cy + r * 0.74)} ${round2(cx - r * 0.96)},${round2(cy + r * 0.74)}`}
        {...common}
      />
    );
  }
  if (level === 'L3') {
    return (
      <polygon
        points={`${round2(cx)},${round2(cy - r * 1.12)} ${round2(cx + r * 1.06)},${round2(cy)} ${round2(cx)},${round2(cy + r * 1.12)} ${round2(cx - r * 1.06)},${round2(cy)}`}
        {...common}
      />
    );
  }
  if (level === 'L4') {
    return <polygon points={hexagonPoints(cx, cy, r * 1.04)} {...common} />;
  }
  return <circle cx={cx} cy={cy} r={round2(r * 0.74)} {...common} />;
}

type PlotNodeProps = {
  pattern: Pattern;
  x: number;
  y: number;
  selected: boolean;
  hovered: boolean;
  showLabel: boolean;
  ariaLabel: string;
  labelUnit: string;
  canvasWidth?: number;
  opacity?: number;
  onSelect: (bits: string) => void;
  onHover: (bits: string | null) => void;
};

function PlotNode({
  pattern,
  x,
  y,
  selected,
  hovered,
  showLabel,
  ariaLabel,
  labelUnit,
  canvasWidth = 900,
  opacity = 1,
  onSelect,
  onHover,
}: PlotNodeProps) {
  const r = radiusFor(pattern.count);
  const labelVisible = showLabel || selected || hovered;
  const label = selected || hovered ? `${pattern.level} · ${pattern.count} ${labelUnit}` : pattern.level;
  const labelOnLeft = x > canvasWidth - 96;

  return (
    <g
      className="deep-node"
      data-selected={selected ? 'true' : 'false'}
      data-hovered={hovered ? 'true' : 'false'}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      opacity={opacity}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(pattern.bits);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          onSelect(pattern.bits);
        }
      }}
      onMouseEnter={() => onHover(pattern.bits)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(pattern.bits)}
      onBlur={() => onHover(null)}
    >
      <circle className="deep-node__hit" cx={x} cy={y} r={round2(Math.max(r + 11, 22))} />
      <circle className="deep-node__halo" cx={x} cy={y} r={round2(r + 6)} />
      <Glyph level={pattern.level} cx={x} cy={y} r={r} />
      {labelVisible && (
        <text
          className={`deep-node__label ${selected || hovered ? '' : 'deep-node__label--auto'}`}
          x={round2(labelOnLeft ? x - r - 5 : x + r + 5)}
          y={round2(y + 3)}
          textAnchor={labelOnLeft ? 'end' : 'start'}
          aria-hidden="true"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function Legend({ ui }: { ui: DeepCopy }) {
  return (
    <div className="deep-legend-wrap">
      <div className="deep-legend" aria-label={ui.legend.title}>
        <span className="eyebrow">{ui.legend.title}</span>
        {['L0', 'L1', 'L2', 'L3', 'L4'].map((level) => (
          <span className="deep-legend__item" key={level}>
            <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true">
              <Glyph level={level} cx={11} cy={11} r={7} />
            </svg>
            <span className="mono">{level}</span>
          </span>
        ))}
        <span className="deep-legend__size mono">{ui.legend.size}</span>
      </div>
      <p className="deep-note deep-note--small">{ui.legend.note}</p>
    </div>
  );
}

type FitPoint<T> = T & { sx: number; sy: number };

type FitResult<T> = {
  points: Array<FitPoint<T>>;
  left: number;
  top: number;
  width: number;
  height: number;
  zeroX: number;
  zeroY: number;
};

function fitScatter<T extends { x: number; y: number }>(
  items: T[],
  width: number,
  height: number,
  pad: number,
): FitResult<T> {
  const xs = items.map((item) => item.x);
  const ys = items.map((item) => item.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const plotWidth = spanX * scale;
  const plotHeight = spanY * scale;
  const left = (width - plotWidth) / 2;
  const top = (height - plotHeight) / 2;

  return {
    points: items.map((item) => ({
      ...item,
      sx: round2(left + (item.x - minX) * scale),
      sy: round2(top + plotHeight - (item.y - minY) * scale),
    })),
    left: round2(left),
    top: round2(top),
    width: round2(plotWidth),
    height: round2(plotHeight),
    zeroX: round2(left + (0 - minX) * scale),
    zeroY: round2(top + plotHeight - (0 - minY) * scale),
  };
}

type PatternTableProps = {
  id: string;
  caption: string;
  patterns: Pattern[];
  selected: string | null;
  extras?: ExtraColumn[];
  ui: DeepCopy;
  lang: 'en' | 'zh';
  onSelect: (bits: string) => void;
};

function PatternTable({ id, caption, patterns, selected, extras = [], ui, lang, onSelect }: PatternTableProps) {
  return (
    <div className="deep-table-wrap" id={id} role="region" aria-label={caption} tabIndex={0}>
      <table className="deep-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{ui.table.pattern}</th>
            <th scope="col" className="num">
              {ui.table.papers}
            </th>
            <th scope="col">{ui.table.level}</th>
            <th scope="col">{ui.table.pipeline}</th>
            <th scope="col">{ui.table.families}</th>
            {extras.map((extra) => (
              <th scope="col" key={extra.label}>
                {extra.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {patterns.map((pattern) => {
            const familySummary = Object.entries(pattern.family_counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([family, count]) => `${family} ${count}`)
              .join(' · ');

            return (
              <tr
                key={pattern.bits}
                tabIndex={0}
                aria-selected={selected === pattern.bits}
                className={selected === pattern.bits ? 'is-selected' : undefined}
                onClick={() => onSelect(pattern.bits)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(pattern.bits);
                  }
                }}
              >
                <th scope="row" className="mono">
                  {pattern.bits}
                  <span className="deep-table__meaning">{describeBits(pattern.bits, lang)}</span>
                </th>
                <td className="num">{pattern.count}</td>
                <td>{pattern.level}</td>
                <td>{pattern.pipeline}</td>
                <td className="deep-table__families">{familySummary}</td>
                {extras.map((extra) => (
                  <td key={extra.label} className="mono">
                    {extra.value(pattern)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function DeepViews({ lang }: { lang: Lang }) {
  const c = t(lang);
  const ui: DeepCopy = deepCopy[lang];

  const [tab, setTab] = useState<TabKey>('lattice');
  const [selected, setSelected] = useState<string | null>(MODAL);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);
  const [openTable, setOpenTable] = useState<Record<TabKey, boolean>>({
    lattice: false,
    umap: false,
    orbital: false,
    pca: false,
  });
  const [tilt, setTilt] = useState(DEFAULT_TILT);
  const [turn, setTurn] = useState(DEFAULT_TURN);
  const [narrow, setNarrow] = useState(false);
  const dragRef = useRef<{ x: number; y: number; turn: number; tilt: number } | null>(null);
  const scatterWidth = narrow ? NARROW_SCATTER_WIDTH : SCATTER_WIDTH;
  const scatterHeight = narrow ? NARROW_SCATTER_HEIGHT : SCATTER_HEIGHT;
  const scatterPad = narrow ? NARROW_SCATTER_PAD : SCATTER_PAD;

  const patternMap = useMemo(() => new Map(atlas.patterns.map((pattern) => [pattern.bits, pattern])), []);
  const selectedPattern = selected ? patternMap.get(selected) : undefined;

  const edges = useMemo(() => hammingEdges(atlas.patterns.map((pattern) => pattern.bits)), []);
  const edgeByKey = useMemo(() => new Map(edges.map((edge) => [`${edge.a}|${edge.b}`, edge])), [edges]);

  const ringPoints = useMemo(() => ringLayout(atlas.patterns.map((pattern) => pattern.bits), MODAL), []);
  const ringByBits = useMemo(() => new Map(ringPoints.map((point) => [point.bits, point.ring])), [ringPoints]);
  const ringPointByBits = useMemo(() => new Map(ringPoints.map((point) => [point.bits, point])), [ringPoints]);
  const ringRadii = useMemo(() => {
    const radii = new Map<number, number>();
    for (const point of ringPoints) {
      if (point.ring === 0) continue;
      radii.set(point.ring, round2(Math.hypot(point.x - 500, point.y - 500)));
    }
    return Array.from(radii.entries()).sort((a, b) => a[0] - b[0]);
  }, [ringPoints]);

  const countOrdered = useMemo(
    () => atlas.patterns.slice().sort((a, b) => b.count - a.count || a.bits.localeCompare(b.bits)),
    [],
  );
  const latticeOrdered = useMemo(
    () =>
      atlas.patterns
        .slice()
        .sort(
          (a, b) =>
            (ringByBits.get(a.bits) ?? 99) - (ringByBits.get(b.bits) ?? 99) ||
            b.count - a.count ||
            a.bits.localeCompare(b.bits),
        ),
    [ringByBits],
  );

  const umapFit = useMemo(
    () =>
      fitScatter(
        atlas.patterns.map((pattern) => {
          const coords = layouts.umap.coords[pattern.bits] ?? [0, 0];
          return { pattern, x: coords[0] ?? 0, y: coords[1] ?? 0 };
        }),
        scatterWidth,
        scatterHeight,
        scatterPad,
      ),
    [scatterWidth, scatterHeight, scatterPad],
  );

  const pcaFit = useMemo(
    () =>
      fitScatter(
        atlas.patterns.map((pattern) => {
          const coords = layouts.pca.coords[pattern.bits] ?? [0, 0, 0];
          return { pattern, x: coords[0] ?? 0, y: coords[1] ?? 0 };
        }),
        scatterWidth,
        scatterHeight,
        scatterPad,
      ),
    [scatterWidth, scatterHeight, scatterPad],
  );

  const pca3Points = useMemo(() => {
    const maxAbs = Math.max(
      1e-6,
      ...atlas.patterns.flatMap((pattern) => {
        const coords = layouts.pca.coords[pattern.bits] ?? [0, 0, 0];
        return coords.slice(0, 3).map((value) => Math.abs(value));
      }),
    );
    return atlas.patterns.map((pattern) => {
      const coords = layouts.pca.coords[pattern.bits] ?? [0, 0, 0];
      return {
        pattern,
        coords: [(coords[0] ?? 0) / maxAbs, (coords[1] ?? 0) / maxAbs, (coords[2] ?? 0) / maxAbs] as Vec3,
      };
    });
  }, []);

  const projected3d = useMemo(() => {
    const rad = Math.PI / 180;
    const cosY = Math.cos(turn * rad);
    const sinY = Math.sin(turn * rad);
    const cosX = Math.cos(tilt * rad);
    const sinX = Math.sin(tilt * rad);
    const scale = Math.min(ORBITAL_WIDTH, ORBITAL_HEIGHT) * 0.4;

    return pca3Points.map(({ pattern, coords }) => {
      const x1 = coords[0] * cosY - coords[2] * sinY;
      const z1 = coords[0] * sinY + coords[2] * cosY;
      const y2 = coords[1] * cosX - z1 * sinX;
      const z2 = coords[1] * sinX + z1 * cosX;
      const perspective = 1 / (1 + z2 * 0.18);
      return {
        pattern,
        x: round2(ORBITAL_WIDTH / 2 + x1 * scale * perspective),
        y: round2(ORBITAL_HEIGHT / 2 + y2 * scale * perspective),
        depth: Math.round(z2 * 10000) / 10000,
      };
    });
  }, [pca3Points, tilt, turn]);

  const projected3dMap = useMemo(
    () => new Map(projected3d.map((point) => [point.pattern.bits, point])),
    [projected3d],
  );
  const ordered3d = useMemo(
    () =>
      projected3d.slice().sort((a, b) => {
        const aActive = a.pattern.bits === selected || a.pattern.bits === hoverNode;
        const bActive = b.pattern.bits === selected || b.pattern.bits === hoverNode;
        if (aActive !== bActive) return aActive ? 1 : -1;
        return a.depth - b.depth;
      }),
    [projected3d, selected, hoverNode],
  );

  useEffect(() => {
    const readHash = () => {
      const raw = window.location.hash.replace(/^#/, '');
      if (isTab(raw)) setTab(raw);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)');
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('pattern');
    if (requested && patternMap.has(requested)) setSelected(requested);
  }, [patternMap]);

  const writeSelectionToUrl = (bits: string | null) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (bits) params.set('pattern', bits);
    else params.delete('pattern');
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
    );
  };

  const chooseTab = (next: TabKey) => {
    setTab(next);
    setHoverEdge(null);
    setHoverNode(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${next}`,
      );
    }
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TAB_KEYS.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TAB_KEYS.length) % TAB_KEYS.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = TAB_KEYS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const next = TAB_KEYS[nextIndex];
    chooseTab(next);
    document.getElementById(`deep-tab-${next}`)?.focus();
  };

  const clearSelection = () => {
    setSelected(null);
    writeSelectionToUrl(null);
  };

  const onRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    clearSelection();
    setHoverNode(null);
    setHoverEdge(null);
  };

  const selectPattern = (bits: string) => {
    setSelected(bits);
    writeSelectionToUrl(bits);
  };

  const handleHoverNode = (bits: string | null) => {
    setHoverNode(bits);
    setHoverEdge(null);
  };

  const toggleTable = (key: TabKey) => {
    setOpenTable((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const tableButton = (key: TabKey, label: string) => (
    <button
      type="button"
      className="deep-tablebtn"
      aria-expanded={openTable[key]}
      aria-controls={`deep-table-${key}`}
      onClick={() => toggleTable(key)}
    >
      {openTable[key] ? ui.table.hide : label}
    </button>
  );

  const ariaFor = (pattern: Pattern) =>
    `${pattern.bits}, ${pattern.count} ${c.ledgerUi.papers}, ${pattern.level}, pipeline ${pattern.pipeline}`;

  const hoveredEdge = hoverEdge ? edgeByKey.get(hoverEdge) : undefined;
  const hoverNodeMoves = hoverNode ? edges.filter((edge) => edge.a === hoverNode || edge.b === hoverNode) : [];

  let flipSummary: string = ui.status.hoverEmpty;
  if (hoveredEdge) {
    const letter = bitOrder[hoveredEdge.index];
    flipSummary = `${hoveredEdge.a} → ${hoveredEdge.b} · ${bitLabels[letter]} (${letter}) ${ui.status.flips}`;
  } else if (hoverNode) {
    const moves = hoverNodeMoves.map((edge) => {
      const other = edge.a === hoverNode ? edge.b : edge.a;
      const letter = bitOrder[edge.index];
      const neighbour = patternMap.get(other);
      return `${bitLabels[letter]} (${letter}) → ${other}${neighbour ? ` · ${neighbour.level} · ${neighbour.count} ${c.ledgerUi.papers}` : ''}`;
    });
    flipSummary = `${hoverNode} · ${moves.length} ${ui.status.moves}: ${moves.join(' · ')}`;
  }

  const edgeStyle = (edge: BitEdge) => {
    const key = `${edge.a}|${edge.b}`;
    const incidentSelected = Boolean(selected && (edge.a === selected || edge.b === selected));
    const incidentHover = Boolean(hoverNode && (edge.a === hoverNode || edge.b === hoverNode));
    if (hoverEdge === key) return { stroke: 'var(--ink)', strokeWidth: 2.6, opacity: 1 };
    if (incidentHover) return { stroke: 'var(--blue)', strokeWidth: 2, opacity: 1 };
    if (incidentSelected) return { stroke: 'var(--accent)', strokeWidth: 1.8, opacity: 0.95 };
    return { stroke: 'var(--rule)', strokeWidth: 1, opacity: 0.55 };
  };

  const latticeEdges = edges;

  const tabButtonId = (key: TabKey) => `deep-tab-${key}`;
  const panelId = (key: TabKey) => `deep-panel-${key}`;

  const renderReadout = () => (
    <div className="deep-readout mono">
      {selectedPattern ? (
        <>
          <span>{selectedPattern.bits}</span>
          <span className="deep-readout__meaning">{describeBits(selectedPattern.bits, lang)}</span>
          <span>·</span>
          <span>
            {selectedPattern.count} {c.ledgerUi.papers}
          </span>
          <span>·</span>
          <span>{selectedPattern.level}</span>
          <span>·</span>
          <span>{selectedPattern.pipeline}</span>
          <button type="button" className="deep-clear deep-clear--inline" onClick={clearSelection}>
            {ui.panel.clear}
          </button>
        </>
      ) : (
        <span>{ui.panel.noPattern}</span>
      )}
    </div>
  );

  const umapExtras: ExtraColumn[] = [
    { label: ui.table.x, value: (pattern) => formatCoord(layouts.umap.coords[pattern.bits]?.[0]) },
    { label: ui.table.y, value: (pattern) => formatCoord(layouts.umap.coords[pattern.bits]?.[1]) },
  ];
  const pcaExtras: ExtraColumn[] = [
    { label: ui.pca.axisShort1, value: (pattern) => formatCoord(layouts.pca.coords[pattern.bits]?.[0]) },
    { label: ui.pca.axisShort2, value: (pattern) => formatCoord(layouts.pca.coords[pattern.bits]?.[1]) },
  ];
  const orbitalExtras: ExtraColumn[] = [
    { label: ui.table.x, value: (pattern) => formatCoord(layouts.pca.coords[pattern.bits]?.[0]) },
    { label: ui.table.y, value: (pattern) => formatCoord(layouts.pca.coords[pattern.bits]?.[1]) },
    { label: ui.table.z, value: (pattern) => formatCoord(layouts.pca.coords[pattern.bits]?.[2]) },
  ];
  const latticeExtras: ExtraColumn[] = [
    { label: ui.table.ring, value: (pattern) => String(ringByBits.get(pattern.bits) ?? '—') },
  ];

  const startDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    // Keep node activation reliable: rotate only when the drag starts on the scene,
    // not on a focusable node.
    const target = event.target as Element | null;
    if (target?.closest('.deep-node')) return;
    dragRef.current = { x: event.clientX, y: event.clientY, turn, tilt };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const start = dragRef.current;
    if (!start) return;
    setTurn(normalize360(start.turn + (event.clientX - start.x) * 0.45));
    setTilt(Math.max(-85, Math.min(85, start.tilt - (event.clientY - start.y) * 0.35)));
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const selectedNeighbours = selected
    ? edges.filter((edge) => edge.a === selected || edge.b === selected)
    : [];

  return (
    <div className="deep" onKeyDown={onRootKeyDown}>
      <p className="deep-sr" role="status" aria-live="polite">
        {selectedPattern
          ? `${selectedPattern.count} ${c.ledgerUi.papers} · ${selectedPattern.bits} · ${selectedPattern.level}`
          : ui.status.none}
      </p>

      <header className="deep-hero">
        <div>
          <p className="eyebrow">{ui.eyebrow}</p>
          <h1>{ui.title}</h1>
          <p className="deep-hero__body">{ui.body}</p>
        </div>
        <dl className="deep-hero__meta mono">
          <div>
            <dt>{ui.hero.patterns}</dt>
            <dd>{atlas.patterns.length}</dd>
          </div>
          <div>
            <dt>{ui.hero.papers}</dt>
            <dd>{atlas.stats.papers}</dd>
          </div>
          <div>
            <dt>{ui.hero.edges}</dt>
            <dd>{edges.length}</dd>
          </div>
          <div>
            <dt>{ui.hero.seed}</dt>
            <dd>{layouts.seed}</dd>
          </div>
        </dl>
      </header>

      <div className="deep-tabs" role="tablist" aria-label={ui.tabsLabel}>
        {TAB_KEYS.map((key, index) => (
          <button
            key={key}
            id={tabButtonId(key)}
            type="button"
            role="tab"
            className="deep-tab"
            aria-selected={tab === key}
            aria-controls={panelId(key)}
            tabIndex={tab === key ? 0 : -1}
            onClick={() => chooseTab(key)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            {ui.tabs[key]}
          </button>
        ))}
      </div>
      <p className="deep-hashnote mono">{ui.hashHint}</p>

      {tab === 'lattice' && (
        <section
          id={panelId('lattice')}
          role="tabpanel"
          aria-labelledby={tabButtonId('lattice')}
          className="deep-section"
          tabIndex={0}
        >
          <div className="deep-sectionhead">
            <div>
              <span className="deep-tag">{ui.lattice.badge}</span>
              <p className="deep-note">{ui.lattice.note}</p>
              <p className="deep-note deep-note--small">{ui.lattice.hint}</p>
            </div>
            {tableButton('lattice', ui.table.view)}
          </div>

          <div className="deep-lattice">
            <div className="deep-chart deep-chart--lattice">
              <p className="deep-flip mono">{flipSummary}</p>
              <svg
                viewBox="0 0 1000 1000"
                className="deep-lattice-svg"
                role="group"
                aria-label={`${ui.tabs.lattice}. ${ui.lattice.note}`}
              >
                <title>{ui.tabs.lattice}</title>
                {ringRadii.map(([ring, radius]) => (
                  <circle key={ring} className="deep-ring" cx={500} cy={500} r={radius} />
                ))}
                {latticeEdges.map((edge) => {
                  const start = ringPointByBits.get(edge.a);
                  const end = ringPointByBits.get(edge.b);
                  if (!start || !end) return null;
                  const key = `${edge.a}|${edge.b}`;
                  const style = edgeStyle(edge);
                  const letter = bitOrder[edge.index];
                  return (
                    <g key={key}>
                      <line
                        className="deep-edge"
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        style={style}
                      />
                      <line
                        className="deep-edge__hit"
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        aria-hidden="true"
                        onMouseEnter={() => {
                          setHoverEdge(key);
                          setHoverNode(null);
                        }}
                        onMouseLeave={() => setHoverEdge(null)}
                      >
                        <title>{`${edge.a} → ${edge.b}: ${bitLabels[letter]} (${letter}) ${ui.status.flips}`}</title>
                      </line>
                    </g>
                  );
                })}
                {ringPoints.map((point) => {
                  const pattern = patternMap.get(point.bits);
                  if (!pattern) return null;
                  return (
                    <PlotNode
                      key={point.bits}
                      pattern={pattern}
                      x={point.x}
                      y={point.y}
                      selected={selected === point.bits}
                      hovered={hoverNode === point.bits}
                      showLabel={pattern.count >= 18}
                      ariaLabel={ariaFor(pattern)}
                      labelUnit={c.ledgerUi.papers}
                      canvasWidth={1000}
                      onSelect={selectPattern}
                      onHover={handleHoverNode}
                    />
                  );
                })}
              </svg>
              <Legend ui={ui} />
            </div>

            <aside className="deep-panel" aria-label={ui.panel.title}>
              {selectedPattern ? (
                <>
                  <div className="deep-panel__head">
                    <p className="eyebrow">{ui.panel.title}</p>
                    <button type="button" className="deep-clear" onClick={clearSelection}>
                      {ui.panel.clear}
                    </button>
                  </div>
                  <div className="deep-panel__bits">
                    <span className="deep-bits" aria-hidden="true">
                      {selectedPattern.bits.split('').map((bit, index) => (
                        <i key={index} data-on={bit} data-gap={index === 5 ? '1' : undefined} />
                      ))}
                    </span>
                    <span className="mono deep-panel__bitstring">{selectedPattern.bits}</span>
                  </div>
                  <p className="deep-panel__meaning">{describeBits(selectedPattern.bits, lang)}</p>
                  <dl className="deep-facts mono">
                    <div>
                      <dt>{ui.panel.level}</dt>
                      <dd>{selectedPattern.level}</dd>
                    </div>
                    <div>
                      <dt>{ui.panel.pipeline}</dt>
                      <dd>{selectedPattern.pipeline}</dd>
                    </div>
                    <div>
                      <dt>{ui.panel.papers}</dt>
                      <dd>{selectedPattern.count}</dd>
                    </div>
                  </dl>

                  <h3 className="eyebrow">{ui.panel.families}</h3>
                  <ul className="deep-fams">
                    {Object.entries(selectedPattern.family_counts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([family, count]) => {
                        const max = Math.max(1, ...Object.values(selectedPattern.family_counts));
                        return (
                          <li key={family}>
                            <span className="deep-fams__name">{family}</span>
                            <span className="deep-fams__bar" aria-hidden="true">
                              <i style={{ width: `${Math.round((count / max) * 1000) / 10}%` }} />
                            </span>
                            <span className="mono">{count}</span>
                          </li>
                        );
                      })}
                  </ul>

                  <h3 className="eyebrow">{ui.panel.neighbours}</h3>
                  {selectedNeighbours.length > 0 ? (
                    <ul className="deep-moves">
                      {selectedNeighbours.map((edge) => {
                        const other = edge.a === selectedPattern.bits ? edge.b : edge.a;
                        const neighbour = patternMap.get(other);
                        const letter = bitOrder[edge.index];
                        return (
                          <li key={`${edge.a}|${edge.b}`}>
                            <button type="button" className="deep-move" onClick={() => selectPattern(other)}>
                              <span className="mono">{other}</span>
                              <span className="deep-move__flip">
                                {bitLabels[letter]} ({letter})
                              </span>
                              <span className="mono">
                                {neighbour?.level} · {neighbour?.count}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="deep-note deep-note--small">{ui.status.isolated}</p>
                  )}

                  <h3 className="eyebrow">{ui.panel.paperIds}</h3>
                  <ul className="deep-papers mono">
                    {selectedPattern.paper_ids.map((id) => {
                      const url = arxivUrl(id);
                      return (
                        <li key={id}>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer">
                              {id}
                            </a>
                          ) : (
                            <span>{id}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <>
                  <p className="eyebrow">{ui.panel.title}</p>
                  <p className="deep-panel__hint">{ui.panel.hint}</p>
                </>
              )}
            </aside>
          </div>

          {openTable.lattice && (
            <PatternTable
              lang={lang}
              id="deep-table-lattice"
              caption={`${ui.tabs.lattice} · ${ui.table.caption}`}
              patterns={latticeOrdered}
              selected={selected}
              extras={latticeExtras}
              ui={ui}
              onSelect={selectPattern}
            />
          )}
        </section>
      )}

      {tab === 'umap' && (
        <section
          id={panelId('umap')}
          role="tabpanel"
          aria-labelledby={tabButtonId('umap')}
          className="deep-section"
          tabIndex={0}
        >
          <div className="deep-sectionhead">
            <div>
              <span className="deep-tag">{ui.umap.badge}</span>
              <p className="deep-note">{ui.umap.note}</p>
            </div>
            {tableButton('umap', ui.table.view)}
          </div>

          <div className="deep-chart">
            <dl className="deep-params mono">
              <div>
                <dt>{ui.umap.params.seed}</dt>
                <dd>{layouts.seed}</dd>
              </div>
              <div>
                <dt>{ui.umap.params.neighbors}</dt>
                <dd>{layouts.umap.n_neighbors}</dd>
              </div>
              <div>
                <dt>{ui.umap.params.minDist}</dt>
                <dd>{layouts.umap.min_dist}</dd>
              </div>
              <div>
                <dt>{ui.umap.params.metric}</dt>
                <dd>{layouts.umap.metric}</dd>
              </div>
              <div>
                <dt>{ui.umap.params.trust}</dt>
                <dd>{layouts.umap.trustworthiness.toFixed(4)}</dd>
              </div>
            </dl>
            {renderReadout()}
            <svg
              viewBox={`0 0 ${scatterWidth} ${scatterHeight}`}
              className="deep-scatter"
              role="group"
              aria-label={`${ui.tabs.umap}. ${ui.umap.note}`}
            >
              <title>{ui.tabs.umap}</title>
              <rect
                x={umapFit.left}
                y={umapFit.top}
                width={umapFit.width}
                height={umapFit.height}
                fill="none"
                stroke="var(--rule)"
              />
              {umapFit.zeroX >= umapFit.left && umapFit.zeroX <= umapFit.left + umapFit.width && (
                <line
                  className="deep-axis-line"
                  x1={umapFit.zeroX}
                  y1={umapFit.top}
                  x2={umapFit.zeroX}
                  y2={round2(umapFit.top + umapFit.height)}
                />
              )}
              {umapFit.zeroY >= umapFit.top && umapFit.zeroY <= umapFit.top + umapFit.height && (
                <line
                  className="deep-axis-line"
                  x1={umapFit.left}
                  y1={umapFit.zeroY}
                  x2={round2(umapFit.left + umapFit.width)}
                  y2={umapFit.zeroY}
                />
              )}
              <text
                className="deep-axis-title"
                x={round2(umapFit.left + umapFit.width / 2)}
                y={round2(Math.min(scatterHeight - 10, umapFit.top + umapFit.height + 30))}
                textAnchor="middle"
              >
                {ui.umap.axis1}
              </text>
              <text
                className="deep-axis-title"
                x={round2(Math.max(18, umapFit.left - 30))}
                y={round2(umapFit.top + umapFit.height / 2)}
                textAnchor="middle"
                transform={`rotate(-90 ${round2(Math.max(18, umapFit.left - 30))} ${round2(umapFit.top + umapFit.height / 2)})`}
              >
                {ui.umap.axis2}
              </text>
              {umapFit.points.map((point) => (
                <PlotNode
                  key={point.pattern.bits}
                  pattern={point.pattern}
                  x={point.sx}
                  y={point.sy}
                  selected={selected === point.pattern.bits}
                  hovered={hoverNode === point.pattern.bits}
                  showLabel={point.pattern.count >= 25}
                  ariaLabel={ariaFor(point.pattern)}
                  labelUnit={c.ledgerUi.papers}
                  canvasWidth={scatterWidth}
                  onSelect={selectPattern}
                  onHover={handleHoverNode}
                />
              ))}
            </svg>
            <Legend ui={ui} />
          </div>

          {openTable.umap && (
            <PatternTable
              lang={lang}
              id="deep-table-umap"
              caption={`${ui.tabs.umap} · ${ui.table.caption}`}
              patterns={countOrdered}
              selected={selected}
              extras={umapExtras}
              ui={ui}
              onSelect={selectPattern}
            />
          )}
        </section>
      )}

      {tab === 'orbital' && (
        <section
          id={panelId('orbital')}
          role="tabpanel"
          aria-labelledby={tabButtonId('orbital')}
          className="deep-section"
          tabIndex={0}
        >
          <div className="deep-sectionhead">
            <div>
              <span className="deep-tag">{ui.orbital.badge}</span>
              <p className="deep-note">{ui.orbital.note}</p>
            </div>
            {tableButton('orbital', ui.orbital.fallback)}
          </div>

          <div className="deep-chart deep-chart--orbital">
            {renderReadout()}
            <svg
              viewBox={`0 0 ${ORBITAL_WIDTH} ${ORBITAL_HEIGHT}`}
              className="deep-scene"
              role="group"
              aria-label={`${ui.tabs.orbital}. ${ui.orbital.note}`}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <title>{ui.tabs.orbital}</title>
              {edges.map((edge) => {
                const start = projected3dMap.get(edge.a);
                const end = projected3dMap.get(edge.b);
                if (!start || !end) return null;
                const key = `${edge.a}|${edge.b}`;
                const incidentSelected = Boolean(selected && (edge.a === selected || edge.b === selected));
                const incidentHover = Boolean(hoverNode && (edge.a === hoverNode || edge.b === hoverNode));
                const averageDepth = (start.depth + end.depth) / 2;
                const opacity =
                  incidentSelected || incidentHover
                    ? 0.9
                    : Math.round((0.16 + ((averageDepth + 1.4) / 2.8) * 0.26) * 1000) / 1000;
                return (
                  <line
                    key={key}
                    className="deep-edge deep-edge--depth"
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    style={{
                      stroke: incidentSelected ? 'var(--accent)' : incidentHover ? 'var(--blue)' : 'var(--rule)',
                      strokeWidth: incidentSelected || incidentHover ? 1.8 : 1,
                      opacity,
                    }}
                  />
                );
              })}
              {ordered3d.map((point) => (
                <PlotNode
                  key={point.pattern.bits}
                  pattern={point.pattern}
                  x={point.x}
                  y={point.y}
                  selected={selected === point.pattern.bits}
                  hovered={hoverNode === point.pattern.bits}
                  showLabel={false}
                  ariaLabel={ariaFor(point.pattern)}
                  labelUnit={c.ledgerUi.papers}
                  canvasWidth={ORBITAL_WIDTH}
                  opacity={
                    selected === point.pattern.bits || hoverNode === point.pattern.bits
                      ? 1
                      : Math.round((0.76 + ((point.depth + 1.4) / 2.8) * 0.24) * 1000) / 1000
                  }
                  onSelect={selectPattern}
                  onHover={handleHoverNode}
                />
              ))}
            </svg>

            <div className="deep-controls">
              <label className="deep-range">
                <span className="eyebrow">
                  {ui.orbital.tilt} · <span className="mono">{Math.round(tilt)}°</span>
                </span>
                <input
                  type="range"
                  min={-85}
                  max={85}
                  step={1}
                  value={tilt}
                  aria-label={ui.orbital.tilt}
                  onChange={(event) => setTilt(Number(event.target.value))}
                />
              </label>
              <label className="deep-range">
                <span className="eyebrow">
                  {ui.orbital.turn} · <span className="mono">{Math.round(turn)}°</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={359}
                  step={1}
                  value={Math.round(turn)}
                  aria-label={ui.orbital.turn}
                  onChange={(event) => setTurn(Number(event.target.value))}
                />
              </label>
              <button
                type="button"
                className="deep-tablebtn"
                onClick={() => {
                  setTilt(DEFAULT_TILT);
                  setTurn(DEFAULT_TURN);
                }}
              >
                {ui.orbital.reset}
              </button>
            </div>
            <Legend ui={ui} />
          </div>

          {openTable.orbital && (
            <PatternTable
              lang={lang}
              id="deep-table-orbital"
              caption={`${ui.orbital.fallback} · ${ui.table.caption}`}
              patterns={countOrdered}
              selected={selected}
              extras={orbitalExtras}
              ui={ui}
              onSelect={selectPattern}
            />
          )}
        </section>
      )}

      {tab === 'pca' && (
        <section
          id={panelId('pca')}
          role="tabpanel"
          aria-labelledby={tabButtonId('pca')}
          className="deep-section"
          tabIndex={0}
        >
          <div className="deep-sectionhead">
            <div>
              <span className="deep-tag">{ui.pca.badge}</span>
              <p className="deep-note">{ui.pca.note}</p>
            </div>
            {tableButton('pca', ui.table.view)}
          </div>

          <div className="deep-chart">
            <dl className="deep-params mono">
              <div>
                <dt>PC1</dt>
                <dd>{(layouts.pca.explained_variance[0] * 100).toFixed(2)}%</dd>
              </div>
              <div>
                <dt>PC2</dt>
                <dd>{(layouts.pca.explained_variance[1] * 100).toFixed(2)}%</dd>
              </div>
              <div>
                <dt>{ui.pca.notPlotted}</dt>
                <dd>{(layouts.pca.explained_variance[2] * 100).toFixed(2)}%</dd>
              </div>
              <div>
                <dt>{ui.pca.variance}</dt>
                <dd>
                  {(
                    (layouts.pca.explained_variance[0] + layouts.pca.explained_variance[1]) *
                    100
                  ).toFixed(2)}
                  %
                </dd>
              </div>
            </dl>
            {renderReadout()}
            <svg
              viewBox={`0 0 ${scatterWidth} ${scatterHeight}`}
              className="deep-scatter"
              role="group"
              aria-label={`${ui.tabs.pca}. ${ui.pca.note}`}
            >
              <title>{ui.tabs.pca}</title>
              <rect
                x={pcaFit.left}
                y={pcaFit.top}
                width={pcaFit.width}
                height={pcaFit.height}
                fill="none"
                stroke="var(--rule)"
              />
              {pcaFit.zeroX >= pcaFit.left && pcaFit.zeroX <= pcaFit.left + pcaFit.width && (
                <line
                  className="deep-axis-line"
                  x1={pcaFit.zeroX}
                  y1={pcaFit.top}
                  x2={pcaFit.zeroX}
                  y2={round2(pcaFit.top + pcaFit.height)}
                />
              )}
              {pcaFit.zeroY >= pcaFit.top && pcaFit.zeroY <= pcaFit.top + pcaFit.height && (
                <line
                  className="deep-axis-line"
                  x1={pcaFit.left}
                  y1={pcaFit.zeroY}
                  x2={round2(pcaFit.left + pcaFit.width)}
                  y2={pcaFit.zeroY}
                />
              )}
              <text
                className="deep-axis-title"
                x={round2(pcaFit.left + pcaFit.width / 2)}
                y={round2(Math.min(scatterHeight - 10, pcaFit.top + pcaFit.height + 30))}
                textAnchor="middle"
              >
                {ui.pca.axis1}
              </text>
              <text
                className="deep-axis-title"
                x={round2(Math.max(18, pcaFit.left - 30))}
                y={round2(pcaFit.top + pcaFit.height / 2)}
                textAnchor="middle"
                transform={`rotate(-90 ${round2(Math.max(18, pcaFit.left - 30))} ${round2(pcaFit.top + pcaFit.height / 2)})`}
              >
                {ui.pca.axis2}
              </text>
              {pcaFit.points.map((point) => (
                <PlotNode
                  key={point.pattern.bits}
                  pattern={point.pattern}
                  x={point.sx}
                  y={point.sy}
                  selected={selected === point.pattern.bits}
                  hovered={hoverNode === point.pattern.bits}
                  showLabel={point.pattern.count >= 25}
                  ariaLabel={ariaFor(point.pattern)}
                  labelUnit={c.ledgerUi.papers}
                  canvasWidth={scatterWidth}
                  onSelect={selectPattern}
                  onHover={handleHoverNode}
                />
              ))}
            </svg>
            <Legend ui={ui} />
          </div>

          {openTable.pca && (
            <PatternTable
              lang={lang}
              id="deep-table-pca"
              caption={`${ui.tabs.pca} · ${ui.table.caption}`}
              patterns={countOrdered}
              selected={selected}
              extras={pcaExtras}
              ui={ui}
              onSelect={selectPattern}
            />
          )}
        </section>
      )}
    </div>
  );
}
