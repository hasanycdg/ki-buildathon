/**
 * Der Wortschatz je Abteilung
 * ===========================
 * Quelle: src/data/hotelVokabeln.json — 397 Begriffe, siebensprachig,
 * aufgeteilt auf die vier Abteilungen des Hauses.
 *
 * Aus diesen Wortpaaren baut dieses Modul beides, was der Reiter braucht:
 *
 *   BLOECKE  — je zehn Woerter. Ein Block ist eine Portion, die man an einem
 *              Stueck lernen und danach trainieren kann. 100 Woerter am Stueck
 *              lernt niemand.
 *   KARTEN   — Karteikarten mit dem deutschen Wort vorne und der Uebersetzung
 *              hinten (oder umgekehrt). Der Lernende dreht selbst um und sagt
 *              selbst, ob er es wusste. Das ist ehrlicher als Multiple Choice:
 *              dort raet man sich mit vier Optionen durch, ohne das Wort je
 *              abgerufen zu haben.
 */
import raw from "../data/hotelVokabeln.json" with { type: "json" };

/** Abteilung im JSON -> Rollen-ID der App. Kuerzel = Praefix der Wort-IDs. */
const DEPARTMENTS = [
  { roleId: "housekeeping", key: "housekeeping",      prefix: "hk" },
  { roleId: "reception",    key: "reception",         prefix: "rc" },
  { roleId: "breakfast",    key: "breakfast_buffet",  prefix: "bf" },
  { roleId: "cleaning",     key: "public_areas",      prefix: "cl" }
];

/** Sprachen des Wortschatzes. Schluessel im JSON ist gross geschrieben. */
export const WORD_LANGS = ["en", "pl", "hr", "sr", "tr", "sl"];

export const WORDS_PER_BLOCK = 10;

/** Deutsches Wort -> stabile ID. Bleibt gleich, auch wenn die Liste umsortiert wird. */
function slug(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shuffle(list, seed) {
  const arr = [...list];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Zahlenwert eines Textes — als Saatgut fuers Mischen, damit es stabil bleibt. */
function seedOf(text) {
  let n = 7;
  for (let i = 0; i < text.length; i++) n = (n * 31 + text.charCodeAt(i)) % 233280;
  return n;
}

/* ------------------------------------------------------------ Aufbereitung */

const BY_ROLE = {};
for (const dept of DEPARTMENTS) {
  const list = raw.hotel_vocabulary[dept.key] || [];
  BY_ROLE[dept.roleId] = list.map((entry, index) => ({
    id: dept.prefix + ":" + slug(entry.DE),
    de: entry.DE,
    index,
    tr: {
      en: entry.EN, pl: entry.PL, hr: entry.HR,
      sr: entry.SR, tr: entry.TR, sl: entry.SL
    }
  }));
}

/** Alle Woerter einer Abteilung. */
export function wordsOfRole(roleId) {
  return BY_ROLE[roleId] || [];
}

export function countWordsOfRole(roleId) {
  return wordsOfRole(roleId).length;
}

/**
 * Die Woerter in Bloecke zu zehn. Der letzte Block darf kuerzer sein —
 * lieber ein Block mit sieben Woertern als sieben Woerter, die nie drankommen.
 */
export function blocksOfRole(roleId) {
  const words = wordsOfRole(roleId);
  const blocks = [];
  for (let i = 0; i < words.length; i += WORDS_PER_BLOCK) {
    const slice = words.slice(i, i + WORDS_PER_BLOCK);
    blocks.push({
      id: roleId + "-b" + (blocks.length + 1),
      index: blocks.length,
      number: blocks.length + 1,
      from: slice[0].de,
      to: slice[slice.length - 1].de,
      words: slice
    });
  }
  return blocks;
}

/* ---------------------------------------------------------------- Karten */

/** Die zwei Richtungen. Erkennen und Abrufen sind zwei verschiedene Dinge. */
export const DIRECTIONS = ["de2tr", "tr2de"];

/**
 * Ein Kartenstapel aus einer Wortmenge.
 *
 * Vorne steht, was gefragt ist, hinten die Loesung — beide Seiten zeigen nach
 * dem Umdrehen das ganze Paar, sonst lernt man die Zuordnung nur halb.
 * Die Reihenfolge wird gemischt, aber deterministisch: derselbe Block sieht
 * beim zweiten Durchgang gleich aus, das Wiedererkennen hilft.
 */
export function buildDeck(words, lang, direction, { id, title }) {
  const de2tr = direction !== "tr2de";
  const cards = shuffle(words, seedOf(words.map((w) => w.id).join("")) + 11)
    .map((word) => {
      const target = word.tr?.[lang] || word.de;
      return {
        // Die ID haengt an der Richtung, nicht an der Sprache: wer nur eine
        // Muttersprache hat, wechselt sie nicht — die Richtung schon.
        id: word.id + "#" + (de2tr ? "de2tr" : "tr2de"),
        word,
        front: de2tr ? word.de : target,
        back: de2tr ? target : word.de,
        de: word.de,
        target
      };
    });
  return { id, title, direction: de2tr ? "de2tr" : "tr2de", cards };
}

/** Die IDs beider Karten zu einem Wort — der Schluessel zu seinem Fortschritt. */
export function cardIdsOfWord(word) {
  return DIRECTIONS.map((d) => word.id + "#" + d);
}

/**
 * Wie gut sitzt EIN Wort? Mittel ueber die Karten, die es dazu schon gab.
 * Nie geuebte Richtungen zaehlen nicht mit — sonst saehe ein Wort schwach aus,
 * nur weil es die Rueckrichtung noch nicht gab.
 */
export function wordStrength(items, word, strengthOf) {
  const seen = cardIdsOfWord(word).map((id) => items[id]).filter(Boolean);
  if (!seen.length) return 0;
  return seen.reduce((sum, it) => sum + strengthOf(it), 0) / seen.length;
}

/** Findet ein Wort ueber seine ID — fuer den Fortschritt in der Wortliste. */
export function findWord(roleId, wordId) {
  return wordsOfRole(roleId).find((w) => w.id === wordId) || null;
}
