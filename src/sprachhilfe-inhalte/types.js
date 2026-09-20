/**
 * WorkLingo — Datenmodell des Lern-Tabs
 * ====================================
 *
 * Aufbau 1:1 wie Duolingo, Inhalte aus der Hotellerie:
 *
 *   Rolle  →  Units (Einheiten)  →  Lessons (Lektionen)  →  Exercises (Aufgaben)
 *
 * Eine Lektion gilt erst als bestanden, wenn JEDE Aufgabe richtig beantwortet
 * wurde. Falsche Antworten wandern zurueck in die Warteschlange (siehe
 * queue.js) — Durchklicken ist konstruktiv unmoeglich.
 *
 * @typedef {'de'|'en'|'tr'|'sk'} Lang
 *   de = Zielsprache (das, was im Haus gesprochen wird)
 *   en/tr/sk = Bruecken-Sprachen fuer Mitarbeiter:innen ohne Deutsch
 *
 * @typedef {Object} Role
 * @property {string} id          - stabile ID, z.B. 'housekeeping'
 * @property {string} name        - "Housekeeping"
 * @property {string} tagline     - eine Zeile, was die Rolle im Haus macht
 * @property {string} icon        - Name eines lucide-react Icons
 * @property {string} accent      - CSS-Farbe fuer den Pfad dieser Rolle
 * @property {string} blurb       - 1-2 Saetze fuer die Rollenauswahl
 * @property {Unit[]} units
 *
 * @typedef {Object} Unit
 * @property {string} id
 * @property {string} title       - "Einheit 1 — Das Zimmer"
 * @property {string} subtitle    - was man danach kann
 * @property {Lesson[]} lessons
 *
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} title
 * @property {'lesson'|'checkpoint'} kind - checkpoint = Abschlusspruefung der Unit
 * @property {Exercise[]} exercises       - 6-9 Stueck
 *
 * ---------------------------------------------------------------------------
 * AUFGABENTYPEN  (jeweils das Duolingo-Aequivalent in Klammern)
 * ---------------------------------------------------------------------------
 * Jede Aufgabe hat IMMER:
 *   id      {string}  eindeutig im gesamten Curriculum, Praefix = Rollen-ID
 *   type    {string}  einer der unten stehenden
 *   explain {string}  WARUM die Antwort richtig ist. Pflicht! Das ist der
 *                     Unterschied zwischen Lernen und Raten. 1-2 Saetze,
 *                     einfaches Deutsch, konkret auf den Hotelalltag bezogen.
 *
 * @typedef {Object} Exercise
 *
 * --- 'choice' (Multiple Choice) ---------------------------------------------
 * { id, type:'choice', prompt, options:[string,...], answer:number, explain }
 *   answer = Index der richtigen Option in options
 *
 * --- 'vocab' (Vokabel / "translate") ----------------------------------------
 * { id, type:'vocab', term, options:[string,...], answer:number, explain,
 *   speak?:string, tr:{ en:string, tr:string, sk:string } }
 *   term  = deutscher Fachbegriff, z.B. "die Bettwaesche"
 *   tr    = Uebersetzung in die Brueckensprachen (Pflicht bei 'vocab')
 *   speak = Text fuer die Sprachausgabe, default = term
 *
 * --- 'build' (Satz aus Wortkacheln bauen) -----------------------------------
 * { id, type:'build', prompt, answer:[string,...], distractors:[string,...], explain }
 *   answer      = die Woerter in richtiger Reihenfolge
 *   distractors = 2-3 zusaetzliche falsche Kacheln
 *
 * --- 'order' (Arbeitsschritte in die richtige Reihenfolge) ------------------
 * { id, type:'order', prompt, steps:[string,...], explain }
 *   steps = bereits in KORREKTER Reihenfolge; die UI mischt selbst.
 *   4-6 Schritte. Der wichtigste Typ fuer Hausstandards.
 *
 * --- 'match' (Paare zuordnen) -----------------------------------------------
 * { id, type:'match', prompt, pairs:[[left,right],...], explain }
 *   3-4 Paare, z.B. Reinigungsmittel → Einsatzort
 *
 * --- 'truefalse' (Richtig oder Falsch) --------------------------------------
 * { id, type:'truefalse', statement, answer:boolean, explain }
 *   Gut fuer Hygiene-/Sicherheitsregeln und typische Irrtuemer.
 */

export const EXERCISE_TYPES = ["choice", "vocab", "build", "order", "match", "truefalse"];
export const BRIDGE_LANGS = ["en", "tr", "sk"];

/** Zaehlt alle Aufgaben einer Rolle — fuer Fortschrittsanzeigen. */
export function countExercises(role) {
  return role.units.reduce(
    (sum, unit) => sum + unit.lessons.reduce((s, lesson) => s + lesson.exercises.length, 0),
    0
  );
}

/** Flache Liste aller Lektionen einer Rolle, in Reihenfolge des Pfads. */
export function allLessons(role) {
  return role.units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({ ...lesson, unitId: unit.id, unitTitle: unit.title }))
  );
}

/** Findet eine Lektion ueber ihre ID. */
export function findLesson(role, lessonId) {
  return allLessons(role).find((l) => l.id === lessonId) || null;
}
