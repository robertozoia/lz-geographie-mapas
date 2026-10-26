// Local profiles and progress, kept in localStorage. Every access is guarded:
// storage can be unavailable (private mode, blocked site data).

const KEY = 'geoquest.v1';
const VERSION = 1;

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.version === VERSION && Array.isArray(s.profiles)) return s;
    }
  } catch {}
  return { version: VERSION, current: null, profiles: [] };
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const profiles = () => state.profiles;
export const currentProfile = () => state.profiles.find((p) => p.id === state.current) ?? null;

export function selectProfile(id) {
  state.current = id;
  save();
}

function blankProfile({ name, avatar, lang }) {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name, avatar, lang,
    created: Date.now(),
    settings: { sound: true, view: 'globe' },
    progress: {},
    stats: { rounds: 0, points: 0, streak: 0, bestStreak: 0, cats: [], conts: [], explored: [] },
    badges: {},
    last: {},
  };
}

export function createProfile(data) {
  const p = blankProfile(data);
  state.profiles.push(p);
  state.current = p.id;
  save();
  return p;
}

export function deleteProfile(id) {
  state.profiles = state.profiles.filter((p) => p.id !== id);
  if (state.current === id) state.current = null;
  save();
}

// Export a single profile as a JSON string (for moving to another device).
export function exportProfile(p) {
  return JSON.stringify({ geoquest: VERSION, profile: p }, null, 1);
}

// Import a profile from exported JSON. Replaces a profile with the same id.
export function importProfile(text) {
  const data = JSON.parse(text);
  const p = data?.profile;
  if (data?.geoquest !== VERSION || !p?.id || !p.name || typeof p.progress !== 'object') {
    throw new Error('invalid file');
  }
  const fresh = blankProfile(p);
  const merged = { ...fresh, ...p, settings: { ...fresh.settings, ...p.settings }, stats: { ...fresh.stats, ...p.stats } };
  state.profiles = state.profiles.filter((x) => x.id !== p.id).concat(merged);
  state.current = merged.id;
  save();
  return merged;
}
