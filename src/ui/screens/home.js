// Main menu for the active profile.
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t } from '../../i18n.js';
import { stage } from '../stage.js';
import { sfx } from '../audio.js';

const MODES = [
  { id: 'explore', icon: '🧭' },
  { id: 'find', icon: '📍' },
  { id: 'name', icon: '💡' },
  { id: 'capitals', icon: '🏛️' },
];

app.register('home', () => {
  const p = app.profile;
  if (!p) return app.go('profiles');
  stage.setIdle(true);
  stage.showControls(true);
  stage.setStyle({ cat: 'country', mastery: null });
  stage.view('world');

  const go = (screen, params) => () => { sfx.click(); app.go(screen, params); };
  const modeCards = MODES.map((m) => h('button', {
    class: 'mode-card',
    onclick: go(m.id === 'explore' ? 'explore' : 'setup', { mode: m.id }),
  },
  h('span', { class: 'mode-icon' }, m.icon),
  h('span', { class: 'mode-title' }, t('mode.' + m.id)),
  h('span', { class: 'mode-desc' }, t(`mode.${m.id}.desc`))));

  const badgeCount = Object.keys(p.badges).length;
  mount(h('section', { class: 'panel panel-side' },
    h('div', { class: 'home-head' },
      h('span', { class: 'avatar big' }, p.avatar),
      h('div', {},
        h('h1', {}, t('home.hello', { name: p.name })),
        h('div', { class: 'home-stats' },
          h('span', {}, '⭐ ', p.stats.points.toLocaleString(), ' ', t('hud.points')),
          h('span', {}, '🔥 ', p.stats.bestStreak),
          h('span', {}, '🏅 ', badgeCount)))),
    h('h2', { class: 'subtle' }, t('home.pick')),
    h('div', { class: 'mode-grid' }, modeCards),
    h('div', { class: 'home-links' },
      h('button', { class: 'link-card', onclick: go('mastery') }, h('span', {}, '🗺️'), t('home.mastery')),
      h('button', { class: 'link-card', onclick: go('badges') }, h('span', {}, '🏅'), t('home.badges')),
      h('button', { class: 'link-card', onclick: go('settings') }, h('span', {}, '⚙️'), t('home.settings')),
      h('button', { class: 'link-card', onclick: go('profiles') }, h('span', {}, '👥'), t('home.switch'))),
  ));
});
