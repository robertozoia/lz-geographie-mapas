import { describe, it, expect } from 'vitest';
import { pick, distanceKm } from '../src/render/picking.js';
import { items, itemById, CATS } from '../src/data.js';
import { review, weightedSample } from '../src/game/srs.js';
import { normalize } from '../src/i18n.js';
import { makeRound, distractors, checkMapAnswer, autoTier } from '../src/game/engine.js';

const ids = (list) => list.map((i) => i.id);

describe('picking', () => {
  it('finds countries by point', () => {
    expect(ids(pick(13.4, 52.5, 0.5, ['country']))).toContain('c:DEU');
    expect(ids(pick(-58.4, -34.6, 0.5, ['country']))).toContain('c:ARG');
    expect(ids(pick(2.35, 48.85, 0.5, ['country']))).not.toContain('c:DEU');
  });
  it('finds tiny countries with a tolerance circle', () => {
    expect(ids(pick(12.45, 43.94, 0.3, ['country']))[0]).toBe('c:SMR');
  });
  it('finds rivers near a click', () => {
    expect(ids(pick(31.2, 30.0, 0.5, ['river']))).toContain('r:nile');
    expect(ids(pick(7.6, 50.4, 0.3, ['river']))).toContain('r:rhine');
  });
  it('finds seas and oceans', () => {
    expect(ids(pick(-30, 30, 0.5, ['sea']))).toContain('s:atlantic');
    expect(ids(pick(18, 35, 0.5, ['sea']))).toContain('s:mediterranean');
    expect(ids(pick(15, 43, 0.5, ['sea']))).toEqual(expect.arrayContaining(['s:adriatic', 's:mediterranean']));
    // the more specific sea comes first
    expect(ids(pick(15, 43, 0.5, ['sea']))[0]).toBe('s:adriatic');
  });
  it('finds mountain ranges', () => {
    expect(ids(pick(10, 46.5, 0.3, ['range']))).toContain('m:alps');
    expect(ids(pick(-70, -30, 0.3, ['range']))).toContain('m:andes');
  });
  it('finds capitals within tolerance', () => {
    expect(ids(pick(-3.7, 40.42, 0.3, ['capital']))[0]).toBe('k:ESP');
  });
  it('measures distance to a target', () => {
    const de = itemById.get('c:DEU');
    expect(distanceKm(de, 13.4, 52.5)).toBe(0);
    expect(distanceKm(itemById.get('k:FRA'), 13.4, 52.5)).toBeGreaterThan(800);
  });
});

describe('catalog', () => {
  it('has names in all three languages for every item', () => {
    for (const i of items) for (const l of ['en', 'es', 'de']) expect(i.n[l], `${i.id} ${l}`).toBeTruthy();
  });
  it('has every category', () => {
    for (const c of CATS) expect(items.filter((i) => i.cat === c).length).toBeGreaterThan(30);
  });
  it('links capitals and countries both ways', () => {
    for (const i of items.filter((x) => x.cat === 'capital')) expect(itemById.get(i.of).cap).toBe(i.id);
  });
});

describe('srs', () => {
  it('moves boxes up on success and back to 1 on failure', () => {
    let e = review(undefined, true);
    expect(e.b).toBe(1);
    e = review(review(review(e, true), true), true);
    expect(e.b).toBe(4);
    e = review(review(e, true), true);
    expect(e.b).toBe(5);
    expect(review(e, false).b).toBe(1);
  });
  it('samples distinct elements', () => {
    const s = weightedSample([1, 2, 3, 4, 5], 5, () => 1);
    expect(new Set(s).size).toBe(5);
  });
});

describe('i18n', () => {
  it('normalizes accents, case and ß', () => {
    expect(normalize('Österreich')).toBe(normalize('osterreich'));
    expect(normalize('Großbritannien')).toBe('grossbritannien');
    expect(normalize('Bogotá')).toBe('bogota');
  });
});

describe('engine', () => {
  const profile = () => ({ lang: 'es', progress: {}, stats: { streak: 0, bestStreak: 0, points: 0 } });
  it('builds rounds for every mode and category', () => {
    for (const cat of CATS) {
      for (const mode of ['find', 'name']) {
        const r = makeRound(profile(), { mode, cat, cont: 'world', diff: 'auto' });
        expect(r.questions.length).toBe(10);
        if (mode === 'name') for (const q of r.questions) expect(q.options.length).toBe(4);
      }
    }
    const r = makeRound(profile(), { mode: 'capitals', cat: 'capital', cont: 'eu', diff: '3' });
    expect(r.questions.length).toBe(10);
    for (const q of r.questions) expect(q.track.startsWith('k:')).toBe(true);
  });
  it('fills small regions from harder tiers', () => {
    const r = makeRound(profile(), { mode: 'find', cat: 'river', cont: 'oc', diff: 'auto' });
    expect(r.questions.length).toBe(3);
  });
  it('picks distinct, same-category distractors', () => {
    const target = itemById.get('c:FRA');
    const d = distractors(target, 'de');
    expect(d.length).toBe(3);
    expect(d.every((i) => i.cat === 'country' && i.id !== 'c:FRA')).toBe(true);
  });
  it('scores map answers by hit and distance', () => {
    const q = { type: 'find', target: itemById.get('k:ESP') };
    expect(checkMapAnswer(q, -3.7, 40.42, [], 2).correct).toBe(true);
    const far = checkMapAnswer(q, 2.35, 48.85, [], 2);
    expect(far.correct).toBe(false);
    expect(far.km).toBeGreaterThan(900);
  });
  it('starts automatic difficulty at tier 1', () => {
    expect(autoTier({}, 'country', 'world')).toBe(1);
  });
});
