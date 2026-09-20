import { ASSET_PROMPT_CATALOG, findAssetsForDescription } from "./assetLibrary.js";
import { mistralEnabled, mistralJson } from "./mistralClient.js";

const serverAiEnabled = typeof __WORKLINGO_SERVER_AI__ !== "undefined" && __WORKLINGO_SERVER_AI__;
export const aiGenerationEnabled = serverAiEnabled || mistralEnabled;

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

function createCustomSceneFromDraft(draft, description = "") {
  const title = String(draft?.title || description || "Arbeitsablauf").slice(0, 36);
  const value = `${title} ${description}`.toLocaleLowerCase("de");
  const isVacuum = /staub|saug|vacuum|filter|beutel|behälter|behaelter/.test(value);
  const isCoffee = /kaffee|vollautomat|trester|brüh|brueh/.test(value);
  const isMachine = isVacuum || isCoffee || /maschine|geraet|gerät|terminal|spender/.test(value);
  const checkFrame = Math.max(3, Math.min(5, (draft?.storyboard?.length || draft?.animation?.length || 4) - 1));

  if (isVacuum) {
    return {
      label: "Staubsauger reinigen",
      background: "wall",
      floor: "floor",
      elements: [
        { type: "text", x: 240, y: 38, value: title, fill: "text", fontSize: 15, fontWeight: "700", textAnchor: "middle" },
        { type: "rect", x: 112, y: 132, width: 180, height: 72, rx: 26, fill: "panel", stroke: "line", showFrom: 0, motion: "focus" },
        { type: "circle", cx: 154, cy: 214, r: 18, fill: "muted", stroke: "line", showFrom: 0 },
        { type: "circle", cx: 256, cy: 214, r: 18, fill: "muted", stroke: "line", showFrom: 0 },
        { type: "path", d: "M292 154 C340 110 374 118 404 78", fill: "none", stroke: "muted", strokeWidth: 8, showFrom: 0, motion: "focus" },
        { type: "rect", x: 168, y: 146, width: 72, height: 35, rx: 8, fill: "blueSoft", stroke: "accent", showFrom: 1, motion: "open" },
        { type: "text", x: 204, y: 168, value: "Behälter öffnen", fill: "text", fontSize: 10, textAnchor: "middle", showFrom: 1 },
        { type: "rect", x: 306, y: 142, width: 54, height: 42, rx: 7, fill: "yellow", stroke: "orange", showFrom: 2, motion: "remove" },
        { type: "text", x: 333, y: 169, value: "Filter", fill: "text", fontSize: 11, fontWeight: "700", textAnchor: "middle", showFrom: 2 },
        { type: "line", x1: 126, y1: 108, x2: 350, y2: 108, stroke: "accent", strokeWidth: 7, showFrom: 3, motion: "wipe" },
        { type: "text", x: 240, y: 96, value: "ausleeren und trocken reinigen", fill: "accent", fontSize: 12, fontWeight: "700", textAnchor: "middle", showFrom: 3 },
        { type: "circle", cx: 398, cy: 214, r: 22, fill: "green", stroke: "green", showFrom: checkFrame, motion: "check" },
        { type: "path", d: "M388 214 L396 222 L410 205", fill: "none", stroke: "surface", strokeWidth: 5, showFrom: checkFrame, motion: "check" }
      ]
    };
  }

  return {
    label: title,
    background: isMachine ? "wall" : "blueSoft",
    floor: "floor",
    elements: [
      { type: "text", x: 240, y: 38, value: title, fill: "text", fontSize: 15, fontWeight: "700", textAnchor: "middle" },
      { type: "rect", x: 126, y: 84, width: 228, height: 134, rx: 14, fill: "panel", stroke: "line", showFrom: 0, motion: "focus" },
      { type: "rect", x: 148, y: 106, width: 184, height: 36, rx: 8, fill: "surface", stroke: "line", showFrom: 0 },
      { type: "text", x: 240, y: 129, value: isCoffee ? "Kaffeemaschine" : "Arbeitsgerät", fill: "text", fontSize: 13, fontWeight: "700", textAnchor: "middle", showFrom: 0 },
      { type: "rect", x: 170, y: 154, width: 84, height: 44, rx: 8, fill: "blueSoft", stroke: "accent", showFrom: 1, motion: "open" },
      { type: "rect", x: 274, y: 158, width: 58, height: 36, rx: 7, fill: "yellow", stroke: "orange", showFrom: 2, motion: "remove" },
      { type: "line", x1: 150, y1: 235, x2: 330, y2: 235, stroke: "accent", strokeWidth: 7, showFrom: 3, motion: "wipe" },
      { type: "text", x: 240, y: 258, value: "reinigen und kontrollieren", fill: "accent", fontSize: 12, fontWeight: "700", textAnchor: "middle", showFrom: 3 },
      { type: "circle", cx: 386, cy: 202, r: 21, fill: "green", stroke: "green", showFrom: checkFrame, motion: "check" },
      { type: "path", d: "M376 202 L384 210 L400 192", fill: "none", stroke: "surface", strokeWidth: 5, showFrom: checkFrame, motion: "check" }
    ]
  };
}

