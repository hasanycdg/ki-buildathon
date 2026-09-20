/**
 * Etappen, Sterne und Zeit
 * ========================
 * Eine Taetigkeit zerfaellt in ETAPPEN. Jede Etappe hat ein Lernziel und
 * ein paar Schritte. Die Etappe ist der Kontrollpunkt:
 *
 *   - Herzen leer  -> zurueck an den ANFANG DER AKTUELLEN ETAPPE.
 *     Was du davor geschafft hast, bleibt dir. Bist du gerade erst in die
 *     Etappe gestartet, verlierst du nichts.
 *   - Kein "heute nicht mehr lernen". Wer haengt, wiederholt die Etappe.
 */

/** Etappen einer Taetigkeit. Faellt auf eine einzige Etappe zurueck,
 *  solange ein Inhalt noch die alte flache Form hat. */
export function stagesOf(task) {
  if (task.stages?.length) return task.stages;
  return [{ id: task.id + "-s1", goal: task.goal, steps: task.steps || [] }];
}

export function allSteps(task) {
  return stagesOf(task).flatMap((s) => s.steps);
}

/**
 * Sterne 1-5 fuer eine abgeschlossene Taetigkeit.
 * Fehler zaehlen, Rueckwuerfe zaehlen doppelt: Wer eine Etappe wiederholen
 * musste, hat sie beim ersten Mal nicht gekonnt.
 */
export function starsFor({ mistakes = 0, resets = 0 }) {
  const penalty = mistakes + resets * 3;
  if (penalty === 0) return 5;
  if (penalty <= 1) return 4;
  if (penalty <= 3) return 3;
  if (penalty <= 6) return 2;
  return 1;
}

/** mm:ss */
export function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Bewertungstext zur Sternzahl. */
export const STAR_TEXT = {
  5: { de: "Fehlerfrei — das sitzt.", en: "Flawless — you've got it.", pl: "Bezbłędnie — umiesz to.",
       hr: "Bez greške — to znaš.", sr: "Bez greške — to znaš." },
  4: { de: "Fast perfekt. Ein Ausrutscher.", en: "Almost perfect. One slip.",
       pl: "Prawie idealnie. Jedna wpadka.", hr: "Skoro savršeno. Jedan propust.",
       sr: "Skoro savršeno. Jedan propust." },
  3: { de: "Geschafft. Wiederhol es morgen einmal.", en: "Done. Repeat it once tomorrow.",
       pl: "Gotowe. Powtórz to jutro raz.", hr: "Gotovo. Ponovi to sutra jednom.",
       sr: "Gotovo. Ponovi to sutra jednom." },
  2: { de: "Durch — aber noch wacklig.", en: "Through — but still shaky.",
       pl: "Zaliczone — ale jeszcze niepewnie.", hr: "Prošao si — ali još nesigurno.",
       sr: "Prošao si — ali još nesigurno." },
  1: { de: "Geschafft. Das braucht noch Übung.", en: "Done. This needs more practice.",
       pl: "Gotowe. To wymaga jeszcze ćwiczeń.", hr: "Gotovo. Ovo treba još vježbe.",
       sr: "Gotovo. Ovo treba još vežbe." }
};
