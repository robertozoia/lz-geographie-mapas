// Player settings: language, sound, map view, progress backup, delete.
import { h, mount } from '../dom.js';
import { app, applyProfile } from '../app.js';
import { t, LANGS, LANG_LABELS, LANG_FLAGS } from '../../i18n.js';
import { stage } from '../stage.js';
import { chips, backButton, toast } from '../components.js';
import * as store from '../../store.js';

app.register('settings', () => {
  const p = app.profile;
  stage.setIdle(true);

  const set = (fn) => { fn(); app.save(); applyProfile(p); app.go('settings'); };

  const exportBtn = h('button', {
    class: 'btn',
    onclick: () => {
      const blob = new Blob([store.exportProfile(p)], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: `geoquest-${p.name}.json` });
      document.body.append(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    },
  }, '💾 ', t('settings.export'));

  const fileInput = h('input', { type: 'file', accept: '.json,application/json', class: 'hidden' });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const imported = store.importProfile(await file.text());
      applyProfile(imported);
      toast(t('settings.imported'));
      app.go('home');
    } catch {
      toast(t('settings.importError'));
    }
  });

  let armed = false;
  const deleteBtn = h('button', {
    class: 'btn danger',
    onclick: () => {
      if (!armed) {
        armed = true;
        deleteBtn.textContent = t('profiles.confirmDelete', { name: p.name });
        setTimeout(() => { armed = false; deleteBtn.textContent = t('profiles.delete'); }, 4000);
        return;
      }
      store.deleteProfile(p.id);
      app.go('profiles');
    },
  }, t('profiles.delete'));

  mount(h('section', { class: 'panel panel-side' },
    backButton(() => app.go('home')),
    h('h1', {}, t('home.settings')),
    h('h3', {}, t('settings.lang')),
    chips(LANGS.map((l) => ({ value: l, label: `${LANG_FLAGS[l]} ${LANG_LABELS[l]}` })), p.lang, (v) => set(() => { p.lang = v; })),
    h('h3', {}, t('settings.sound')),
    chips([{ value: true, label: t('on') }, { value: false, label: t('off') }], p.settings.sound, (v) => set(() => { p.settings.sound = v; })),
    h('h3', {}, t('settings.view')),
    chips(['globe', 'flat'].map((v) => ({ value: v, label: t('view.' + v) })), p.settings.view, (v) => set(() => { p.settings.view = v; })),
    h('div', { class: 'stack' },
      exportBtn,
      h('button', { class: 'btn', onclick: () => fileInput.click() }, '📂 ', t('settings.import')),
      fileInput,
      deleteBtn),
    h('p', { class: 'subtle small' }, t('settings.about')),
  ));
});
