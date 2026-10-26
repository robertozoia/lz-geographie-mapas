// Leitner-box spaced repetition. Box 0 = never seen, 1 = needs practice …
// 5 = mastered. A correct answer moves an item up one box, a wrong answer
// sends it back to box 1.

export const MAX_BOX = 5;
export const LEARNED_BOX = 3;

// Relative chance of being asked, by box.
const BOX_WEIGHT = [5, 8, 5, 3, 1.5, 0.6];
const RECENT_MS = 3 * 60 * 1000;

export function review(entry = { b: 0, s: 0, k: 0, l: 0 }, correct, now = Date.now()) {
  return {
    b: correct ? Math.min(MAX_BOX, entry.b + 1) : 1,
    s: entry.s + 1,
    k: entry.k + (correct ? 1 : 0),
    l: now,
  };
}

export function weight(entry, now = Date.now()) {
  const box = entry?.b ?? 0;
  let w = BOX_WEIGHT[box];
  if (entry && now - entry.l < RECENT_MS) w *= 0.15;
  return w;
}

export const boxOf = (progress, id) => progress[id]?.b ?? 0;
export const isLearned = (progress, id) => boxOf(progress, id) >= LEARNED_BOX;

// Weighted random sample of `n` distinct elements.
export function weightedSample(list, n, weightOf, rand = Math.random) {
  const pool = list.map((x) => ({ x, w: weightOf(x) }));
  const out = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rand() * total;
    let i = 0;
    while (i < pool.length - 1 && (r -= pool[i].w) > 0) i++;
    out.push(pool[i].x);
    pool.splice(i, 1);
  }
  return out;
}
