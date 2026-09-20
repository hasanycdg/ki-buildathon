import { mistralEnabled, mistralJson } from "./mistralClient.js";

export const automaticTranslationEnabled = mistralEnabled;

const FIELDS = ["title", "goal", "question", "correctAnswer", "wrongAnswerOne", "wrongAnswerTwo", "explanation"];

function transpose(result) {
  const translations = {};
  FIELDS.forEach((field) => {
    translations[field] = {};
    ["en", "pl", "hr", "sr"].forEach((lang) => {
      if (result?.[lang]?.[field]) translations[field][lang] = String(result[lang][field]);
    });
  });
  return translations;
}

function germanFallback(draft) {
  const translations = {};
  FIELDS.forEach((field) => {
    translations[field] = Object.fromEntries(["en", "pl", "hr", "sr"].map((lang) => [lang, draft[field] || ""]));
  });
  return translations;
}

export async function translateAdminDraft(draft) {
  if (!mistralEnabled) return { translations: germanFallback(draft), usedFallback: true };
  try {
    const source = Object.fromEntries(FIELDS.map((field) => [field, draft[field] || ""]));
    const result = await mistralJson({
      system: "Du übersetzt kurze Schulungsinhalte für Hotelmitarbeitende natürlich, eindeutig und auf A2-Sprachniveau. Behalte leere Felder leer. Antworte nur als valides JSON.",
      prompt: `Übersetze dieses JSON nach Englisch (en), Polnisch (pl), Kroatisch (hr) und Serbisch in lateinischer Schrift (sr). Ausgabeformat: {"en": {...alle Felder...}, "pl": {...}, "hr": {...}, "sr": {...}}. Quelle: ${JSON.stringify(source)}`
    });
    return { translations: transpose(result), usedFallback: false };
  } catch (error) {
    console.warn("Automatische Übersetzung fehlgeschlagen", error);
    return { translations: germanFallback(draft), usedFallback: true };
  }
}
