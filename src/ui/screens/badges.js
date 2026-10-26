// Badge collection.
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t } from '../../i18n.js';
import { stage } from '../stage.js';
import { backButton } from '../components.js';
import { BADGES } from '../../game/engine.js';

export const BADGE_ICONS = {
  first: '👣', perfect: '💯', streak25: '🔥', world: '🌍', allcats: '🧭', explorer: '🔭',
  countries: '🛂', capitals: '🏛️', rivers: '🌊', seas: '⚓', ranges: '⛰️',
};

app.register('badges', () => {
  const p = app.profile;
  stage.setIdle(true);
  mount(h('section', { class: 'panel panel-side' },
    backButton(() => app.go('home')),
    h('h1', {}, t('home.badges')),
    h('div', { class: 'badge-grid' }, BADGES.map((b) => h('div', { class: 'badge' + (p.badges[b] ? ' earned' : '') },
      h('span', { class: 'badge-icon' }, p.badges[b] ? BADGE_ICONS[b] : '🔒'),
      h('div', {}, h('strong', {}, t('badge.' + b)), h('div', { class: 'subtle' }, t(`badge.${b}.desc`)))))),
  ));
});
