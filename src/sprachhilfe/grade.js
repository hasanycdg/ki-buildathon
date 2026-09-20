/**
 * Auswertung einer Sprachaufgabe
 * ==============================
 * Eigenes Modul, damit Player, Wortliste und Tests exakt denselben Code
 * benutzen. Aufgabentypen und Feldnamen siehe ../sprachhilfe-inhalte/types.js
 */

export function isAnswered(ex, value) {
  if (value === null || value === undefined) return false;
  if (ex.type === "build") return value.length > 0;
  if (ex.type === "order") return value.length === ex.steps.length;
  if (ex.type === "match") return Object.keys(value).length === ex.pairs.length;
  return true;
}

export function isCorrect(ex, value) {
  switch (ex.type) {
    case "choice":
    case "vocab":
    case "truefalse":
      return value === ex.answer;
    case "build":
      return value.map((v) => v.word).join(" ") === ex.answer.join(" ");
    case "order":
      return value.join("|") === ex.steps.join("|");
    case "match":
      return ex.pairs.every(([l, r]) => value[l] === r);
    default:
      return false;
  }
}

/** Die richtige Loesung als Text — wird nach einem Fehler angezeigt. */
export function solutionLines(ex) {
  switch (ex.type) {
    case "choice":
    case "vocab":
      return [ex.options[ex.answer]];
    case "truefalse":
      return [ex.answer ? "Richtig" : "Falsch"];
    case "build":
      return [ex.answer.join(" ")];
    case "order":
      return [...ex.steps];
    case "match":
      return ex.pairs.map(([l, r]) => `${l} → ${r}`);
    default:
      return [];
  }
}
