/**
 * Mehrsprachigkeit im Lern-Tab
 * ============================
 * Kernanforderung aus dem Case: "auch ohne Deutschkenntnisse".
 *
 * Jeder sichtbare Text ist ein Objekt mit einem Eintrag je Sprache:
 *
 *     caption: { de: "Matratze prüfen", en: "Check the mattress", ... }
 *
 * Deutsch ist die Grundsprache und immer vorhanden. Fehlt eine
 * Übersetzung, faellt t() auf Deutsch zurueck statt leer zu bleiben —
 * lieber ein deutscher Satz als gar keiner.
 */

export const LANGS = [
  ["de", "Deutsch",  "DE"],
  ["en", "English",  "EN"],
  ["pl", "Polski",   "PL"],
  ["hr", "Hrvatski", "HR"],
  ["sr", "Srpski",   "SR"]
];

export const LANG_CODES = LANGS.map(([code]) => code);

/** Holt den Text in der gewuenschten Sprache. */
export function t(field, lang) {
  if (field === null || field === undefined) return "";
  if (typeof field === "string") return field;      // noch nicht uebersetzte Inhalte
  return field[lang] || field.de || "";
}

/** Uebersetzt eine Liste von Texten. */
export function tList(list, lang) {
  return (list || []).map((item) => t(item, lang));
}

/**
 * Prueft ein Curriculum auf fehlende Uebersetzungen.
 * Wird vom Test benutzt, damit Luecken auffallen statt still
 * auf Deutsch zurueckzufallen.
 */
export function missingTranslations(role) {
  const gaps = [];
  const walk = (node, path) => {
    if (node === null || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
    // Ein Textfeld erkennt man am 'de'-Schluessel
    if (typeof node.de === "string") {
      for (const code of LANG_CODES) {
        if (code !== "de" && !node[code]) gaps.push({ path, lang: code, de: node.de });
      }
      return;
    }
    for (const [key, val] of Object.entries(node)) walk(val, path ? `${path}.${key}` : key);
  };
  walk(role, role.id || "");
  return gaps;
}
