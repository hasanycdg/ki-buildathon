/**
 * Spaced Repetition (SM-2, angepasst)
 * ===================================
 * Das ist die Ebene ÜBER der Lektion: Sie entscheidet, wann eine Aufgabe
 * wieder auftaucht — Tage oder Wochen später. Ohne sie wäre die App eine
 * Klickstrecke, die man einmal macht und danach vergisst.
 *
 * Kernidee: Jede Aufgabe hat ein Intervall. Antwortest du richtig, wächst es.
 * Antwortest du falsch, faellt es auf null zurueck und die Aufgabe kommt
 * morgen wieder. Leichte Aufgaben verschwinden also aus dem Weg, schwere
 * bleiben dran.
 */

const DAY = 86400000;

/** Antwortqualitaeten, wie sie aus dem Lektions-Player kommen. */
export const QUALITY = {
  WRONG: 0,        // falsch beantwortet
  RECOVERED: 3,    // erst falsch, dann in derselben Lektion richtig
  CORRECT: 4,      // richtig, aber schon mal gesehen
  PERFECT: 5       // auf Anhieb richtig
};

/** Frischer Zustand fuer eine noch nie gesehene Aufgabe. */
export function newItem(itemId) {
  return {
    itemId,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    lastReview: 0,
    dueAt: 0,
    history: []
  };
}

/**
 * Verarbeitet eine Antwort und gibt den neuen Zustand zurueck (rein, ohne
 * Seiteneffekte).
 */
export function review(item, quality, now = Date.now()) {
  const next = { ...item, history: [...(item.history || []).slice(-9), quality] };

  if (quality < 3) {
    // Falsch: zurueck auf Anfang, morgen wieder dran.
    next.repetitions = 0;
    next.intervalDays = 0;
    next.lapses = item.lapses + 1;
    next.dueAt = now + DAY;
  } else {
    next.repetitions = item.repetitions + 1;
    if (next.repetitions === 1) next.intervalDays = 1;
    else if (next.repetitions === 2) next.intervalDays = 3;
    else next.intervalDays = Math.round(item.intervalDays * next.ease);
    next.dueAt = now + next.intervalDays * DAY;
  }

  // Ease-Faktor nachfuehren: schwere Aufgaben kommen dauerhaft oefter.
  const q = quality;
  next.ease = clamp(item.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), 1.3, 2.8);
  next.lastReview = now;
  return next;
}

/**
 * Wie gut sitzt die Aufgabe gerade? 0 = vergessen, 1 = frisch.
 * Faellt mit der Zeit ab — das treibt die "Auffrischen"-Empfehlung im Pfad.
 */
export function strength(item, now = Date.now()) {
  if (!item || !item.lastReview) return 0;
  if (item.intervalDays <= 0) return 0.15;
  const elapsed = (now - item.lastReview) / DAY;
  const ratio = elapsed / item.intervalDays;
  return clamp(1 - ratio * 0.5, 0, 1);
}

/** Alle faelligen Aufgaben, schwaechste zuerst. */
export function dueItems(items, now = Date.now()) {
  return Object.values(items)
    .filter((it) => it.lastReview > 0 && it.dueAt <= now)
    .sort((a, b) => strength(a, now) - strength(b, now));
}

/** Mittlere Staerke einer Aufgabenmenge — fuer Fortschrittsbalken. */
export function averageStrength(items, ids, now = Date.now()) {
  if (!ids.length) return 0;
  const total = ids.reduce((sum, id) => sum + strength(items[id], now), 0);
  return total / ids.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
