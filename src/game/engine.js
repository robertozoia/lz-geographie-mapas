// Round generation, answer checking, scoring, progress and badges.
import { geoDistance } from 'd3-geo';
import { pool, itemById, quizItems, CATS, CONTINENTS } from '../data.js';
import { review, weight, weightedSample, isLearned } from './srs.js';
import { distanceKm } from '../render/picking.js';
import { normalize } from '../i18n.js';

export const ROUND_LENGTH = 10;

// Highest tier offered in "automatic" difficulty: start with tier 1 and open
// harder tiers once half of the easier ones are learned.
export function autoTier(progress, cat, cont) {
  for (const tier of [1, 2]) {
    const items = pool(cat, cont).filter((i) => i.t === tier);
    if (items.length < 4) continue;
    const learned = items.filter((i) => isLearned(progress, i.id)).length;
    if (learned / items.length < 0.5) return tier;
  }
  return 3;
}

function roundPool(profile, cat, cont, diff) {
  let maxTier = diff === 'auto' ? autoTier(profile.progress, cat, cont) : Number(diff);
  let items = pool(cat, cont, maxTier);
  // small regions (e.g. rivers of Oceania) may need harder tiers to fill a round
  while (items.length < Math.min(ROUND_LENGTH, pool(cat, cont).length) && maxTier < 3) {
    items = pool(cat, cont, ++maxTier);
  }
  return items;
}

// Three plausible wrong answers: same category, nearby, distinct names.
export function distractors(target, lang, rand = Math.random) {
  const taken = new Set([normalize(target.n[lang])]);
  const candidates = quizItems
    .filter((i) => i.cat === target.cat && i.id !== target.id)
    .map((i) => ({ i, d: geoDistance(i.ll, target.ll) * (0.7 + rand() * 0.6) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 9);
  const out = [];
  for (const { i } of candidates.sort(() => rand() - 0.5)) {
    const key = normalize(i.n[lang]);
    if (taken.has(key)) continue;
    taken.add(key);
    out.push(i);
    if (out.length === 3) break;
  }
  return out;
}

const shuffle = (list, rand = Math.random) => list.map((x) => [rand(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

export function makeRound(profile, config) {
  const { mode, cont, diff } = config;
  const cat = mode === 'capitals' ? 'capital' : config.cat;
  let items = roundPool(profile, cat, cont, diff);
  // capitals rounds are built from the countries the capitals belong to
  if (mode === 'capitals') items = items.map((c) => itemById.get(c.of));
  const now = Date.now();
  const picked = weightedSample(items, Math.min(ROUND_LENGTH, items.length),
    (i) => weight(profile.progress[mode === 'capitals' ? i.cap : i.id], now));

  // Capital questions in both directions train the capital item.
  const questions = picked.map((item) => {
    if (mode === 'find') return { type: 'find', target: item, track: item.id };
    if (mode === 'name') {
      return { type: 'name', target: item, track: item.id, options: shuffle([item, ...distractors(item, profile.lang)]) };
    }
    const capital = itemById.get(item.cap);
    return Math.random() < 0.5
      ? { type: 'capitalOf', target: capital, country: item, track: capital.id, options: shuffle([capital, ...distractors(capital, profile.lang)]) }
      : { type: 'countryOf', target: item, capital, track: capital.id };
  });
  return { config: { ...config, cat }, questions, index: 0, score: 0, results: [], startedAt: now };
}

// Click tolerance in km for point and line targets, on top of the on-screen
// pick tolerance.
const NEAR_KM = { capital: 120, river: 80 };

// Check a map answer. `picked` are the items under the click (from pick()).
export function checkMapAnswer(question, lon, lat, picked, seconds) {
  const target = question.target;
  const km = distanceKm(target, lon, lat);
  const correct = picked.some((i) => i.id === target.id) || km <= (NEAR_KM[target.cat] ?? 0);
  const points = correct ? 100 + speedBonus(seconds) : Math.round(50 * Math.max(0, 1 - km / 2000));
  return { correct, points, km: Math.round(km), picked: picked.find((i) => i.cat === target.cat) ?? null };
}

export function checkChoice(question, item, seconds) {
  const correct = item.id === question.target.id;
  return { correct, points: correct ? 100 + speedBonus(seconds) : 0, chosen: item };
}

const speedBonus = (seconds) => Math.max(0, Math.round(50 - seconds * 5));

// Record an answer in the round and the profile.
export function recordAnswer(profile, round, question, result) {
  round.results.push({ question, ...result });
  round.score += result.points;
  profile.progress[question.track] = review(profile.progress[question.track], result.correct);
  const s = profile.stats;
  s.streak = result.correct ? s.streak + 1 : 0;
  s.bestStreak = Math.max(s.bestStreak, s.streak);
  s.points += result.points;
}

export const BADGES = ['first', 'perfect', 'streak25', 'world', 'allcats', 'explorer', 'countries', 'capitals', 'rivers', 'seas', 'ranges'];

const learnedCount = (profile, cat) => quizItems.filter((i) => i.cat === cat && isLearned(profile.progress, i.id)).length;

// Finish a round: update stats and return newly earned badge ids.
export function finishRound(profile, round) {
  const s = profile.stats;
  s.rounds++;
  const cat = round.config.mode === 'capitals' ? 'capital' : round.config.cat;
  if (!s.cats.includes(cat)) s.cats.push(cat);
  if (round.config.cont !== 'world' && !s.conts.includes(round.config.cont)) s.conts.push(round.config.cont);
  const perfect = round.results.length >= ROUND_LENGTH && round.results.every((r) => r.correct);
  return awardBadges(profile, { perfect });
}

export function awardBadges(profile, { perfect = false } = {}) {
  const s = profile.stats;
  const earned = {
    first: s.rounds >= 1,
    perfect,
    streak25: s.bestStreak >= 25,
    world: CONTINENTS.every((c) => s.conts.includes(c)),
    allcats: CATS.every((c) => s.cats.includes(c)),
    explorer: s.explored.length >= 50,
    countries: learnedCount(profile, 'country') >= 50,
    capitals: learnedCount(profile, 'capital') >= 25,
    rivers: learnedCount(profile, 'river') >= 15,
    seas: learnedCount(profile, 'sea') >= 15,
    ranges: learnedCount(profile, 'range') >= 15,
  };
  const fresh = BADGES.filter((b) => earned[b] && !profile.badges[b]);
  for (const b of fresh) profile.badges[b] = Date.now();
  return fresh;
}

// 0–3 stars for a category in a region, from the share of learned items.
export function stars(profile, cat, cont) {
  const items = pool(cat, cont);
  if (!items.length) return 0;
  const share = items.filter((i) => isLearned(profile.progress, i.id)).length / items.length;
  return share >= 0.9 ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
}
