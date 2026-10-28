import atlasRaw from '../../public/atlas/v1/atlas.json?raw';
import manifest from '../../public/atlas/v1/manifest.json';

export const dataVersion = manifest.version;
export const protocolVersion = manifest.protocol_version;
export const builtDate = manifest.built_at.slice(0, 10);
export const sha256 = manifest.sha256;
export const shaShort = `${sha256.slice(0, 12)}…`;
export const atlasBytes = new TextEncoder().encode(atlasRaw).length;
export const atlasKiB = (atlasBytes / 1024).toFixed(1);

export function pct(n: number, d: number, digits = 1): string {
  if (!d) return '—';
  return `${((n / d) * 100).toFixed(digits)}%`;
}

/** Wilson score interval for a binomial proportion, 95% by default. */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (!n) return [0, 0];
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(centre - margin) / denom, (centre + margin) / denom];
}

export function pctInterval(k: number, n: number): string {
  const [lo, hi] = wilson(k, n);
  return `${(lo * 100).toFixed(1)}–${(hi * 100).toFixed(1)}%`;
}

/**
 * Public quote cap: at most 25 words of verbatim text per quotation.
 * Longer strings in the snapshot are clipped here rather than shown in full.
 */
export function clipQuote(quote: string, maxWords = 25): string {
  const words = quote.trim().split(/\s+/);
  if (words.length <= maxWords) return quote.trim();
  return `${words.slice(0, maxWords).join(' ')} …`;
}

export function citationHref(id: string): string {
  if (id.startsWith('doi:')) return `https://doi.org/${id.slice(4)}`;
  if (id.startsWith('OpenAlex:')) return `https://openalex.org/${id.slice('OpenAlex:'.length)}`;
  if (id.startsWith('http')) return id;
  return '';
}

export function citationLabel(id: string): string {
  return id.replace(/^doi:/, 'doi:').replace(/^OpenAlex:/, 'OpenAlex:');
}
