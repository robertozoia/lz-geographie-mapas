// A round of 10 questions: Find it (tap the map), Name it (multiple choice)
// and Capitals (both directions).
import { h, mount } from '../dom.js';
import { app } from '../app.js';
import { t, tPick, name, kindLabel, speak, canSpeak } from '../../i18n.js';
import { stage } from '../stage.js';
import { sfx } from '../audio.js';
import { pick } from '../../render/picking.js';
import { makeRound, checkMapAnswer, checkChoice, recordAnswer, finishRound } from '../../game/engine.js';

app.register('game', ({ config }) => {
  const p = app.profile;
  const round = makeRound(p, config);
  const mapCat = round.config.mode === 'capitals' ? 'country' : round.config.cat;
  stage.setIdle(false);
  stage.showControls(true);
  stage.setStyle({ cat: mapCat, mastery: null });
  stage.view(config.cont);

  const dots = h('div', { class: 'dots' }, round.questions.map(() => h('span', { class: 'dot' })));
  const scoreEl = h('span', { class: 'hud-score' });
  const streakEl = h('span', { class: 'hud-streak' });
  const promptEl = h('div', { class: 'prompt' });
  const answersEl = h('div', { class: 'answers' });
  const feedbackEl = h('div', { class: 'feedback hidden', role: 'status', 'aria-live': 'polite' });

  mount(h('section', { class: 'game' },
    h('header', { class: 'hud' },
      h('button', { class: 'icon-btn', onclick: () => app.go('home'), 'aria-label': t('back') }, '✕'),
      dots,
      h('div', { class: 'hud-right' }, scoreEl, streakEl)),
    promptEl,
    h('div', { class: 'bottom' }, feedbackEl, answersEl),
  ));

  let answered = false;
  let question = null;
  let advanceTimer = null;

  const updateHud = () => {
    scoreEl.textContent = `⭐ ${round.score}`;
    streakEl.textContent = p.stats.streak > 1 ? `🔥 ${p.stats.streak}` : '';
  };

  function show() {
    question = round.questions[round.index];
    answered = false;
    question.t0 = performance.now();
    feedbackEl.className = 'feedback hidden';
    stage.setMarkers([]);
    [...dots.children].forEach((d, i) => d.classList.toggle('current', i === round.index));
    updateHud();

    const q = question;
    const speakBtn = (text) => canSpeak()
      ? h('button', { class: 'icon-btn speak', onclick: () => speak(text), 'aria-label': t('explore.speak') }, '🔊') : null;

    // map questions start from the region overview again
    if ((q.type === 'find' || q.type === 'countryOf') && round.index > 0) stage.view(config.cont);

    if (q.type === 'find') {
      promptEl.replaceChildren(
        h('div', { class: 'prompt-label' }, t('q.find')),
        h('div', { class: 'prompt-name' }, name(q.target), speakBtn(name(q.target))),
        h('div', { class: 'prompt-kind' }, kindLabel(q.target)));
      stage.setHighlights([]);
      answersEl.replaceChildren(dontKnow());
    } else if (q.type === 'countryOf') {
      promptEl.replaceChildren(h('div', { class: 'prompt-name small' }, t('q.countryOf', { name: name(q.capital) })));
      stage.setHighlights([]);
      answersEl.replaceChildren(dontKnow());
    } else {
      const shown = q.type === 'capitalOf' ? q.country : q.target;
      promptEl.replaceChildren(q.type === 'capitalOf'
        ? h('div', { class: 'prompt-name small' }, t('q.capitalOf', { name: name(q.country) }))
        : h('div', {}, h('div', { class: 'prompt-label' }, t('q.name')), h('div', { class: 'prompt-kind' }, kindLabel(q.target))));
      stage.setHighlights([{ item: shown, style: 'target' }]);
      stage.focusItem(shown);
      if (shown.cat === 'capital' || (shown.r ?? 0) < 1.5) stage.setMarkers([{ ll: shown.ll, kind: 'pulse' }]);
      answersEl.replaceChildren(h('div', { class: 'options' }, q.options.map((opt, i) => h('button', {
        class: 'option',
        'data-id': opt.id,
        onclick: () => choose(opt),
      }, h('span', { class: 'key' }, i + 1), name(opt)))), dontKnow());
    }
    stage.handlers.click = (lon, lat, tol) => onMapClick(lon, lat, tol);
  }

  const dontKnow = () => h('button', { class: 'btn ghost', onclick: () => giveUp() }, t('q.dontKnow'));

  const seconds = () => (performance.now() - question.t0) / 1000;

  function onMapClick(lon, lat, tol) {
    if (answered || (question.type !== 'find' && question.type !== 'countryOf')) return;
    const cats = [question.target.cat];
    const picked = pick(lon, lat, tol, cats);
    const result = checkMapAnswer(question, lon, lat, picked, seconds());
    const marks = [{ ll: [lon, lat], kind: result.correct ? 'hit' : 'cross' }];
    if (question.target.cat === 'capital' || (question.target.r ?? 0) < 1.5) marks.push({ ll: question.target.ll, kind: 'pulse' });
    stage.setMarkers(marks);
    reveal(result, result.picked && !result.correct ? result.picked : null);
  }

  function choose(opt) {
    if (answered) return;
    const result = checkChoice(question, opt, seconds());
    for (const b of answersEl.querySelectorAll('.option')) {
      b.disabled = true;
      if (b.dataset.id === question.target.id) b.classList.add('right');
      else if (b.dataset.id === opt.id) b.classList.add('wrong');
    }
    reveal(result, null);
  }

  function giveUp() {
    if (answered) return;
    for (const b of answersEl.querySelectorAll('.option')) {
      b.disabled = true;
      if (b.dataset.id === question.target.id) b.classList.add('right');
    }
    if (question.target.cat === 'capital' || (question.target.r ?? 0) < 1.5) stage.setMarkers([{ ll: question.target.ll, kind: 'pulse' }]);
    reveal({ correct: false, points: 0, gaveUp: true }, null);
  }

  function reveal(result, wrongItem) {
    answered = true;
    recordAnswer(p, round, question, result);
    app.save();
    const q = question;
    const dot = dots.children[round.index];
    dot.classList.add(result.correct ? 'ok' : 'bad');

    // show the answer on the map
    const answerItem = q.type === 'capitalOf' ? q.country : q.target;
    const list = [{ item: answerItem, style: result.correct ? 'correct' : 'answer' }];
    if (q.type === 'capitalOf') list.push({ item: q.target, style: 'correct' });
    if (wrongItem) list.push({ item: wrongItem, style: 'wrong' });
    stage.setHighlights(list);
    if (q.type === 'find' || q.type === 'countryOf') stage.focusItem(answerItem);

    let text;
    if (result.correct) {
      text = tPick('fb.correct');
      sfx.correct();
    } else {
      sfx.wrong();
      const parts = [t('fb.wrong', { name: name(q.target) })];
      if (wrongItem) parts.push(t('fb.tapped', { name: name(wrongItem) }));
      else if (result.km > 0 && !result.gaveUp) parts.push(t(result.km < 300 ? 'fb.close' : 'fb.km', { km: result.km.toLocaleString() }));
      text = parts.join(' ');
    }
    feedbackEl.className = 'feedback ' + (result.correct ? 'ok' : 'bad');
    feedbackEl.replaceChildren(
      h('span', { class: 'fb-icon' }, result.correct ? '✓' : '✗'),
      h('span', { class: 'fb-text' }, text),
      result.points ? h('span', { class: 'fb-points' }, `+${result.points}`) : null,
      h('button', { class: 'btn primary', onclick: next }, t('next'), ' ›'));
    if (!q.options) answersEl.replaceChildren();
    updateHud();
    if (result.correct) advanceTimer = setTimeout(next, 1800);
  }

  function next() {
    clearTimeout(advanceTimer);
    if (!answered) return;
    round.index++;
    if (round.index >= round.questions.length) {
      const badges = finishRound(p, round);
      app.save();
      app.go('summary', { round, badges });
      return;
    }
    show();
  }

  const onKey = (e) => {
    if (!document.body.contains(feedbackEl)) { removeEventListener('keydown', onKey); return; }
    if (!answered && /^[1-4]$/.test(e.key) && question.options) choose(question.options[Number(e.key) - 1]);
    else if (answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
  };
  addEventListener('keydown', onKey);

  if (!round.questions.length) return app.go('home');
  show();
});
