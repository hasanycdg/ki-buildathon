/**
 * Laufzeit-Beweis: Durchklicken funktioniert nicht.
 * Ausfuehren mit:  node src/learn/simulate.mjs
 */
import { ROLES } from "./roles/index.js";
import { createQueue, answer, isComplete, current, qualityOf } from "./queue.js";
import { isCorrect, solutionOf } from "./grade.js";
import { emptyState, recordAnswer, completeLesson } from "./store.js";

const MAX = 400;

/** Spielt eine Lektion mit einer bestimmten Antwortstrategie durch. */
function play(lesson, strategy) {
  let q = createQueue(lesson.exercises);
  let steps = 0, wrong = 0;
  let state = emptyState();

  while (!isComplete(q) && steps < MAX) {
    const ex = current(q).exercise;
    const value = strategy(ex);
    const correct = isCorrect(ex, value);
    if (!correct) wrong++;
    const res = answer(q, correct);
    if (res.finished) state = recordAnswer(state, res.finished.exercise.id, qualityOf(res.finished));
    q = res.queue;
    steps++;
  }
  return { steps, wrong, finished: isComplete(q), state };
}

/** Der Faule: waehlt immer die erste Option / den ersten Schritt. */
const lazy = (ex) => {
  switch (ex.type) {
    case "choice": case "vocab": return 0;
    case "truefalse": return true;
    case "build": return [{ key: ex.answer[0] + "#0", word: ex.answer[0] }];
    case "order": return [...ex.steps].reverse();
    case "match": return Object.fromEntries(ex.pairs.map(([l], i) => [l, ex.pairs[(i + 1) % ex.pairs.length][1]]));
    default: return null;
  }
};

/** Der Lernende: weiss die Antwort. */
const solver = (ex) => solutionOf(ex);

console.log("Lektion: erste Lektion jeder Rolle\n");
console.log("Rolle                  Aufgaben  | Wissender  | Rater      | Ergebnis");
console.log("-".repeat(78));

let allGood = true;
for (const role of ROLES) {
  const lesson = role.units[0].lessons[0];
  const good = play(lesson, solver);
  const bad = play(lesson, lazy);

  const ok = good.finished && good.steps === lesson.exercises.length && bad.steps > good.steps;
  if (!ok) allGood = false;

  console.log(
    role.name.padEnd(22) +
    String(lesson.exercises.length).padStart(6) + "    | " +
    (good.steps + " Schritte").padEnd(11) + "| " +
    (bad.finished ? bad.steps + " Schritte" : "gibt auf").padEnd(11) + "| " +
    (ok ? "OK" : "FEHLER")
  );
}

/* Gegenprobe: kann der Rater die Lektion ueberhaupt abschliessen, ohne zu lernen? */
const lesson = ROLES[0].units[0].lessons[0];
const bad = play(lesson, lazy);
console.log("\nDer Rater braucht " + bad.steps + " Versuche statt " + lesson.exercises.length +
            " und macht dabei " + bad.wrong + " Fehler.");
console.log("Jeder Fehler kostet ein Herz — bei 5 Herzen ist vorher Schluss.\n");

/* SRS-Beweis: nach perfektem Durchlauf ist alles terminiert. */
const good = play(lesson, solver);
const items = Object.values(good.state.items);
console.log("Nach perfektem Durchlauf: " + items.length + " Aufgaben terminiert, " +
            "naechste Wiederholung in " + items[0].intervalDays + " Tag(en).");

console.log(allGood ? "\n>>> ALLE PRUEFUNGEN BESTANDEN" : "\n>>> FEHLGESCHLAGEN");
process.exit(allGood ? 0 : 1);
