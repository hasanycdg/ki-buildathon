/**
 * Auswertung einer Antwort. Eigenes Modul, damit App UND Tests
 * exakt denselben Code benutzen.
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
      return value === ex.answer;
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

/** Die korrekte Loesung — fuer Tests und spaeter fuer einen Vorlese-Modus. */
export function solutionOf(ex) {
  switch (ex.type) {
    case "choice":
    case "vocab":
    case "truefalse":
      return ex.answer;
    case "build":
      return ex.answer.map((word, i) => ({ key: word + "#" + i, word }));
    case "order":
      return [...ex.steps];
    case "match":
      return Object.fromEntries(ex.pairs.map(([l, r]) => [l, r]));
    default:
      return null;
  }
}
