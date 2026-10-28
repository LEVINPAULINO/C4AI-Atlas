import layoutsJson from '../../public/atlas/v1/layouts.json';

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

/**
 * Round generated geometry before rendering. Transient math functions can
 * differ in the last bit between the Node server and the browser, which makes
 * React report a hydration mismatch on SVG attributes.
 */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type CoordMap = Record<string, number[]>;

export type LayoutsFile = {
  seed: number;
  n_patterns: number;
  pca: {
    explained_variance: number[];
    coords: CoordMap;
  };
  umap: {
    n_neighbors: number;
    min_dist: number;
    metric: string;
    trustworthiness: number;
    coords: CoordMap;
  };
};

export const layouts = layoutsJson as LayoutsFile;

export const modalPattern = '11100010';

export type BitEdge = {
  a: string;
  b: string;
  index: number;
};

export function hammingDistance(a: string, b: string): number {
  let distance = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    if (a[i] !== b[i]) distance += 1;
  }
  return distance + Math.abs(a.length - b.length);
}

/**
 * Exact one-bit adjacency over the observed patterns only.
 * Patterns that would require an unobserved neighbour are not invented.
 */
export function hammingEdges(bitsList: string[]): BitEdge[] {
  const observed = new Set(bitsList);
  const seen = new Set<string>();
  const edges: BitEdge[] = [];

  for (const source of bitsList) {
    for (let i = 0; i < source.length; i += 1) {
      const flipped = `${source.slice(0, i)}${source[i] === '1' ? '0' : '1'}${source.slice(i + 1)}`;
      if (!observed.has(flipped)) continue;
      const a = source < flipped ? source : flipped;
      const b = source < flipped ? flipped : source;
      const key = `${a}|${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a, b, index: i });
    }
  }

  return edges.sort((x, y) => x.a.localeCompare(y.a) || x.index - y.index);
}

export type RingPoint = {
  bits: string;
  ring: number;
  angle: number;
  x: number;
  y: number;
};

type RingOptions = {
  center?: number;
  innerRadius?: number;
  outerRadius?: number;
};

/**
 * Deterministic concentric-ring layout.
 *
 * Ring is BFS distance from the root pattern in the exact one-bit graph.
 * Within a ring, nodes are sorted by their bit string and placed at fixed
 * angular intervals. No force simulation and no random seed are involved.
 */
export function ringLayout(
  bitsList: string[],
  root: string = modalPattern,
  options: RingOptions = {},
): RingPoint[] {
  const center = options.center ?? 500;
  const innerRadius = options.innerRadius ?? 68;
  const outerRadius = options.outerRadius ?? 430;
  const observed = new Set(bitsList);
  const adjacency = new Map<string, string[]>();

  for (const bits of bitsList) {
    const neighbours: string[] = [];
    for (let i = 0; i < bits.length; i += 1) {
      const flipped = `${bits.slice(0, i)}${bits[i] === '1' ? '0' : '1'}${bits.slice(i + 1)}`;
      if (observed.has(flipped)) neighbours.push(flipped);
    }
    adjacency.set(bits, neighbours);
  }

  const distance = new Map<string, number>();
  if (observed.has(root)) {
    distance.set(root, 0);
    const queue: string[] = [root];
    for (let head = 0; head < queue.length; head += 1) {
      const bits = queue[head];
      const next = distance.get(bits)! + 1;
      for (const neighbour of adjacency.get(bits) ?? []) {
        if (distance.has(neighbour)) continue;
        distance.set(neighbour, next);
        queue.push(neighbour);
      }
    }
  }

  const maxRing = Math.max(0, ...Array.from(distance.values()));
  const rings = new Map<number, string[]>();

  for (const bits of bitsList) {
    // A disconnected node should be visible, not silently dropped.
    const ring = distance.get(bits) ?? maxRing + 1;
    const list = rings.get(ring) ?? [];
    list.push(bits);
    rings.set(ring, list);
  }

  const highestRing = Math.max(maxRing, ...Array.from(rings.keys()));
  const radiusFor = (ring: number) => {
    if (ring === 0) return 0;
    if (highestRing <= 1) return innerRadius;
    return innerRadius + ((ring - 1) / (highestRing - 1)) * (outerRadius - innerRadius);
  };

  const points: RingPoint[] = [];
  for (const ring of Array.from(rings.keys()).sort((a, b) => a - b)) {
    const list = (rings.get(ring) ?? []).slice().sort((a, b) => a.localeCompare(b));
    const radius = radiusFor(ring);
    list.forEach((bits, index) => {
      const angle = ring === 0 ? 0 : -Math.PI / 2 + ((index + 0.5) / list.length) * Math.PI * 2;
      points.push({
        bits,
        ring,
        angle,
        x: round2(center + Math.cos(angle) * radius),
        y: round2(center + Math.sin(angle) * radius),
      });
    });
  }

  return points;
}

export function normalize360(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}
