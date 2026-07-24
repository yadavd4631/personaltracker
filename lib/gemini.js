const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function callGemini(contents, system) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY set nahi hai — https://aistudio.google.com/apikey se free key lo (README dekho)");
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const body = {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text) throw new Error("Gemini se khaali response aaya — dobara try karo");
  return text;
}

// Single prompt → text
export async function askGemini(prompt, system) {
  return callGemini([{ role: "user", parts: [{ text: prompt }] }], system);
}

// Chat history → text. messages: [{ role: "user" | "model", text: "..." }]
export async function askGeminiChat(messages, system) {
  const contents = messages.map((m) => ({
    role: m.role === "model" ? "model" : "user",
    parts: [{ text: m.text }],
  }));
  return callGemini(contents, system);
}
