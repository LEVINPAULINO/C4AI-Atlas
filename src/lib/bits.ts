export const BIT_META = [
  { key: 'E', en: 'explicit object', zh: '显式对象' },
  { key: 'C', en: 'downstream use', zh: '下游使用' },
  { key: 'T', en: 'training constraint', zh: '训练约束' },
  { key: 'A', en: 'agent loop', zh: 'Agent 闭环' },
  { key: 'X', en: 'external tool', zh: '外部工具' },
  { key: 'B', en: 'data stage', zh: '数据阶段' },
  { key: 'I', en: 'training stage', zh: '训练阶段' },
  { key: 'F', en: 'inference stage', zh: '推理阶段' },
] as const;

export function describeBits(bits: string, lang: 'en' | 'zh', full = false): string {
  const parts = bits.split('').map((b, i) => {
    const meta = BIT_META[i];
    if (!meta) return '';
    if (b === '1') return meta[lang];
    return full ? (lang === 'zh' ? `无${meta.zh}` : `no ${meta.en}`) : '';
  }).filter(Boolean);
  if (parts.length) return parts.join(' · ');
  return lang === 'zh' ? '全零编码' : 'all-zero code';
}

export function bitLegend(lang: 'en' | 'zh'): string {
  return BIT_META.map((m) => `${m.key} ${m[lang]}`).join(' · ');
}
