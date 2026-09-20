import {
  extractResponseText,
  lessonDraftInstructions,
  openAiResponse,
  parseLessonDraftJson,
  payloadFromRequest,
  sendJson
} from "./_worklingo-ai.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = payloadFromRequest(request);
    const description = String(payload.description || "").trim();
    if (!description) {
      sendJson(response, 400, { error: "description is required" });
      return;
    }

    const result = await openAiResponse({
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
      maxOutputTokens: 1600
    });

    const draft = parseLessonDraftJson(extractResponseText(result.data));
    sendJson(response, 200, {
      draft,
      source: "openai",
      model: result.model
    });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.message || "Lesson draft generation failed"
    });
  }
}
