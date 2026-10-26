// Small reusable UI pieces.
import { h } from './dom.js';
import { t } from '../i18n.js';
import { sfx } from './audio.js';

// Row of toggle chips. options: [{ value, label, extra }]
export function chips(options, selected, onSelect, { className = '' } = {}) {
  const row = h('div', { class: `chips ${className}`, role: 'radiogroup' });
  const render = (value) => {
    row.replaceChildren(...options.map((o) => h('button', {
      class: 'chip' + (o.value === value ? ' active' : ''),
      role: 'radio',
      'aria-checked': o.value === value ? 'true' : 'false',
      onclick: () => { sfx.click(); render(o.value); onSelect(o.value); },
    }, o.label, o.extra ? h('span', { class: 'chip-extra' }, o.extra) : null)));
  };
  render(selected);
  return row;
}

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
