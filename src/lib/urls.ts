const rawBase = import.meta.env.BASE_URL || '/';
const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

/**
 * Prefix a root-absolute site path with the configured GitHub Pages base.
 * withBase('/download/') -> '/c4ai-atlas/download/' when BASE_URL is '/c4ai-atlas/'.
 */
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  if (base && (path === base || path.startsWith(`${base}/`))) return path;
  return `${base}${path}` || '/';
}

/** Path for a page in a given language, with the deployment base applied. */
export function localeHref(lang: 'en' | 'zh', path: string): string {
  if (path === '/') return withBase(lang === 'zh' ? '/zh-Hans/' : '/');
  return withBase(lang === 'zh' ? `/zh-Hans${path}` : path);
}
