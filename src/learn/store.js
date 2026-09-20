/**
 * Fortschritt speichern (localStorage)
 * ====================================
 * Bewusst ohne Backend: fuer den Buildathon reicht der Browser, und die
 * Datenform ist schon so geschnitten, dass sie 1:1 in eine API wandern kann.
 */
import { newItem, review, strength, averageStrength } from "./srs.js";

const KEY = "worklingo.learn.v1";
const MAX_HEARTS = 5;
const HEART_REFILL_MS = 15 * 60 * 1000; // ein Herz alle 15 Minuten

export function emptyState() {
  return {
    roleId: null,
    lang: "de",
    items: {},
    lessons: {},
    xp: 0,
    streak: { count: 0, lastDay: null },
    hearts: { count: MAX_HEARTS, updatedAt: Date.now() }
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* privater Modus o.ae. — Lernen funktioniert weiter, nur ohne Speichern */
  }
}

export function resetAll() {
  try { localStorage.removeItem(KEY); } catch { /* egal */ }
  return emptyState();
}

/* ---------------------------------------------------------------- Herzen */

/** Rechnet nach, wie viele Herzen inzwischen nachgewachsen sind. */
export function syncHearts(state, now = Date.now()) {
  const h = state.hearts || { count: MAX_HEARTS, updatedAt: now };
  if (h.count >= MAX_HEARTS) return { ...state, hearts: { ...h, updatedAt: now } };
  const gained = Math.floor((now - h.updatedAt) / HEART_REFILL_MS);
  if (gained <= 0) return state;
  const count = Math.min(MAX_HEARTS, h.count + gained);
  return { ...state, hearts: { count, updatedAt: h.updatedAt + gained * HEART_REFILL_MS } };
}

export function loseHeart(state) {
  const count = Math.max(0, (state.hearts?.count ?? MAX_HEARTS) - 1);
  return { ...state, hearts: { count, updatedAt: Date.now() } };
}

export function refillHearts(state) {
  return { ...state, hearts: { count: MAX_HEARTS, updatedAt: Date.now() } };
}

export const HEARTS_MAX = MAX_HEARTS;

/* ---------------------------------------------------------------- Streak */

function dayKey(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10);
}

export function touchStreak(state, now = Date.now()) {
  const today = dayKey(now);
  const last = state.streak?.lastDay;
  if (last === today) return state;

  const yesterday = dayKey(now - 86400000);
  const count = last === yesterday ? (state.streak.count || 0) + 1 : 1;
  return { ...state, streak: { count, lastDay: today } };
}

/* ------------------------------------------------------------ Fortschritt */

/** Eine beantwortete Aufgabe in den SRS-Speicher schreiben. */
export function recordAnswer(state, exerciseId, quality, now = Date.now()) {
  const existing = state.items[exerciseId] || newItem(exerciseId);
  return {
    ...state,
    items: { ...state.items, [exerciseId]: review(existing, quality, now) }
  };
}

/** Lektion abschliessen: XP gutschreiben, Streak setzen, Bestwert merken. */
export function completeLesson(state, lessonId, { xp, stars = 0, ms = 0 }, now = Date.now()) {
  const prev = state.lessons[lessonId] || { completed: false, timesDone: 0, stars: 0, bestMs: 0 };
  const next = {
    ...state,
    xp: (state.xp || 0) + xp,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        completed: true,
        timesDone: prev.timesDone + 1,
        // Bestwerte behalten: ein schlechterer Durchlauf nimmt nichts weg
        stars: Math.max(prev.stars || 0, stars),
        bestMs: prev.bestMs ? Math.min(prev.bestMs, ms) : ms,
        lastDone: now
      }
    }
  };
  return touchStreak(next, now);
}

/** Ist die Lektion freigeschaltet? Die erste immer, danach der Reihe nach. */
export function isUnlocked(state, orderedLessonIds, lessonId) {
  const index = orderedLessonIds.indexOf(lessonId);
  if (index <= 0) return true;
  const previous = orderedLessonIds[index - 1];
  return Boolean(state.lessons[previous]?.completed);
}

/** Wie gut sitzt eine Lektion? 0..1, faellt mit der Zeit. */
export function lessonStrength(state, lesson, now = Date.now()) {
  const ids = lesson.exercises.map((e) => e.id);
  return averageStrength(state.items, ids, now);
}

/**
 * Lektionen, die aufgefrischt werden sollten: abgeschlossen, aber die
 * Staerke ist unter die Schwelle gefallen.
 */
export function needsRefresh(state, lessons, threshold = 0.5, now = Date.now()) {
  return lessons
    .filter((l) => state.lessons[l.id]?.completed)
    .map((l) => ({ lesson: l, strength: lessonStrength(state, l, now) }))
    .filter((x) => x.strength < threshold)
    .sort((a, b) => a.strength - b.strength);
}

export { strength };
