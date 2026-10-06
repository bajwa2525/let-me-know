// Server-only helper. Never import this from a client component —
// GEMINI_API_KEY must stay off the client bundle.

// Tried in order — if the primary model is overloaded (503) or rate-limited
// (429), fall back to the next one instead of failing outright.
const MODELS = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-flash-lite-latest"];
const MAX_ATTEMPTS_PER_MODEL = 2;
const RETRY_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function askGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local to enable AI spec checks."
    );
  }

  let lastError = "";

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? "")
          .join("");
        if (text) return text.trim();
        lastError = "Gemini returned an empty response.";
        continue;
      }

      // 503 = model overloaded, 429 = rate limited — worth retrying the same
      // model briefly, then falling back to the next one.
      if (res.status === 503 || res.status === 429) {
        lastError = `${model} is temporarily overloaded (${res.status}).`;
        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        break; // try the next model
      }

      // 404 = this model name doesn't exist/isn't available to this key —
      // no point retrying it, just move on to the next model.
      if (res.status === 404) {
        lastError = `${model} is unavailable (404).`;
        break;
      }

      // Anything else (bad key, bad request, server error) isn't specific
      // to this model — retrying or falling back won't help.
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 300)}`);
    }
  }

  throw new Error(
    `Gemini's models are all busy right now (${lastError}). Please try again in a moment.`
  );
}
