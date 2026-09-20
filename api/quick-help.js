import {
  buildQuickHelpUserContent,
  extractResponseText,
  openAiResponse,
  parseOpenAiJson,
  payloadFromRequest,
  quickHelpInstructions,
  sendJson
} from "./_worklingo-ai.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = payloadFromRequest(request);
    const result = await openAiResponse({
      instructions: quickHelpInstructions(),
      input: [
        {
          role: "user",
          content: buildQuickHelpUserContent(payload)
        }
      ],
      temperature: 0.2,
      maxOutputTokens: 700
    });

    const parsed = parseOpenAiJson(extractResponseText(result.data));
    sendJson(response, 200, {
      ...parsed,
      source: "openai",
      model: result.model
    });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.message || "Quick Help failed"
    });
  }
}
