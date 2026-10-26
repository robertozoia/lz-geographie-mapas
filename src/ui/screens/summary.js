// End-of-round summary: score, misses to review, new badges.
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t, name, kindLabel } from '../../i18n.js';
import { stage } from '../stage.js';
import { sfx } from '../audio.js';
import { confetti } from '../confetti.js';
import { BADGE_ICONS } from './badges.js';

app.register('summary', ({ round, badges }) => {
  const results = round.results;
  const correct = results.filter((r) => r.correct).length;
  const misses = results.filter((r) => !r.correct);
  stage.setIdle(false);
  stage.showControls(true);

  sfx.finish();
  if (correct >= Math.ceil(results.length * 0.8)) setTimeout(() => confetti(), 200);
  if (badges.length) setTimeout(() => sfx.badge(), 900);

  // the item to review is the one shown on the map for that question
  const reviewItem = (q) => (q.type === 'capitalOf' ? q.target : q.type === 'countryOf' ? q.capital : q.target);
  const showOnMap = (q) => {
    const items = q.type === 'capitalOf' || q.type === 'countryOf'
      ? [{ item: q.country ?? q.target, style: 'answer' }, { item: q.capital ?? q.target, style: 'correct' }]
      : [{ item: q.target, style: 'answer' }];
    stage.setHighlights(items);
    stage.focusItem(items[0].item);
  };

  mount(h('section', { class: 'panel panel-side' },
    h('h1', {}, t('sum.title')),
    h('div', { class: 'summary-score' },
      h('div', { class: 'big-number' }, `⭐ ${round.score}`),
      h('div', {}, t('sum.correct', { c: correct, n: results.length }))),
    badges.length ? h('div', { class: 'new-badges' },
      h('h3', {}, t('sum.newBadge')),
      badges.map((b) => h('div', { class: 'badge earned pop' },
        h('span', { class: 'badge-icon' }, BADGE_ICONS[b]),
        h('div', {}, h('strong', {}, t('badge.' + b)), h('div', { class: 'subtle' }, t(`badge.${b}.desc`)))))) : null,
    misses.length ? [
      h('h3', {}, t('sum.review')),
      h('div', { class: 'review-list' }, misses.map((r) => {
        const q = r.question;
        const item = reviewItem(q);
        const extra = q.type === 'capitalOf' || q.type === 'countryOf' ? ` · ${name(q.country ?? q.target)}` : '';
        return h('button', { class: 'review-item', onclick: () => showOnMap(q) },
          h('span', { class: 'review-kind' }, kindLabel(item)),
          h('span', {}, name(item), extra));
      })),
    ] : null,
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => app.go('home') }, t('sum.menu')),
      h('button', { class: 'btn primary', onclick: () => app.go('game', { config: round.config }) }, t('sum.again'))),
  ));
});
