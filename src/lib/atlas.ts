import atlasJson from '../../public/atlas/v1/atlas.json';
import type { Atlas } from './types';

export const atlas = atlasJson as Atlas;

export const bitLabels: Record<string, string> = {
  E: 'explicit_object',
  C: 'object_consumed',
  T: 'training_signal',
  A: 'agent_loop',
  X: 'external_tool',
  B: 'pos_before',
  I: 'pos_inner',
  F: 'pos_after',
};

export const bitOrder = ['E', 'C', 'T', 'A', 'X', 'B', 'I', 'F'];

export function shortBits(bits: string): string[] {
  return bits.split('');
}

export function arxivUrl(id: string): string | null {
  return /^\d{4}\.\d{4,5}$/.test(id) ? `https://arxiv.org/abs/${id}` : null;
}

export function paperById(id: string) {
  return atlas.papers.find((p) => p.id === id);
}
