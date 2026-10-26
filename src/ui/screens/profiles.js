// "Who's playing?" – pick or create a local profile. A new profile chooses
// the one language it will play in.
import { h, mount } from '../dom.js';
import { app, applyProfile } from '../app.js';
import * as store from '../../store.js';
import { t, setLang, browserLang, LANGS, LANG_LABELS, LANG_FLAGS } from '../../i18n.js';
import { stage } from '../stage.js';
import { sfx } from '../audio.js';

export const AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐙', '🦉', '🐢', '🐬', '🦄', '🐧', '🐨', '🚀', '⚽', '🎸', '🌵'];

app.register('profiles', ({ adding = false } = {}) => {
  const list = store.profiles();
  if (!store.currentProfile()) setLang(list.at(-1)?.lang ?? browserLang());
  stage.setIdle(true);
  stage.showControls(false);
  stage.view('world');

  if (adding || !list.length) return mount(newProfileForm(list.length > 0));

  const cards = list.map((p) => h('button', {
    class: 'profile-card',
    onclick: () => {
      sfx.click();
      store.selectProfile(p.id);
      applyProfile(p);
      app.go('home');
    },
  }, h('span', { class: 'avatar' }, p.avatar), h('span', { class: 'profile-name' }, p.name),
  h('span', { class: 'profile-lang' }, LANG_FLAGS[p.lang])));

  mount(h('section', { class: 'panel panel-center' },
    h('h1', { class: 'logo' }, 'GeoQuest'),
    h('h2', {}, t('profiles.title')),
    h('div', { class: 'profile-grid' }, cards,
      h('button', { class: 'profile-card add', onclick: () => app.go('profiles', { adding: true }) },
        h('span', { class: 'avatar' }, '＋'), h('span', { class: 'profile-name' }, t('profiles.add')))),
  ));
});

function newProfileForm(canCancel) {
  let avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  let lang = null;

  const nameInput = h('input', { type: 'text', maxlength: 20, placeholder: t('profiles.name'), autocomplete: 'off', 'aria-label': t('profiles.name') });
  const createBtn = h('button', { class: 'btn primary big', disabled: true, onclick: create }, t('profiles.create'));
  const update = () => { createBtn.disabled = !(nameInput.value.trim() && lang); };
  nameInput.addEventListener('input', update);
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !createBtn.disabled) create(); });

  const avatarGrid = h('div', { class: 'avatar-grid' });
  const renderAvatars = () => avatarGrid.replaceChildren(...AVATARS.map((a) => h('button', {
    class: 'avatar-btn' + (a === avatar ? ' active' : ''),
    'aria-pressed': a === avatar ? 'true' : 'false',
    onclick: () => { avatar = a; sfx.click(); renderAvatars(); },
  }, a)));
  renderAvatars();

  // Each language button is labelled in its own language.
  const langRow = h('div', { class: 'lang-row' });
  const renderLangs = () => langRow.replaceChildren(...LANGS.map((l) => h('button', {
    class: 'lang-btn' + (l === lang ? ' active' : ''),
    'aria-pressed': l === lang ? 'true' : 'false',
    lang: l,
    onclick: () => { lang = l; sfx.click(); renderLangs(); update(); },
  }, h('span', { class: 'flag' }, LANG_FLAGS[l]), LANG_LABELS[l])));
  renderLangs();

  function create() {
    const p = store.createProfile({ name: nameInput.value.trim(), avatar, lang });
    applyProfile(p);
    app.go('home');
  }

  setTimeout(() => nameInput.focus(), 50);
  return mount(h('section', { class: 'panel panel-center' },
    h('h1', { class: 'logo' }, 'GeoQuest'),
    h('h2', {}, t('profiles.add')),
    nameInput,
    h('h3', {}, t('profiles.avatar')),
    avatarGrid,
    h('h3', {}, t('profiles.lang')),
    langRow,
    h('div', { class: 'row' },
      canCancel ? h('button', { class: 'btn', onclick: () => app.go('profiles') }, t('cancel')) : null,
      createBtn),
  ));
}
