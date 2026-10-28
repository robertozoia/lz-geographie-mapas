// Choose category, class list or everything, region and difficulty before a round.
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t } from '../../i18n.js';
import { stage } from '../stage.js';
import { chips, backButton, starsText, categoryOptions } from '../components.js';
import { CONTINENTS, pool, hasClassList } from '../../data.js';
import { stars, maxTierFor } from '../../game/engine.js';

app.register('setup', ({ mode }) => {
  const p = app.profile;
  const last = p.last[mode] ?? {};
  const config = {
    mode,
    cat: mode === 'capitals' ? 'capital' : last.cat ?? 'country',
    cont: last.cont ?? 'world',
    diff: last.diff ?? 'auto',
    // categories with a school worksheet default to its list
    list: last.list ?? 'school',
  };
  stage.setIdle(false);
  stage.showControls(true);

  const listBox = h('div');
  const regionBox = h('div');
  const countEl = h('p', { class: 'subtle count' });

  const refresh = () => {
    const list = hasClassList(config.cat) ? config.list : 'all';
    listBox.replaceChildren(...(!hasClassList(config.cat) ? [] : [
      h('h3', {}, t('setup.list')),
      chips(['school', 'all'].map((l) => ({ value: l, label: t('list.' + l) })), list, (v) => { config.list = v; refresh(); }),
    ]));
    if (!pool(config.cat, config.cont, 3, list).length) config.cont = 'world';
    stage.setStyle({ cat: config.cat === 'capital' && mode === 'capitals' ? 'country' : config.cat, mastery: null });
    regionBox.replaceChildren(chips(
      ['world', ...CONTINENTS]
        .filter((c) => pool(config.cat, c, 3, list).length > 0)
        .map((c) => ({ value: c, label: t('cont.' + c), extra: starsText(stars(p, config.cat, c)) })),
      config.cont,
      (v) => { config.cont = v; stage.view(v); refresh(); },
      { className: 'regions' },
    ));
    const maxTier = maxTierFor(p, { ...config, list });
    countEl.textContent = t('setup.count', { n: pool(config.cat, config.cont, maxTier, list).length });
  };

  const start = () => {
    p.last[mode] = { cat: config.cat, cont: config.cont, diff: config.diff, list: config.list };
    app.save();
    app.go('game', { config: { ...config, list: hasClassList(config.cat) ? config.list : 'all' } });
  };

  mount(h('section', { class: 'panel panel-side' },
    backButton(() => app.go('home')),
    h('h1', {}, t('mode.' + mode)),
    h('p', { class: 'subtle' }, t(`mode.${mode}.desc`)),
    mode === 'capitals' ? null : [
      h('h3', {}, t('setup.category')),
      chips(categoryOptions(), config.cat, (v) => { config.cat = v; refresh(); }),
    ],
    listBox,
    h('h3', {}, t('setup.region')),
    regionBox,
    h('h3', {}, t('setup.difficulty')),
    chips(['auto', '1', '2', '3'].map((d) => ({ value: d, label: t('diff.' + d) })), String(config.diff),
      (v) => { config.diff = v; refresh(); }),
    countEl,
    h('button', { class: 'btn primary big', onclick: start }, t('setup.start')),
  ));
  refresh();
  stage.view(config.cont);
});
