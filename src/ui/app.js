// Screen router and shared state.
import * as store from '../store.js';
import { setLang } from '../i18n.js';
import { setSound } from './audio.js';
import { stage } from './stage.js';

const screens = {};

export const app = {
  register(name, render) { screens[name] = render; },
  go(name, params = {}) {
    stage.clear();
    screens[name](params);
  },
  get profile() { return store.currentProfile(); },
  save() { store.save(); },
};

// Apply a profile's language and settings to the whole app.
export function applyProfile(p) {
  setLang(p.lang);
  setSound(p.settings.sound);
  stage.setView(p.settings.view);
  stage.refreshLabels();
}
