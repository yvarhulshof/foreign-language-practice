// Vocab Trainer SRS Flashcard App
// SM-2 spaced repetition algorithm + typed-answer checking

const STORAGE_PROGRESS = 'dc_progress';
const STORAGE_STATS    = 'dc_stats';
const STORAGE_MODE     = 'dc_mode';
const NEW_CARDS_PER_SESSION = 10;

// ── Language pair config ────────────────────────────────────────────────────
// Drives all direction/TTS logic; add new pairs here.

const LANG_PAIR_CONFIG = {
  'nl-ca': { cards: () => CARDS,    front: 'dutch',   back: 'catalan', frontLang: 'nl-NL', backLang: 'ca-ES' },
  'ca-nl': { cards: () => CARDS,    front: 'catalan', back: 'dutch',   frontLang: 'ca-ES', backLang: 'nl-NL' },
  'nl-de': { cards: () => DE_CARDS, front: 'dutch',   back: 'german',  frontLang: 'nl-NL', backLang: 'de-DE' },
  'de-nl': { cards: () => DE_CARDS, front: 'german',  back: 'dutch',   frontLang: 'de-DE', backLang: 'nl-NL' },
};

// ── UI strings ──────────────────────────────────────────────────────────────

const UI_STRINGS = {
  'nl-ca': {
    navFlag:          '🇳🇱',
    navBrand:         'Nederlands Leren',
    statsNav:         'Estadístiques',
    heroFlag:         '🇳🇱',
    heroTitle:        'Aprèn Neerlandès',
    heroSubtitle:     'Targetes de memòria amb repetició espaïada',
    cefrLabel:        'Nivell CEFR',
    levelA1Sub:       'Principiant',
    levelA2Sub:       'Bàsic',
    statDue:          'Per repassar',
    statNew:          'Noves',
    statStreak:       'Dies de ratxa',
    startBtn:         'Comença a practicar',
    homeTip:          '💡 <strong>Com funciona:</strong> Veuràs la paraula en neerlandès. Escriu la traducció i comprova la resposta. L\'app programa la pròxima revisió automàticament.',
    backBtn:          '← Inici',
    inputPlaceholder: 'Escriu la traducció…',
    checkBtn:         '→',
    resultCorrect:    '✓ Correcte!',
    resultClose:      '〜 Quasi bé!',
    resultWrong:      '✗ No era correcte',
    yourAnswer:       'La teva resposta:',
    nextBtn:          'Següent →',
    statsTitle:       'Les teves estadístiques',
    statsStreak:      'Dies de ratxa',
    statsReviewed:    'Targetes repassades',
    statsCards:       'targetes',
    levelB1Sub:       'Intermedi',
    levelB2Sub:       'Intermedi avançat',
    levelC1Sub:       'Avançat',
    statsA1Name:      'Principiant',
    statsA2Name:      'Bàsic',
    statsB1Name:      'Intermedi',
    statsB2Name:      'Intermedi avançat',
    statsC1Name:      'Avançat',
    statsNew:         'Noves',
    statsLearning:    'Aprenent',
    statsMastered:    'Apreses',
    practiceBtn:      'Practica ara',
    moreCards:        'Més targetes',
    homeBtn:          'Inici',
    completionDone:    (streak) => `Sessió completada! Ratxa: ${streak} dia${streak !== 1 ? 's' : ''}. Bon treball!`,
    completionNothing: 'No hi ha targetes pendents per avui! Torna demà. 🎉',
  },
  'ca-nl': {
    navFlag:          '🏴󠁥󠁳󠁣󠁴󠁿',
    navBrand:         'Catalaans Leren',
    statsNav:         'Statistieken',
    heroFlag:         '🏴󠁥󠁳󠁣󠁴󠁿',
    heroTitle:        'Leer Catalaans',
    heroSubtitle:     'Geheugenkaartjes met gespreide herhaling',
    cefrLabel:        'CEFR-niveau',
    levelA1Sub:       'Beginner',
    levelA2Sub:       'Basis',
    statDue:          'Te herhalen',
    statNew:          'Nieuw',
    statStreak:       'Dagen op rij',
    startBtn:         'Begin te oefenen',
    homeTip:          '💡 <strong>Hoe het werkt:</strong> Je ziet het Catalaanse woord. Schrijf de vertaling en controleer je antwoord. De app plant de volgende herhaling automatisch.',
    backBtn:          '← Begin',
    inputPlaceholder: 'Schrijf de vertaling…',
    checkBtn:         '→',
    resultCorrect:    '✓ Correct!',
    resultClose:      '〜 Bijna goed!',
    resultWrong:      '✗ Niet correct',
    yourAnswer:       'Jouw antwoord:',
    nextBtn:          'Volgende →',
    statsTitle:       'Jouw statistieken',
    statsStreak:      'Dagen op rij',
    statsReviewed:    'Kaartjes herhaald',
    statsCards:       'kaartjes',
    levelB1Sub:       'Gemiddeld',
    levelB2Sub:       'Gevorderd gemiddeld',
    levelC1Sub:       'Gevorderd',
    statsA1Name:      'Beginner',
    statsA2Name:      'Basis',
    statsB1Name:      'Gemiddeld',
    statsB2Name:      'Gevorderd gemiddeld',
    statsC1Name:      'Gevorderd',
    statsNew:         'Nieuw',
    statsLearning:    'Aan het leren',
    statsMastered:    'Geleerd',
    practiceBtn:      'Oefen nu',
    moreCards:        'Meer kaartjes',
    homeBtn:          'Begin',
    completionDone:    (streak) => `Sessie voltooid! Reeks: ${streak} dag${streak !== 1 ? 'en' : ''}. Goed gedaan!`,
    completionNothing: 'Geen kaartjes te herhalen vandaag! Kom morgen terug. 🎉',
  },
  'nl-de': {
    navFlag:          '🇩🇪',
    navBrand:         'Niederländisch Lernen',
    statsNav:         'Statistiken',
    heroFlag:         '🇳🇱',
    heroTitle:        'Lern Niederländisch',
    heroSubtitle:     'Lernkarten mit erweitertem Wiederholen',
    cefrLabel:        'CEFR-Niveau',
    levelA1Sub:       'Anfänger',
    levelA2Sub:       'Grundkenntnisse',
    statDue:          'Zu wiederholen',
    statNew:          'Neu',
    statStreak:       'Tage in Folge',
    startBtn:         'Üben starten',
    homeTip:          '💡 <strong>So funktioniert es:</strong> Du siehst das niederländische Wort. Schreib die Übersetzung und überprüfe deine Antwort. Die App plant die nächste Wiederholung automatisch.',
    backBtn:          '← Start',
    inputPlaceholder: 'Übersetzung eingeben…',
    checkBtn:         '→',
    resultCorrect:    '✓ Richtig!',
    resultClose:      '〜 Fast richtig!',
    resultWrong:      '✗ Nicht richtig',
    yourAnswer:       'Deine Antwort:',
    nextBtn:          'Weiter →',
    statsTitle:       'Deine Statistiken',
    statsStreak:      'Tage in Folge',
    statsReviewed:    'Karten wiederholt',
    statsCards:       'Karten',
    levelB1Sub:       'Mittelstufe',
    levelB2Sub:       'Gehobene Mittelstufe',
    levelC1Sub:       'Fortgeschritten',
    statsA1Name:      'Anfänger',
    statsA2Name:      'Grundkenntnisse',
    statsB1Name:      'Mittelstufe',
    statsB2Name:      'Gehobene Mittelstufe',
    statsC1Name:      'Fortgeschritten',
    statsNew:         'Neu',
    statsLearning:    'Lernend',
    statsMastered:    'Gelernt',
    practiceBtn:      'Jetzt üben',
    moreCards:        'Mehr Karten',
    homeBtn:          'Start',
    completionDone:    (streak) => `Sitzung abgeschlossen! Serie: ${streak} Tag${streak !== 1 ? 'e' : ''}. Gut gemacht!`,
    completionNothing: 'Keine Karten heute fällig! Komm morgen wieder. 🎉',
  },
  'de-nl': {
    navFlag:          '🇳🇱',
    navBrand:         'Duits Leren',
    statsNav:         'Statistieken',
    heroFlag:         '🇩🇪',
    heroTitle:        'Leer Duits',
    heroSubtitle:     'Geheugenkaartjes met gespreide herhaling',
    cefrLabel:        'CEFR-niveau',
    levelA1Sub:       'Beginner',
    levelA2Sub:       'Basis',
    statDue:          'Te herhalen',
    statNew:          'Nieuw',
    statStreak:       'Dagen op rij',
    startBtn:         'Begin te oefenen',
    homeTip:          '💡 <strong>Hoe het werkt:</strong> Je ziet het Duitse woord. Schrijf de vertaling en controleer je antwoord. De app plant de volgende herhaling automatisch.',
    backBtn:          '← Begin',
    inputPlaceholder: 'Schrijf de vertaling…',
    checkBtn:         '→',
    resultCorrect:    '✓ Correct!',
    resultClose:      '〜 Bijna goed!',
    resultWrong:      '✗ Niet correct',
    yourAnswer:       'Jouw antwoord:',
    nextBtn:          'Volgende →',
    statsTitle:       'Jouw statistieken',
    statsStreak:      'Dagen op rij',
    statsReviewed:    'Kaartjes herhaald',
    statsCards:       'kaartjes',
    levelB1Sub:       'Gemiddeld',
    levelB2Sub:       'Gevorderd gemiddeld',
    levelC1Sub:       'Gevorderd',
    statsA1Name:      'Beginner',
    statsA2Name:      'Basis',
    statsB1Name:      'Gemiddeld',
    statsB2Name:      'Gevorderd gemiddeld',
    statsC1Name:      'Gevorderd',
    statsNew:         'Nieuw',
    statsLearning:    'Aan het leren',
    statsMastered:    'Geleerd',
    practiceBtn:      'Oefen nu',
    moreCards:        'Meer kaartjes',
    homeBtn:          'Begin',
    completionDone:    (streak) => `Sessie voltooid! Reeks: ${streak} dag${streak !== 1 ? 'en' : ''}. Goed gedaan!`,
    completionNothing: 'Geen kaartjes te herhalen vandaag! Kom morgen terug. 🎉',
  },
};

