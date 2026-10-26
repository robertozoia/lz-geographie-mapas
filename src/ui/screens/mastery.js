// "My map": the map coloured by how well each place is known.
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t } from '../../i18n.js';
import { stage } from '../stage.js';
import { chips, backButton, starsText } from '../components.js';
import { CATS, CONTINENTS, pool } from '../../data.js';
import { isLearned } from '../../game/srs.js';
import { stars } from '../../game/engine.js';
import { BOX_COLORS } from '../../render/mapPainter.js';
import { explorePicking } from './explore.js';

app.register('mastery', () => {
  const p = app.profile;
  let cat = 'country';
  stage.setIdle(false);
  stage.showControls(true);

  const statsEl = h('div', { class: 'mastery-stats' });
  const cardHost = h('div', { class: 'card-host' });
  const reset = explorePicking(() => cat, cardHost);

  const refresh = () => {
    stage.setStyle({ cat, mastery: p.progress });
    const all = pool(cat);
    const learned = all.filter((i) => isLearned(p.progress, i.id)).length;
    statsEl.replaceChildren(
      h('div', { class: 'mastery-total' }, t('mastery.learned', { k: learned, n: all.length })),
      h('div', { class: 'mastery-rows' }, CONTINENTS.filter((c) => pool(cat, c).length).map((c) => {
        const items = pool(cat, c);
        const k = items.filter((i) => isLearned(p.progress, i.id)).length;
        return h('div', { class: 'mastery-row' },
          h('span', { class: 'mastery-cont' }, t('cont.' + c)),
          h('span', { class: 'bar' }, h('span', { class: 'bar-fill', style: { width: `${(100 * k) / items.length}%` } })),
          h('span', { class: 'stars' }, starsText(stars(p, cat, c))));
      })));
  };

  mount(h('section', { class: 'explore' },
    h('header', { class: 'topbar' },
      backButton(() => { document.body.style.cursor = ''; app.go('home'); }),
      h('h1', {}, t('home.mastery')),
      chips(CATS.map((c) => ({ value: c, label: t('cat.' + c) })), cat, (v) => {
        cat = v;
        reset();
        stage.setHighlights([]);
        stage.setMarkers([]);
        cardHost.replaceChildren();
        refresh();
      })),
    h('aside', { class: 'panel mastery-panel' },
      statsEl,
      h('div', { class: 'legend' }, BOX_COLORS.map((c, i) => h('div', { class: 'legend-item' },
        h('span', { class: 'swatch', style: { background: c } }), t('box.' + i))))),
    h('div', { class: 'bottom' }, cardHost),
  ));
  refresh();
  stage.view('world');
});
