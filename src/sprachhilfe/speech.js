/**
 * Deutsche Sprachausgabe
 * ======================
 * Hilft genau denen, die kein Deutsch koennen: Wer "Bettwäsche" nur liest,
 * erkennt es im Gang nicht wieder. Langsamer als normal (0.85), weil es ums
 * Nachsprechen geht.
 */
export function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* Browser ohne Sprachausgabe: kein Drama */ }
}
