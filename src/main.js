import './styles.css';
import { stage } from './ui/stage.js';
import { app, applyProfile } from './ui/app.js';
import * as store from './store.js';
import './ui/screens/profiles.js';
import './ui/screens/home.js';
import './ui/screens/setup.js';
import './ui/screens/game.js';
import './ui/screens/summary.js';
import './ui/screens/explore.js';
import './ui/screens/mastery.js';
import './ui/screens/badges.js';
import './ui/screens/settings.js';

stage.init();
// remember the map view chosen with the toggle button
stage.onViewChange = (mode) => {
  const p = store.currentProfile();
  if (p && p.settings.view !== mode) { p.settings.view = mode; store.save(); }
};

const p = store.currentProfile();
if (p) {
  applyProfile(p);
  app.go('home');
} else {
  app.go('profiles');
}
document.getElementById('loading')?.remove();
