import { ASSET_PROMPT_CATALOG, findAssetsForDescription } from "./assetLibrary.js";
import { mistralEnabled, mistralJson } from "./mistralClient.js";

export const aiGenerationEnabled = mistralEnabled;

function fallbackDraft(description) {
  if (description.startsWith(" Bestehender Entwurf:")) {
    try {
      const marker = "}. Änderungswunsch: ";
      const end = description.indexOf(marker);
      const existing = JSON.parse(description.slice(description.indexOf("{") , end + 1));
      const request = description.slice(end + marker.length).toLowerCase();
      if (request.includes("checkliste")) existing.taskType = "checklist";
      if (request.includes("reihenfolge") || request.includes("sortier")) existing.taskType = "order";
      if (request.includes("finden") || request.includes("antippen")) existing.taskType = "hotspot";
      if (request.includes("badezimmer") || request.includes("bad ")) existing.scene = "bath";
      if (request.includes("buffet") || request.includes("frühstück")) existing.scene = "buffet";
      if (request.includes("rezeption")) existing.scene = "reception";
      if (request.includes("zimmer")) existing.scene = "room";
      if (request.includes("kürzer")) existing.animation = existing.animation.slice(0, 3);
      return existing;
    } catch {
      /* Bei unvollstaendigem Kontext wird unten eine neue Vorlage erzeugt. */
    }
  }
  const clean = description.trim().replace(/[.!?]+$/, "");
  const subject = clean
    .replace(/^(zeige|erkläre)\s+(neuen\s+)?mitarbeitenden,?\s+wie\s+(sie\s+)?/i, "")
    .replace(/^neue\s+mitarbeitende\s+lernen,?\s+wie\s+sie\s+/i, "")
    .replace(/\s+und\s+(am ende|danach|anschließend)\s+.+$/i, "");
  const readable = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : clean;
  const title = readable.length > 58 ? `${readable.slice(0, 55)}…` : readable;
  const lower = clean.toLowerCase();
  const scene = lower.includes("bad") || lower.includes("dusche") ? "bath"
    : lower.includes("buffet") || lower.includes("frühstück") ? "buffet"
      : lower.includes("rezeption") || lower.includes("gast") ? "reception" : "room";
  const assets = findAssetsForDescription(clean);
  const isCoffee = assets.some((asset) => asset.id === "coffee-machine");
  const animation = isCoffee
    ? ["Kaffeemaschine sicher ausschalten", "Serviceklappe öffnen", "Tresterbehälter und Abtropfschale herausziehen", "Alle Teile hygienisch reinigen", "Teile einsetzen und Maschine schließen"]
    : ["Arbeitsplatz vorbereiten", "Handgriff korrekt ausführen", "Ergebnis kontrollieren"];
  return {
    title: title || "Neuer Arbeitsablauf",
    goal: `Mitarbeitende führen „${title || "diesen Arbeitsablauf"}“ sicher und in der richtigen Reihenfolge aus.`,
    minutes: 4,
    scene,
    objects: assets.map((asset, index) => ({ id: asset.id, x: 50 + index * 9, y: 58 + index * 4 })),
    animation,
    storyboard: animation.map((caption, index) => ({
      caption,
      assetId: assets[0]?.id || "hotel-bed",
      state: isCoffee && index >= 1 && index <= 3 ? "open" : "closed",
      motion: index === 1 ? "open" : index === animation.length - 1 ? "close" : "focus"
    })),
    taskType: "decision",
    question: `Was ist bei „${title || "diesem Arbeitsablauf"}“ besonders wichtig?`,
    correctAnswer: "Den vorgegebenen Ablauf einhalten und das Ergebnis kontrollieren",
    wrongAnswerOne: "Den Kontrollschritt auslassen, um Zeit zu sparen",
    wrongAnswerTwo: "Ohne Vorbereitung direkt beginnen",
    explanation: "Vorbereitung, korrekte Ausführung und Endkontrolle verhindern Fehler und sichern den Hausstandard."
  };
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  return JSON.parse(text.slice(start, end + 1));
}

export async function generateLessonDraft(description) {
  if (!mistralEnabled) return { draft: fallbackDraft(description), usedFallback: true };
  try {
    const generated = await mistralJson({
      system: [
        "Du bist der WorkLingo Lesson Director. Du verwandelst einen freien deutschen Wunsch in eine vollständige, visuell inszenierte A2-Microlearning-Lektion für Hotelmitarbeitende.",
        "Nutze ausschließlich IDs aus dem gelieferten Objektkatalog. scene ist room, bath, buffet oder reception; taskType ist decision, order, hotspot oder checklist.",
        "Erzeuge 3 bis 6 konkrete storyboard-Schritte. Jeder Schritt hat caption, assetId, state (closed, open oder clean) und motion (focus, open, close, remove, insert, wipe oder check).",
        "Die Handlung muss fachlich plausibel und in sichtbarer Reihenfolge sein. Schreibe kurze, einfache Sätze. Antworte ausschließlich als valides JSON."
      ].join(" "),
      prompt: `Wunsch des Admins: ${description}\nVerfügbare interaktive Objekte: ${JSON.stringify(ASSET_PROMPT_CATALOG)}\nAusgabe: {"title":"", "goal":"", "minutes":4, "scene":"", "objects":[{"id":"", "x":50, "y":58}], "animation":[""], "storyboard":[{"caption":"", "assetId":"", "state":"closed", "motion":"focus"}], "taskType":"decision", "question":"", "correctAnswer":"", "wrongAnswerOne":"", "wrongAnswerTwo":"", "explanation":""}`
    });
    if (!generated?.title || !generated?.goal) throw new Error("Unvollständige Generierung");
    if (!generated.storyboard?.length) generated.storyboard = generated.animation?.map((caption) => ({ caption, assetId: generated.objects?.[0]?.id || "hotel-bed", state: "closed", motion: "focus" }));
    return { draft: generated, usedFallback: false };
  } catch (error) {
    console.warn("Lektionsgenerierung fehlgeschlagen", error);
    return { draft: fallbackDraft(description), usedFallback: true };
  }
}
