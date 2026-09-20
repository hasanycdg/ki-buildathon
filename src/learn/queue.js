/**
 * Lektions-Warteschlange — das "rekursive" Lernen INNERHALB einer Lektion
 * ======================================================================
 * Exakt die Duolingo-Mechanik:
 *
 *   - Jede Aufgabe muss einmal richtig beantwortet werden, damit sie
 *     die Warteschlange verlaesst.
 *   - Eine falsche Antwort schiebt die Aufgabe zurueck in die Schlange
 *     (drei Plaetze weiter) UND erhoeht die Anzahl noetiger richtiger
 *     Antworten auf zwei.
 *   - Die Lektion ist erst vorbei, wenn die Schlange leer ist.
 *
 * Folge: Durchklicken ist nicht moeglich. Wer raet, sitzt laenger dran.
 */

const REINSERT_OFFSET = 3;

export function createQueue(exercises) {
  return {
    entries: exercises.map((exercise) => ({
      exercise,
      needed: 1,      // so viele richtige Antworten fehlen noch
      attempts: 0,
      firstTry: true  // beim ersten Versuch richtig?
    })),
    done: [],
    total: exercises.length
  };
}

export function current(queue) {
  return queue.entries[0] || null;
}

/**
 * Verarbeitet eine Antwort. Gibt ein neues Queue-Objekt zurueck plus die
 * Bewertung fuer die SRS-Ebene.
 */
export function answer(queue, correct) {
  const entries = [...queue.entries];
  const entry = { ...entries.shift() };
  entry.attempts += 1;

  if (correct) {
    entry.needed -= 1;
    if (entry.needed <= 0) {
      // geschafft — raus aus der Schlange
      return {
        queue: { ...queue, entries, done: [...queue.done, entry] },
        finished: entry,
        requeued: false
      };
    }
    // noch eine richtige Antwort noetig: ans Ende
    entries.push(entry);
    return { queue: { ...queue, entries }, finished: null, requeued: true };
  }

  // Falsch: zwei richtige Antworten noetig, drei Plaetze weiter einsortieren
  entry.needed = 2;
  entry.firstTry = false;
  const position = Math.min(REINSERT_OFFSET, entries.length);
  entries.splice(position, 0, entry);
  return { queue: { ...queue, entries }, finished: null, requeued: true };
}

export function isComplete(queue) {
  return queue.entries.length === 0;
}

/**
 * Fortschritt 0..1. Zaehlt erledigte Aufgaben gegen die Gesamtzahl —
 * der Balken kann also stehenbleiben, wenn man Fehler macht. Genau so
 * soll es sich anfuehlen.
 */
export function progress(queue) {
  return queue.total === 0 ? 1 : queue.done.length / queue.total;
}

/** Uebersetzt das Ergebnis einer Aufgabe in eine SRS-Qualitaet. */
export function qualityOf(entry) {
  if (entry.firstTry && entry.attempts === 1) return 5;
  if (entry.firstTry) return 4;
  return 3;
}
