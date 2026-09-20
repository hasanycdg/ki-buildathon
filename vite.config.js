import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hotelContext = fs.readFileSync(path.join(__dirname, "hotel_alpenblick_kontext.md"), "utf8");
const quickHelpKnowledge = JSON.parse(
  fs.readFileSync(path.join(__dirname, "src/data/quickHelpKnowledge.json"), "utf8")
);

const knowledgeBase = quickHelpKnowledge.map((entry) => ({
  id: entry.id,
  question: entry.question,
  keywords: entry.keywords,
  answer: entry.answer,
  steps: entry.steps,
  linkLabel: entry.linkLabel,
  translations: entry.translations
}));

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 8_000_000) {
        reject(new Error("Request too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function parseOpenAiJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return { answer: text.trim(), steps: [] };
  }

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return {
      answer: String(parsed.answer || text).trim(),
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String).slice(0, 5) : [],
      linkLabel: parsed.linkLabel ? String(parsed.linkLabel) : undefined
    };
  } catch {
    return { answer: text.trim(), steps: [] };
  }
}

function parseLessonDraftJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("OpenAI response did not contain JSON");
  }

  const parsed = JSON.parse(text.slice(start, end + 1));
  if (!parsed?.title || !parsed?.goal) {
    throw new Error("Generated lesson draft is incomplete");
  }
  return parsed;
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;

  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" || content.type === "text")
    .map((content) => content.text)
    .join("\n")
    .trim();
}

function lessonDraftInstructions() {
  return [
    "Du bist der WorkLingo Lesson Director.",
    "Du verwandelst freie deutsche Admin-Wuensche in vollstaendige, visuell inszenierte A2-Microlearning-Lektionen fuer Hotelmitarbeitende.",
    "Nutze ausschliesslich IDs aus dem gelieferten Objektkatalog.",
    "scene ist nur room, bath, buffet oder reception.",
    "taskType ist nur decision, order, hotspot oder checklist.",
    "Erzeuge 3 bis 6 konkrete storyboard-Schritte.",
    "Jeder storyboard-Schritt hat caption, detail, assetId, state und motion.",
    "Erzeuge fuer jede neue Admin-Lektion immer eine eigene promptbezogene customScene, damit das sichtbare Bild exakt zum Wunsch passt.",
    "Nutze scene nur als grobe Kategorie/Hintergrund-Fallback. customScene ist die primaere sichtbare Animation.",
    "customScene ist KEIN rohes SVG, sondern ein sicherer Baukasten: {\"label\":\"\", \"background\":\"wall\", \"floor\":\"floor\", \"elements\":[...]}",
    "customScene.elements duerfen nur diese types haben: rect, circle, ellipse, line, path, polyline, polygon, text.",
    "Nutze fuer Farben bevorzugt diese Tokens: wall, floor, surface, panel, panel2, line, text, muted, accent, green, red, orange, yellow, blueSoft.",
    "Jedes Element darf showFrom, hideAfter und motion haben, damit es mit den storyboard-Frames sichtbar animiert wird.",
    "Die customScene muss das konkrete Objekt und die konkrete Handlung aus dem Wunsch zeigen, z.B. bei Staubsauger reinigen: Staubsauger, Behaelter/Filter, Ausleeren/Reinigen, Kontrollhaken.",
    "Halte customScene im gleichen flachen, klaren Schulungsstil wie die vorhandenen SVG-Szenen.",
    "state ist nur closed, open oder clean.",
    "motion ist nur focus, open, close, remove, insert, wipe oder check.",
    "Die Handlung muss fachlich plausibel und sichtbar animierbar sein.",
    "Schreibe kurze, einfache Saetze. Zielniveau A2.",
    "Antworte ausschliesslich als valides JSON ohne Markdown-Codeblock."
  ].join("\n");
}

function quickHelpInstructions() {
  return [
    "Du bist der Quick-Help-Chatbot in WorkLingo fuer das fiktive Hotel Alpenblick.",
    "Du hilfst neuen Mitarbeitenden in Housekeeping, Rezeption, Restaurant und Fruehstuecksservice.",
    "Nutze ausschliesslich den Hotelkontext und die Quick-Help-Wissensbasis als fachliche Grundlage.",
    "Wenn die Frage in Deutsch, Englisch, Tuerkisch, Slowakisch, Ungarisch, Kroatisch oder einer anderen Sprache gestellt wird, antworte in genau dieser Sprache.",
    "Schreibe einfach, freundlich und berufsnah. Zielniveau: A2 bis B1.",
    "Wenn du etwas nicht sicher aus dem Kontext beantworten kannst, sage das klar und leite an Schichtleitung, Hausdame Magdalena/Anna Berger oder Rezeption intern 100 weiter.",
    "Erfinde keine echten personenbezogenen Daten, Dienstplaene, Preise oder rechtlichen Zusagen.",
    "Bei Notfall: intern 100 und bei medizinischem Notfall/Feuer 112 nennen.",
    "Bei Bild-Uploads: Beschreibe zuerst knapp, was du auf dem Bild erkennst und welches Problem oder Risiko wahrscheinlich ist.",
    "Bei Bild-Uploads: Gib danach konkrete naechste Schritte fuer neue Hotelmitarbeitende.",
    "Bei Bild-Uploads sollen die Schritte meistens enthalten: Foto machen/behalten, Problem nicht selbst reparieren, Fund/Schaden/Unklarheit der Hausdame, Schichtleitung oder Rezeption intern 100 melden.",
    "Bei sichtbarer Gefahr, Wasser, Glasbruch, Feuer, Elektrik, Verletzung oder Hygieneproblem: Bereich sichern, Abstand halten und sofort intern 100 melden. Bei Feuer/medizinischem Notfall 112.",
    "Gib keine Reparaturanleitungen, keine Werkzeuglisten und keine Materialbestellungen. Neue Mitarbeitende sollen melden, nicht selbst reparieren.",
    "Antworte ausschliesslich als JSON ohne Markdown-Codeblock: {\"answer\":\"kurze Antwort\", \"steps\":[\"2-4 konkrete Schritte\"], \"linkLabel\":\"optionaler kurzer Linktitel\"}.",
    "",
    "HOTELKONTEXT:",
    hotelContext,
    "",
    "QUICK-HELP-WISSENSBASIS:",
    JSON.stringify(knowledgeBase)
  ].join("\n");
}