function applyUI(mode) {
  const s = UI_STRINGS[mode];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!(key in s)) return;
    if (key === 'homeTip') {
      el.innerHTML = s[key];
    } else {
      el.textContent = s[key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (s[key]) el.placeholder = s[key];
  });
  const langMap = { 'nl-ca': 'ca', 'ca-nl': 'nl', 'nl-de': 'de', 'de-nl': 'nl' };
  document.documentElement.lang = langMap[mode] || 'nl';
}

// ── Persistence helpers ────────────────────────────────────────────────────

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_PROGRESS)) || {}; }
  catch { return {}; }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress));
}

function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORAGE_STATS)) || { streak: 0, lastStudied: null, totalReviewed: 0 }; }
  catch { return { streak: 0, lastStudied: null, totalReviewed: 0 }; }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_STATS, JSON.stringify(stats));
}

// ── SM-2 Algorithm ─────────────────────────────────────────────────────────
// quality: 1=Again, 4=Good, 5=Easy

function sm2(cardState, quality) {
  let { interval, repetitions, easeFactor } = cardState;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easeFactor);
    repetitions++;
  }

  easeFactor = easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easeFactor = Math.max(1.3, easeFactor);

  const nextReview = Date.now() + interval * 86400000;
  return { interval, repetitions, easeFactor, nextReview };
}

