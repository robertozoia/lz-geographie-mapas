// Explore: tap anything to see its name, hear it, and see related facts.
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t, name, kindLabel, speak, canSpeak } from '../../i18n.js';
import { stage } from '../stage.js';
import { chips, backButton } from '../components.js';
import { CATS, itemById } from '../../data.js';
import { pick } from '../../render/picking.js';
import { boxOf } from '../../game/srs.js';
import { BOX_COLORS } from '../../render/mapPainter.js';
import { awardBadges } from '../../game/engine.js';
import { toast } from '../components.js';
import { BADGE_ICONS } from './badges.js';
import { sfx } from '../audio.js';

// Card describing one item, in the player's language only.
export function infoCard(item, profile) {
  const lines = [];
  if (item.cap) lines.push(t('explore.capital', { name: name(itemById.get(item.cap)) }));
  if (item.of) lines.push(t('explore.capitalOf', { name: name(itemById.get(item.of)) }));
  if (item.part) lines.push(t('explore.partOf', { name: name(itemById.get(item.part)) }));
  if (item.currents?.length) lines.push(t('explore.currents', { names: item.currents.map((id) => name(itemById.get(id))).join(', ') }));
  if (item.kind === 'warm' || item.kind === 'cold') lines.push((item.kind === 'warm' ? '🔴 ' : '🔵 ') + t('kind.' + item.kind));
  lines.push(item.c.map((c) => t('cont.' + c)).join(' · '));
  const box = item.cat === 'territory' ? null : boxOf(profile.progress, item.id);
  return h('div', { class: 'info-card' },
    h('div', { class: 'info-kind' }, kindLabel(item)),
    h('div', { class: 'info-name' }, name(item),
      canSpeak() ? h('button', { class: 'icon-btn speak', onclick: () => speak(name(item)), 'aria-label': t('explore.speak') }, '🔊') : null),
    lines.map((l) => h('div', { class: 'info-line' }, l)),
    box == null ? null : h('div', { class: 'info-box' },
      h('span', { class: 'swatch', style: { background: BOX_COLORS[box] } }), t('box.' + box)));
}

// Shared tap/hover handling for Explore and My map.
export function explorePicking(getCat, cardHost, { onPick } = {}) {
  let selected = null;
  stage.handlers.click = (lon, lat, tol) => {
    const item = pick(lon, lat, tol, [getCat()])[0];
    selected = item ?? null;
    stage.setHighlights(item ? [{ item, style: 'target' }] : []);
    stage.setMarkers(item && (item.cat === 'capital' || (item.r ?? 0) < 1.5) ? [{ ll: item.ll, kind: 'pulse' }] : []);
    cardHost.replaceChildren(item ? infoCard(item, app.profile) : h('p', { class: 'subtle' }, t('explore.hint')));
    if (item) { sfx.click(); onPick?.(item); }
  };
  let hovered = null;
  stage.handlers.hover = (hit) => {
    const item = hit ? pick(hit[0], hit[1], hit[2], [getCat()])[0] : null;
    if (item === hovered) return;
    hovered = item;
    const list = selected ? [{ item: selected, style: 'target' }] : [];
    if (item && item !== selected) list.push({ item, style: 'hover' });
    stage.setHighlights(list);
    document.body.style.cursor = item ? 'pointer' : '';
  };
  return () => { selected = null; hovered = null; };
}

app.register('explore', () => {
  const p = app.profile;
  let cat = 'country';
  stage.setIdle(false);
  stage.showControls(true);
  stage.setStyle({ cat, mastery: null });

  const cardHost = h('div', { class: 'card-host' }, h('p', { class: 'subtle' }, t('explore.hint')));
  const reset = explorePicking(() => cat, cardHost, {
    onPick: (item) => {
      if (item.cat === 'territory' || p.stats.explored.includes(item.id)) return;
      p.stats.explored.push(item.id);
      for (const b of awardBadges(p)) {
        sfx.badge();
        toast(`${BADGE_ICONS[b]} ${t('sum.newBadge')} ${t('badge.' + b)}`);
      }
      app.save();
    },
  });

  mount(h('section', { class: 'explore' },
    h('header', { class: 'topbar' },
      backButton(() => { document.body.style.cursor = ''; app.go('home'); }),
      h('h1', {}, t('mode.explore')),
      chips(CATS.map((c) => ({ value: c, label: t('cat.' + c) })), cat, (v) => {
        cat = v;
        reset();
        stage.setStyle({ cat });
        stage.setHighlights([]);
        stage.setMarkers([]);
        cardHost.replaceChildren(h('p', { class: 'subtle' }, t('explore.hint')));
      })),
    h('div', { class: 'bottom' }, cardHost),
  ));
});
