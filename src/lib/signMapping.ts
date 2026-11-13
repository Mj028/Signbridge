import { LIBRARY } from '../data/library';
import { MOTIONS, type Motion } from '../data/motions';
import type { LibraryEntry } from '../types';

/**
 * Message → sign items.
 *
 * This is deliberately a phrase *lookup*, not a translation. English word order is not NSL
 * grammar, so anything without library content produces an honest fallback item instead of an
 * invented sign. A future version would replace this with a linguist-reviewed translation layer.
 */

export type SignItem =
  | { kind: 'sign'; text: string; entry: LibraryEntry; motion: Motion; duration: number }
  | {
      kind: 'fallback';
      text: string;
      reason: 'awaiting' | 'unmapped';
      entry?: LibraryEntry;
      duration: number;
    };

export const FALLBACK_MS = 1700;

const norm = (s: string) => s.toLowerCase().replace(/[’]/g, "'");
const tokenize = (s: string) => s.match(/[A-Za-z0-9'’]+/g) ?? [];

const TOKENISED = LIBRARY.map((entry) => ({
  entry,
  words: tokenize(norm(entry.phrase)),
})).sort((a, b) => b.words.length - a.words.length);

export function mapMessageToSigns(message: string): SignItem[] {
  const original = tokenize(message);
  const words = original.map(norm);
  const items: SignItem[] = [];
  let unmapped: string[] = [];

  const flush = () => {
    if (unmapped.length) {
      items.push({
        kind: 'fallback',
        text: unmapped.join(' '),
        reason: 'unmapped',
        duration: FALLBACK_MS,
      });
      unmapped = [];
    }
  };

  let i = 0;
  while (i < words.length) {
    const hit = TOKENISED.find(
      ({ words: w }) => w.length > 0 && w.every((word, j) => words[i + j] === word),
    );
    if (!hit) {
      unmapped.push(original[i]);
      i++;
      continue;
    }
    flush();
    const text = original.slice(i, i + hit.words.length).join(' ');
    const motion = hit.entry.motionId ? MOTIONS[hit.entry.motionId] : undefined;
    if (motion) {
      items.push({ kind: 'sign', text, entry: hit.entry, motion, duration: motion.duration });
    } else {
      items.push({
        kind: 'fallback',
        text,
        reason: 'awaiting',
        entry: hit.entry,
        duration: FALLBACK_MS,
      });
    }
    i += hit.words.length;
  }
  flush();
  return items;
}

export const itemsKey = (items: SignItem[]) =>
  items.map((i) => `${i.kind}:${i.text}`).join('|');
