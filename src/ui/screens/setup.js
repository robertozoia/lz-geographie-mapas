// Choose category, region and difficulty before a round.
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t } from '../../i18n.js';
import { stage } from '../stage.js';
import { chips, backButton, starsText } from '../components.js';
import { CATS, CONTINENTS, pool } from '../../data.js';
import { stars, autoTier } from '../../game/engine.js';

app.register('setup', ({ mode }) => {
  const p = app.profile;
  const last = p.last[mode] ?? {};
  const config = {
    mode,
    cat: mode === 'capitals' ? 'capital' : last.cat ?? 'country',
    cont: last.cont ?? 'world',
    diff: last.diff ?? 'auto',
  };
  stage.setIdle(false);
  stage.showControls(true);

  const regionBox = h('div');
  const countEl = h('p', { class: 'subtle count' });

  const refresh = () => {
    if (!pool(config.cat, config.cont).length) config.cont = 'world';
    stage.setStyle({ cat: config.cat === 'capital' && mode === 'capitals' ? 'country' : config.cat, mastery: null });
    regionBox.replaceChildren(chips(
      ['world', ...CONTINENTS]
        .filter((c) => pool(config.cat, c).length > 0)
        .map((c) => ({ value: c, label: t('cont.' + c), extra: starsText(stars(p, config.cat, c)) })),
      config.cont,
      (v) => { config.cont = v; stage.view(v); refresh(); },
      { className: 'regions' },
    ));
    const maxTier = config.diff === 'auto' ? autoTier(p.progress, config.cat, config.cont) : Number(config.diff);
    countEl.textContent = t('setup.count', { n: pool(config.cat, config.cont, maxTier).length });
  };

  const start = () => {
    p.last[mode] = { cat: config.cat, cont: config.cont, diff: config.diff };
    app.save();
    app.go('game', { config });
  };

  mount(h('section', { class: 'panel panel-side' },
    backButton(() => app.go('home')),
    h('h1', {}, t('mode.' + mode)),
    h('p', { class: 'subtle' }, t(`mode.${mode}.desc`)),
    mode === 'capitals' ? null : [
      h('h3', {}, t('setup.category')),
      chips(CATS.map((c) => ({ value: c, label: t('cat.' + c) })), config.cat, (v) => { config.cat = v; refresh(); }),
    ],
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