function normalizeGeneratedDraft(draft, description = "") {
  const normalized = { ...draft };
  const value = `${normalized.title || ""} ${description}`.toLocaleLowerCase("de");
  const sceneText = `${normalized.customScene?.label || ""} ${(normalized.customScene?.elements || []).map((element) => element.value || "").join(" ")}`.toLocaleLowerCase("de");
  const needsVacuumScene = /staub|saug|vacuum|filter|beutel|behälter|behaelter/.test(value);
  const hasVacuumScene = /staub|saug|vacuum|filter|beutel|behälter|behaelter/.test(sceneText);
  if (!normalized.storyboard?.length) {
    normalized.storyboard = normalized.animation?.map((caption) => ({
      caption,
      detail: caption,
      assetId: normalized.objects?.[0]?.id || "hotel-bed",
      state: "closed",
      motion: "focus"
    })) || [];
  }
  if (!normalized.customScene?.elements?.length || normalized.customScene.elements.length < 8 || (needsVacuumScene && !hasVacuumScene)) {
    normalized.customScene = createCustomSceneFromDraft(normalized, description);
  }
  return normalized;
}

export async function generateLessonDraft(description) {
  try {
    const response = await fetch("/api/lesson-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        assets: ASSET_PROMPT_CATALOG
      })
    });

    if (response.ok) {
      const result = await response.json();
      const draft = normalizeGeneratedDraft(result.draft, description);
      return { draft, usedFallback: false, source: result.source || "openai" };
    }

    if (response.status !== 404 && response.status !== 503) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || `Lesson API ${response.status}`);
    }
  } catch (error) {
    console.warn("OpenAI-Lektionsgenerierung fehlgeschlagen", error);
  }

  if (!mistralEnabled) return { draft: normalizeGeneratedDraft(fallbackDraft(description), description), usedFallback: true };
  try {
    const generated = await mistralJson({
      system: [
        "Du bist der WorkLingo Lesson Director. Du verwandelst einen freien deutschen Wunsch in eine vollständige, visuell inszenierte A2-Microlearning-Lektion für Hotelmitarbeitende.",
        "Nutze ausschließlich IDs aus dem gelieferten Objektkatalog. scene ist room, bath, buffet oder reception; taskType ist decision, order, hotspot oder checklist.",
        "Erzeuge 3 bis 6 konkrete storyboard-Schritte. Jeder Schritt hat caption, assetId, state (closed, open oder clean) und motion (focus, open, close, remove, insert, wipe oder check).",
        "Liefere immer customScene als sicheren Formen-Baukasten, nicht als rohes SVG. Sie muss das konkrete Objekt und die Handlung aus dem Wunsch zeigen.",
        "Die Handlung muss fachlich plausibel und in sichtbarer Reihenfolge sein. Schreibe kurze, einfache Sätze. Antworte ausschließlich als valides JSON."
      ].join(" "),
      prompt: `Wunsch des Admins: ${description}\nVerfügbare interaktive Objekte: ${JSON.stringify(ASSET_PROMPT_CATALOG)}\nAusgabe: {"title":"", "goal":"", "minutes":4, "scene":"", "customScene":{"label":"","background":"wall","floor":"floor","elements":[]}, "objects":[{"id":"", "x":50, "y":58}], "animation":[""], "storyboard":[{"caption":"", "assetId":"", "state":"closed", "motion":"focus"}], "taskType":"decision", "question":"", "correctAnswer":"", "wrongAnswerOne":"", "wrongAnswerTwo":"", "explanation":""}`
    });
    if (!generated?.title || !generated?.goal) throw new Error("Unvollständige Generierung");
    return { draft: normalizeGeneratedDraft(generated, description), usedFallback: false };
  } catch (error) {
    console.warn("Lektionsgenerierung fehlgeschlagen", error);
    return { draft: normalizeGeneratedDraft(fallbackDraft(description), description), usedFallback: true };
  }
}