function buildUserContent({ question, attachment, history }) {
  const historyText = (history ?? [])
    .slice(-8)
    .map((message) => `${message.role === "assistant" ? "Bot" : "User"}: ${message.text || "[Bild]"}`)
    .join("\n");

  const hasImage = Boolean(attachment?.dataUrl);
  const imageTask = hasImage
    ? [
      "Es wurde ein Bild hochgeladen.",
      "Bitte antworte so:",
      "1. Ein kurzer Satz: Was ist wahrscheinlich auf dem Bild zu sehen und was ist das Problem/Risiko?",
      "2. Danach 3-4 sehr konkrete Schritte fuer Mitarbeitende.",
      "3. Schritte sollen, wenn passend, Foto machen/behalten, nichts selbst reparieren, Vorgesetzte/Hausdame/Schichtleitung oder Rezeption intern 100 melden enthalten.",
      "4. Wenn du das Bild nicht sicher erkennst, sage das offen und empfehle trotzdem die sichere Meldekette."
    ].join("\n")
    : "";

  const content = [
    {
      type: "input_text",
      text: [
        historyText ? `Bisheriger Chat:\n${historyText}` : "Bisheriger Chat: leer",
        imageTask,
        `Aktuelle Frage: ${question || "Bitte analysiere das angehaengte Bild im Hotelkontext."}`
      ].filter(Boolean).join("\n\n")
    }
  ];

  if (attachment?.dataUrl) {
    content.push({
      type: "input_image",
      image_url: attachment.dataUrl
    });
  }

  return content;
}

async function handleQuickHelp(request, response, env) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: "OPENAI_API_KEY is not configured" });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(request));
    const model = env.OPENAI_MODEL || "gpt-4.1-mini";
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions: quickHelpInstructions(),
        input: [
          {
            role: "user",
            content: buildUserContent(payload)
          }
        ],
        temperature: 0.2,
        max_output_tokens: 700
      })
    });

    const data = await openAiResponse.json();
    if (!openAiResponse.ok) {
      sendJson(response, openAiResponse.status, {
        error: data.error?.message || "OpenAI request failed"
      });
      return;
    }

    const text = extractResponseText(data);
    const parsed = parseOpenAiJson(text);
    sendJson(response, 200, {
      ...parsed,
      source: "openai",
      model
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Quick Help failed" });
  }
}

async function handleLessonDraft(request, response, env) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: "OPENAI_API_KEY is not configured" });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(request));
    const description = String(payload.description || "").trim();
    if (!description) {
      sendJson(response, 400, { error: "description is required" });
      return;
    }

    const model = env.OPENAI_MODEL || "gpt-4.1-mini";
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions: lessonDraftInstructions(),
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  `Wunsch des Admins: ${description}`,
                  `Verfuegbare interaktive Objekte: ${JSON.stringify(payload.assets || [])}`,
                  "Ausgabe exakt in diesem Shape:",
                  "{\"title\":\"\", \"goal\":\"\", \"minutes\":4, \"scene\":\"\", \"customScene\":{\"label\":\"\", \"background\":\"wall\", \"floor\":\"floor\", \"elements\":[{\"type\":\"rect\", \"x\":120, \"y\":120, \"width\":120, \"height\":60, \"rx\":10, \"fill\":\"panel\", \"stroke\":\"line\", \"showFrom\":0, \"motion\":\"focus\"}]}, \"objects\":[{\"id\":\"\", \"x\":50, \"y\":58}], \"animation\":[\"\"], \"storyboard\":[{\"caption\":\"\", \"detail\":\"\", \"assetId\":\"\", \"state\":\"closed\", \"motion\":\"focus\"}], \"taskType\":\"decision\", \"question\":\"\", \"correctAnswer\":\"\", \"wrongAnswerOne\":\"\", \"wrongAnswerTwo\":\"\", \"explanation\":\"\"}"
                ].join("\n")
              }
            ]
          }
        ],
        temperature: 0.35,
        max_output_tokens: 1600
      })
    });

    const data = await openAiResponse.json();
    if (!openAiResponse.ok) {
      sendJson(response, openAiResponse.status, {
        error: data.error?.message || "OpenAI request failed"
      });
      return;
    }

    const draft = parseLessonDraftJson(extractResponseText(data));
    sendJson(response, 200, { draft, source: "openai", model });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Lesson draft generation failed" });
  }
}

function quickHelpApiPlugin(env) {
  const middleware = (request, response, next) => {
    if (request.url?.startsWith("/api/quick-help")) {
      handleQuickHelp(request, response, env);
      return;
    }
    if (request.url?.startsWith("/api/lesson-draft")) {
      handleLessonDraft(request, response, env);
      return;
    }
    next();
  };

  return {
    name: "worklingo-quick-help-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      __WORKLINGO_SERVER_AI__: JSON.stringify(Boolean(env.OPENAI_API_KEY))
    },
    plugins: [
      react(),
      quickHelpApiPlugin(env)
    ]
  };
});
