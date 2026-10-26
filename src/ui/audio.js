// Short synthesized sound effects (no audio files needed).
let ctx = null;
let enabled = true;

export const setSound = (on) => { enabled = on; };

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const c = ctx;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

function play(fn) {
  if (!enabled) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    fn();
  } catch {}
}

export const sfx = {
  correct: () => play(() => { tone(660, 0, 0.12); tone(990, 0.09, 0.22); }),
  wrong: () => play(() => { tone(220, 0, 0.18, 'triangle', 0.2); tone(165, 0.12, 0.28, 'triangle', 0.2); }),
  click: () => play(() => tone(880, 0, 0.05, 'sine', 0.06)),
  finish: () => play(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3))),
  badge: () => play(() => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.35, 'triangle', 0.12))),
};
