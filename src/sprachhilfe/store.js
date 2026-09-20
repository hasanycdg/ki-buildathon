/**
 * Fortschritt der Sprachhilfe (localStorage)
 * ==========================================
 * Eigener Schluessel, eigener Fortschritt: Der Lern-Tab uebt Handgriffe,
 * die Sprachhilfe uebt Begriffe. Wer das Bett beziehen kann, kann deshalb
 * noch lange nicht "Bettwaesche" sagen — und umgekehrt.
 *
 * Die Rolle wird beim ersten Oeffnen aus dem Lern-Tab uebernommen
 * (siehe SprachhilfeTab.jsx), danach ist sie hier unabhaengig.
 */
import { newItem, review, strength, averageStrength } from "../learn/srs.js";

const KEY = "worklingo.sprachhilfe.v1";
const MAX_HEARTS = 5;
const HEART_REFILL_MS = 15 * 60 * 1000; // ein Herz alle 15 Minuten

export function emptyState() {
  return {
    roleId: null,
    lang: "en",
    items: {},                                   // Aufgaben-ID -> SRS-Zustand
    lessons: {},                                 // Lektions-ID -> { completed, ... }
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
    /* privater Modus o.ae. — Lernen laeuft weiter, nur ohne Speichern */
  }
}

/* ---------------------------------------------------------------- Herzen */

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
  return { ...state, items: { ...state.items, [exerciseId]: review(existing, quality, now) } };
}

/** Lektion abschliessen: XP gutschreiben, Streak setzen. */
export function completeLesson(state, lessonId, { xp, perfect = false }, now = Date.now()) {
  const prev = state.lessons[lessonId] || { completed: false, timesDone: 0 };
  const next = {
    ...state,
    xp: (state.xp || 0) + xp,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        completed: true,
        timesDone: prev.timesDone + 1,
        perfect: prev.perfect || perfect,
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
  return Boolean(state.lessons[orderedLessonIds[index - 1]]?.completed);
}

/** Wie gut sitzt eine Lektion? 0..1, faellt mit der Zeit. */
export function lessonStrength(state, lesson, now = Date.now()) {
  return averageStrength(state.items, lesson.exercises.map((e) => e.id), now);
}

/** Abgeschlossene Lektionen, deren Staerke unter die Schwelle gefallen ist. */
export function needsRefresh(state, lessons, threshold = 0.5, now = Date.now()) {
  return lessons
    .filter((l) => state.lessons[l.id]?.completed)
    .map((l) => ({ lesson: l, strength: lessonStrength(state, l, now) }))
    .filter((x) => x.strength < threshold)
    .sort((a, b) => a.strength - b.strength);
}

export { strength };
