/**
 * Prueft die Sprachhilfe von Ende zu Ende.
 * Ausfuehren:  node src/sprachhilfe/validate.mjs
 *
 * Es reicht nicht, dass die Daten da sind — jede Aufgabe muss LOESBAR und
 * EINDEUTIG sein. Der Test spielt deshalb jede Aufgabe mit der richtigen
 * Antwort durch und prueft, dass genau eine Option stimmt. Ohne diese
 * Pruefung waeren z.B. "Information" und "Auskunft" auf Kroatisch beide
 * "informacija" — zwei richtige Antworten, und der Lernende verliert ein Herz
 * fuer etwas, das er kann.
 */
import { ROLES } from "../sprachhilfe-inhalte/index.js";
import { allLessons, countExercises } from "../sprachhilfe-inhalte/types.js";
import { isAnswered, isCorrect, solutionLines } from "./grade.js";
import {
  wordsOfRole, blocksOfRole, buildDeck, cardIdsOfWord,
  DIRECTIONS, WORD_LANGS, WORDS_PER_BLOCK
} from "./vokabular.js";
import { UI, LANGS, LANG_CODES } from "./ui.js";

const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

/** Die richtige Antwort in der Form, wie der Player sie liefern wuerde. */
function solutionValue(ex) {
  switch (ex.type) {
    case "choice": case "vocab": case "truefalse": return ex.answer;
    case "build":  return ex.answer.map((word, i) => ({ key: word + "#" + i, word }));
    case "order":  return [...ex.steps];
    case "match":  return Object.fromEntries(ex.pairs.map(([l, r]) => [l, r]));
    default:       return null;
  }
}

/** Gemeinsame Pruefung fuer jede Aufgabe, egal woher sie kommt. */
function checkExercise(ex, where) {
  if (!ex.explain) fail(ex.id, "keine Erklaerung");

  const good = solutionValue(ex);
  if (!isAnswered(ex, good)) fail(ex.id, "richtige Antwort gilt als unvollstaendig");
  if (!isCorrect(ex, good)) fail(ex.id, "richtige Antwort wird als falsch gewertet");
  if (!solutionLines(ex).length) fail(ex.id, "keine anzeigbare Loesung");

  if (ex.type === "choice" || ex.type === "vocab") {
    if (!Array.isArray(ex.options) || ex.options.length < 2) fail(ex.id, "zu wenige Optionen");
    if (new Set(ex.options).size !== ex.options.length) {
      fail(ex.id, `${where}: doppelte Optionen — mehrere Antworten waeren richtig`);
    }
    const wrong = (ex.answer + 1) % ex.options.length;
    if (isCorrect(ex, wrong)) fail(ex.id, "falsche Antwort wird als richtig gewertet");
  }
  if (ex.type === "truefalse" && isCorrect(ex, !ex.answer)) {
    fail(ex.id, "falsche Antwort wird als richtig gewertet");
  }
}

/* ============================================================ Wortschatz */

let wordCount = 0, cardCount = 0, blockCount = 0;
const seenWordIds = new Set();

