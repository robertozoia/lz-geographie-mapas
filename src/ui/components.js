// Small reusable UI pieces.
import { h } from './dom.js';
import { t } from '../i18n.js';
import { sfx } from './audio.js';
import { CATS } from '../data.js';

// Row of toggle chips. options: [{ value, label, extra, className }]
export function chips(options, selected, onSelect, { className = '' } = {}) {
  const row = h('div', { class: `chips ${className}`, role: 'radiogroup' });
  const render = (value) => {
    row.replaceChildren(...options.map((o) => h('button', {
      class: 'chip' + (o.className ? ' ' + o.className : '') + (o.value === value ? ' active' : ''),
      role: 'radio',
      'aria-checked': o.value === value ? 'true' : 'false',
      onclick: () => { sfx.click(); render(o.value); onSelect(o.value); },
    }, o.label, o.extra ? h('span', { class: 'chip-extra' }, o.extra) : null)));
  };
  render(selected);
  return row;
}

// Water topics get their own colour so they stand apart from land topics.
const WATER_CATS = ['river', 'sea', 'current', 'fishing'];

export const categoryOptions = () => CATS.map((c) => ({
  value: c, label: t('cat.' + c), className: WATER_CATS.includes(c) ? 'chip-water' : null,
}));

export function backButton(onclick) {
  return h('button', { class: 'back-btn', onclick: () => { sfx.click(); onclick(); }, 'aria-label': t('back') }, '‹ ', t('back'));
}

export const starsText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

export function field(label, control) {
  return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), control);
}

// Brief message at the top of the screen.
export function toast(text) {
  const el = h('div', { class: 'toast' }, text);
  document.body.append(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2200);
}
