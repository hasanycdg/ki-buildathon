/**
 * Gemeinsamer Mistral-Client für den Prototyp.
 * Vite liest VITE_* Werte aus .env.local ein.
 */
const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
const model = import.meta.env.VITE_MISTRAL_MODEL || "mistral-small-latest";

export const mistralEnabled = Boolean(apiKey);

export async function mistralJson({ system, prompt, temperature = 0.2, maxTokens = 4000 }) {
  if (!apiKey) throw new Error("Mistral API-Key fehlt. Bitte VITE_MISTRAL_API_KEY in .env.local eintragen.");

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Mistral API (${response.status}): ${body?.message || response.statusText}`);
  }
  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Mistral hat keine Antwort geliefert.");
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1));
    throw new Error("Mistral-Antwort enthält kein gültiges JSON.");
  }
}

export async function testMistralConnection() {
  if (!apiKey) return false;
  try {
    const response = await fetch("https://api.mistral.ai/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
    return response.ok;
  } catch {
    return false;
  }
}