for (const role of ROLES) {
  const words = wordsOfRole(role.id);
  wordCount += words.length;
  if (words.length < 50) fail(role.id, `nur ${words.length} Begriffe im Wortschatz`);

  for (const w of words) {
    if (seenWordIds.has(w.id)) fail(w.id, "doppelte Wort-ID");
    seenWordIds.add(w.id);
    if (!w.de) fail(w.id, "kein deutsches Wort");
    for (const lang of WORD_LANGS) {
      if (!w.tr?.[lang]) fail(w.id, `Uebersetzung fehlt: ${lang}`);
    }
    if (cardIdsOfWord(w).length !== DIRECTIONS.length) fail(w.id, "unerwartete Zahl an Karten-IDs");
  }

  // Bloecke decken den ganzen Wortschatz ab, ohne Luecke und ohne Dopplung.
  const blocks = blocksOfRole(role.id);
  blockCount += blocks.length;
  const inBlocks = blocks.flatMap((b) => b.words.map((w) => w.id));
  if (inBlocks.length !== words.length) fail(role.id, "Bloecke decken nicht alle Woerter ab");
  if (new Set(inBlocks).size !== inBlocks.length) fail(role.id, "ein Wort steckt in zwei Bloecken");
  for (const b of blocks.slice(0, -1)) {
    if (b.words.length !== WORDS_PER_BLOCK) fail(b.id, `Block hat ${b.words.length} Woerter`);
  }

  // Jeder Block, jede Sprache, beide Richtungen.
  for (const lang of WORD_LANGS) {
    for (const dir of DIRECTIONS) {
      for (const block of blocks) {
        const deck = buildDeck(block.words, lang, dir, { id: block.id, title: "Test" });
        if (deck.id !== block.id) fail(block.id, "Stapel-ID haengt an Sprache oder Richtung");
        if (deck.cards.length !== block.words.length) {
          fail(block.id, `${lang}/${dir}: ${deck.cards.length} Karten statt ${block.words.length}`);
        }
        const ids = deck.cards.map((c) => c.id);
        if (new Set(ids).size !== ids.length) fail(block.id, `${lang}/${dir}: Karte doppelt`);

        for (const card of deck.cards) {
          cardCount += 1;
          if (!card.front) fail(card.id, `${lang}/${dir}: Vorderseite leer`);
          if (!card.back) fail(card.id, `${lang}/${dir}: Rueckseite leer`);
          if (card.front === card.back) {
            // Kommt vor (z.B. "Lobby" = "lobby"), ist aber keine Uebung.
            // Nur melden, wenn es die deutsche Seite selbst betrifft.
            if (card.de !== card.target) fail(card.id, `${lang}/${dir}: beide Seiten gleich`);
          }
          const expectDir = dir === "de2tr" ? card.de : card.target;
          if (card.front !== expectDir) fail(card.id, `${lang}/${dir}: falsche Richtung`);
        }
      }
    }
  }
}

/* ================================================================= Kurs */

let exCount = 0;
for (const role of ROLES) {
  const ids = new Set();
  for (const lesson of allLessons(role)) {
    if (!lesson.exercises?.length) fail(lesson.id, "Lektion ohne Aufgaben");
    for (const ex of lesson.exercises) {
      exCount += 1;
      if (ids.has(ex.id)) fail(ex.id, "doppelte Aufgaben-ID");
      ids.add(ex.id);
      checkExercise(ex, "Kurs");
      if (ex.type === "build") {
        const overlap = (ex.distractors || []).filter((d) => ex.answer.includes(d));
        if (overlap.length) fail(ex.id, `Ablenker steht auch in der Loesung: ${overlap.join(", ")}`);
      }
      if (ex.type === "order" && new Set(ex.steps).size !== ex.steps.length) {
        fail(ex.id, "doppelte Schritte — die Reihenfolge waere nicht eindeutig");
      }
    }
  }
}

/* =========================================================== Uebersetzung */

let labelCount = 0;
function checkLabel(where, field) {
  labelCount += 1;
  if (typeof field !== "object" || field === null) {
    fail(where, "Label ist noch ein blosser String — keine Uebersetzung moeglich");
    return;
  }
  for (const code of LANG_CODES) if (!field[code]) fail(where, `Label fehlt: ${code}`);
}

for (const role of ROLES) {
  checkLabel(role.id + ".name", role.name);
  checkLabel(role.id + ".tagline", role.tagline);
  checkLabel(role.id + ".blurb", role.blurb);
  for (const unit of role.units) {
    checkLabel(unit.id + ".title", unit.title);
    checkLabel(unit.id + ".subtitle", unit.subtitle);
    for (const lesson of unit.lessons) checkLabel(lesson.id + ".title", lesson.title);
  }
}

for (const [key, field] of Object.entries(UI)) {
  for (const [code] of LANGS) if (!field[code]) fail("UI." + key, `Text fehlt: ${code}`);
}

/* =============================================================== Bericht */

const total = ROLES.reduce((n, r) => n + countExercises(r), 0);
console.log(
  `Bereiche: ${ROLES.length} · Woerter: ${wordCount} in ${blockCount} Bloecken · ` +
  `Karten geprueft: ${cardCount} (${WORD_LANGS.length} Sprachen x ${DIRECTIONS.length} Richtungen) · ` +
  `Kursaufgaben: ${exCount}/${total} · Labels: ${labelCount} · UI-Texte: ${Object.keys(UI).length}`
);

if (problems.length) {
  const unique = [...new Set(problems)];
  console.error(`\n${unique.length} Problem(e):`);
  unique.slice(0, 40).forEach((p) => console.error("  - " + p));
  if (unique.length > 40) console.error(`  … und ${unique.length - 40} weitere`);
  process.exit(1);
}
console.log("Alles in Ordnung.");