function defaultState() {
  return { interval: 0, repetitions: 0, easeFactor: 2.5, nextReview: 0 };
}

// ── Answer checking ────────────────────────────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
    for (let j = 1; j <= n; j++) {
      dp[i][j] = i === 0 ? j
        : a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// Returns 'exact' | 'close' | 'wrong'
// Handles multiple variants separated by '/'
function checkAnswer(input, correct) {
  const typed = input.trim().toLowerCase();
  const variants = correct.split('/').map(v => v.trim().toLowerCase());

  for (const v of variants) {
    if (typed === v) return 'exact';
  }
  for (const v of variants) {
    const threshold = Math.max(1, Math.floor(v.length / 4)); // 25% tolerance
    if (levenshtein(typed, v) <= threshold) return 'close';
  }
  return 'wrong';
}

// ── Session builder ────────────────────────────────────────────────────────

function buildSession(level) {
  const progress = loadProgress();
  const now = Date.now();
  const levelCards = LANG_PAIR_CONFIG[state.mode].cards().filter(c => c.level === level);

  const due = levelCards.filter(c => {
    const s = progress[c.id];
    return s && s.nextReview <= now;
  });

  const newCount = Math.max(0, NEW_CARDS_PER_SESSION - due.length);
  const newCards = levelCards.filter(c => !progress[c.id]).slice(0, newCount);

  return shuffle([...due, ...newCards]);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Stats helpers ──────────────────────────────────────────────────────────

function updateStreak(stats) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (stats.lastStudied === today) return stats;
  if (stats.lastStudied === yesterday) stats.streak++;
  else stats.streak = 1;
  stats.lastStudied = today;
  return stats;
}

function getCardCounts(level) {
  const progress = loadProgress();
  const levelCards = LANG_PAIR_CONFIG[state.mode].cards().filter(c => c.level === level);
  const now = Date.now();
  let counts = { total: levelCards.length, newCards: 0, learning: 0, mastered: 0, dueToday: 0 };
  for (const card of levelCards) {
    const s = progress[card.id];
    if (!s) { counts.newCards++; continue; }
    if (s.interval >= 21) counts.mastered++;
    else counts.learning++;
    if (s.nextReview <= now) counts.dueToday++;
  }
  return counts;
}

// ── TTS ────────────────────────────────────────────────────────────────────

let _ttsAudio = null;

function speak(text, lang) {
  // Stop any currently playing audio
  if (_ttsAudio) {
    _ttsAudio.pause();
    _ttsAudio = null;
  }

  const langCode = lang === 'nl-NL' ? 'nl' : lang === 'de-DE' ? 'de' : 'ca';
  const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}`;

  const audio = new Audio(url);
  _ttsAudio = audio;
  audio.play().catch(() => {
    // Silent fallback to Web Speech API if Google TTS fails
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.9;
    speechSynthesis.speak(utter);
  });
}

// ── App State ──────────────────────────────────────────────────────────────

const state = {
  currentLevel: 'A1',
  session: [],
  sessionIndex: 0,
  flipped: false,
  lastResult: null,  // 'exact' | 'close' | 'wrong'
  mode: localStorage.getItem(STORAGE_MODE) || 'nl-ca',
};

// ── View switching ─────────────────────────────────────────────────────────

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── Home view ──────────────────────────────────────────────────────────────

function renderHome() {
  showView('view-home');

  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === state.currentLevel);
  });

  const counts = getCardCounts(state.currentLevel);
  document.getElementById('home-due').textContent  = counts.dueToday;
  document.getElementById('home-new').textContent  = counts.newCards;
  document.getElementById('home-streak').textContent = loadStats().streak;
}

// ── Study view ─────────────────────────────────────────────────────────────

function startSession() {
  state.session = buildSession(state.currentLevel);
  state.sessionIndex = 0;

  if (state.session.length === 0) {
    showCompletionModal(true);
    return;
  }
  showView('view-study');
  renderCard();
}

function renderCard() {
  const card = state.session[state.sessionIndex];
  if (!card) { endSession(); return; }

  state.flipped = false;
  state.lastResult = null;

  // Progress bar
  const total = state.session.length;
  const done  = state.sessionIndex;
  document.getElementById('progress-bar-fill').style.width = `${(done / total) * 100}%`;
  document.getElementById('progress-text').textContent = `${done} / ${total}`;

  // Determine front/back based on mode config
  const cfg = LANG_PAIR_CONFIG[state.mode];
  const frontWord = card[cfg.front];
  const backWord  = card[cfg.back];
  const backEx    = cfg.front === 'dutch' ? card.example : card.exampleTranslation;
  const backExTr  = cfg.front === 'dutch' ? card.exampleTranslation : card.example;

  // Front
  document.getElementById('card-front-word').textContent = frontWord;
  document.getElementById('card-topic').textContent      = `${card.level} · ${card.topic}`;

  // Blank back — prevents answer peek during flip-back animation.
  // Back content is populated in submitAnswer() just before flipping.
  document.getElementById('card-back-word').textContent = '';
  document.getElementById('card-example').classList.add('hidden');
  document.getElementById('card-example-translation').classList.add('hidden');

  // Reset UI
  document.getElementById('card-inner').classList.remove('flipped');
  document.getElementById('next-row').classList.add('hidden');
  document.getElementById('result-feedback').textContent = '';
  document.getElementById('result-feedback').className = 'result-feedback';
  document.getElementById('result-user-answer').classList.add('hidden');
  document.getElementById('answer-input').value = '';
  document.getElementById('answer-input').focus();

  speak(frontWord, cfg.frontLang);
}

function submitAnswer() {
  if (state.flipped) return;

  const input = document.getElementById('answer-input').value;
  const isBlank = !input.trim();
  if (isBlank && state.flipped) return;

  const card = state.session[state.sessionIndex];
  const cfg = LANG_PAIR_CONFIG[state.mode];
  const correctWord = card[cfg.back];
  const backEx      = cfg.front === 'dutch' ? card.example : card.exampleTranslation;
  const backExTr    = cfg.front === 'dutch' ? card.exampleTranslation : card.example;
  const result = isBlank ? 'wrong' : checkAnswer(input, correctWord);

  state.flipped = true;
  state.lastResult = result;

  // Populate back face just before flipping (kept out of renderCard to avoid peek)
  document.getElementById('card-back-word').textContent = correctWord;
  const exEl   = document.getElementById('card-example');
  const exTrEl = document.getElementById('card-example-translation');
  if (backEx) {
    exEl.textContent   = backEx;
    exTrEl.textContent = backExTr || '';
    exEl.classList.remove('hidden');
    exTrEl.classList.remove('hidden');
  } else {
    exEl.classList.add('hidden');
    exTrEl.classList.add('hidden');
  }

  // Result feedback
  const s = UI_STRINGS[state.mode];
  const feedbackEl = document.getElementById('result-feedback');
  feedbackEl.textContent = result === 'exact' ? s.resultCorrect
    : result === 'close' ? s.resultClose
    : s.resultWrong;
  feedbackEl.className = `result-feedback result-${result}`;

  // Show user's typed answer if it differs from correct
  const userEl = document.getElementById('result-user-answer');
  if (result !== 'exact' && !isBlank) {
    userEl.textContent = `${s.yourAnswer} ${input.trim()}`;
    userEl.classList.remove('hidden');
  } else {
    userEl.classList.add('hidden');
  }

  // Flip card and show Next button; defer focus so the keyup from the submit
  // Enter doesn't immediately trigger a click on btn-next in some browsers.
  document.getElementById('card-inner').classList.add('flipped');
  document.getElementById('next-row').classList.remove('hidden');
  setTimeout(() => document.getElementById('btn-next').focus(), 0);

  // Speak the correct answer
  speak(correctWord, cfg.backLang);
}

function nextCard() {
  const qualityMap = { exact: 5, close: 4, wrong: 1 };
  rateCard(qualityMap[state.lastResult] || 1);
}

function rateCard(quality) {
  const card = state.session[state.sessionIndex];
  if (!card) return;

  const progress = loadProgress();
  const current  = progress[card.id] || defaultState();
  progress[card.id] = sm2(current, quality);
  saveProgress(progress);

  const stats = loadStats();
  updateStreak(stats);
  stats.totalReviewed++;
  saveStats(stats);

  if (quality === 1) {
    state.session.push(card);
  }

  state.sessionIndex++;
  renderCard();
}

function endSession() {
  showCompletionModal(false);
}

function showCompletionModal(nothingDue) {
  const overlay = document.getElementById('completion-overlay');
  const msg     = document.getElementById('completion-msg');
  const s       = UI_STRINGS[state.mode];
  if (nothingDue) {
    msg.textContent = s.completionNothing;
  } else {
    const stats = loadStats();
    msg.textContent = s.completionDone(stats.streak);
  }
  overlay.classList.remove('hidden');
}

// ── Stats view ─────────────────────────────────────────────────────────────

function renderStats() {
  showView('view-stats');
  const stats = loadStats();
  document.getElementById('stats-streak').textContent   = stats.streak;
  document.getElementById('stats-reviewed').textContent = stats.totalReviewed;

  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const c  = getCardCounts(level);
    const id = level.toLowerCase();
    document.getElementById(`stats-${id}-total`).textContent    = c.total;
    document.getElementById(`stats-${id}-new`).textContent      = c.newCards;
    document.getElementById(`stats-${id}-learning`).textContent = c.learning;
    document.getElementById(`stats-${id}-mastered`).textContent = c.mastered;
    const pct = c.total > 0 ? Math.round(((c.learning + c.mastered) / c.total) * 100) : 0;
    document.getElementById(`stats-${id}-bar`).style.width = `${pct}%`;
  }
}

// ── Event wiring ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Mode toggle
  document.getElementById('modeToggle').addEventListener('click', e => {
    const btn = e.target.closest('.mode-btn');
    if (!btn || btn.classList.contains('active')) return;
    const newMode = btn.dataset.mode;
    state.mode = newMode;
    localStorage.setItem(STORAGE_MODE, newMode);
    document.querySelectorAll('.mode-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === newMode)
    );
    applyUI(newMode);
    document.getElementById('completion-overlay').classList.add('hidden');
    renderHome();
  });

  // Level selector
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentLevel = btn.dataset.level;
      renderHome();
    });
  });

  // Start session
  document.getElementById('btn-start').addEventListener('click', startSession);

  // Nav
  document.getElementById('nav-stats').addEventListener('click', renderStats);
  document.getElementById('nav-home').addEventListener('click', renderHome);
  document.getElementById('nav-home-study').addEventListener('click', renderHome);

  // Answer input: Enter submits (or advances if already flipped)
  document.getElementById('answer-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (state.flipped) nextCard();
      else submitAnswer();
    }
  });

  // Check button
  document.getElementById('btn-check').addEventListener('click', submitAnswer);

  // Speak button (front) — speaks the question word
  document.getElementById('btn-speak').addEventListener('click', () => {
    const card = state.session[state.sessionIndex];
    if (card) {
      const cfg = LANG_PAIR_CONFIG[state.mode];
      speak(card[cfg.front], cfg.frontLang);
    }
  });

  // Next button
  document.getElementById('btn-next').addEventListener('click', nextCard);

  // Enter on completion overlay → show more cards
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const overlay = document.getElementById('completion-overlay');
    if (!overlay.classList.contains('hidden')) {
      document.getElementById('btn-continue-study').click();
    }
  });

  // Completion overlay
  document.getElementById('btn-continue-study').addEventListener('click', () => {
    document.getElementById('completion-overlay').classList.add('hidden');
    startSession();
  });
  document.getElementById('btn-go-home').addEventListener('click', () => {
    document.getElementById('completion-overlay').classList.add('hidden');
    renderHome();
  });

  // Stats → practice
  document.getElementById('btn-stats-practice').addEventListener('click', startSession);

  // Set initial mode toggle state
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === state.mode)
  );

  applyUI(state.mode);
  renderHome();
});
