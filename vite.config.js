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

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;

  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" || content.type === "text")
    .map((content) => content.text)
    .join("\n")
    .trim();
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

function quickHelpApiPlugin(env) {
  const middleware = (request, response, next) => {
    if (!request.url?.startsWith("/api/quick-help")) {
      next();
      return;
    }
    handleQuickHelp(request, response, env);
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
    plugins: [
      react(),
      quickHelpApiPlugin(env)
    ]
  };
});
