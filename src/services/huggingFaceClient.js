export const DEFAULT_HF_MODEL = "Qwen/Qwen2.5-7B-Instruct"
const WHOAMI_URL = "https://huggingface.co/api/whoami-v2"
const CHAT_URL = "https://router.huggingface.co/v1/chat/completions"

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
}

export function createChatRequest({ model = DEFAULT_HF_MODEL, prompt }) {
  return {
    model,
    messages: [
      {
        role: "system",
        content: "You are a cautious financial research assistant. Use only supplied evidence, state uncertainty, and never claim guaranteed market direction.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 160,
  }
}

export async function verifyHuggingFaceToken(token, fetchImpl = fetch) {
  if (!token?.trim()) return { ok: false, status: "UNAVAILABLE", message: "Enter a Hugging Face token first." }
  try {
    const response = await fetchImpl(WHOAMI_URL, { headers: { Authorization: `Bearer ${token.trim()}` } })
    if (!response.ok) return { ok: false, status: "UNAVAILABLE", message: `Token verification failed (HTTP ${response.status}).` }
    return { ok: true, status: "READY", message: "Token verified for this tab." }
  } catch {
    return { ok: false, status: "UNAVAILABLE", message: "Hugging Face could not be reached from this browser." }
  }
}

export async function runHuggingFaceInference(token, { model = DEFAULT_HF_MODEL, prompt }, fetchImpl = fetch) {
  const response = await fetchImpl(CHAT_URL, {
    method: "POST",
    headers: authHeaders(token.trim()),
    body: JSON.stringify(createChatRequest({ model, prompt })),
  })
  if (!response.ok) throw new Error(`Inference request failed (HTTP ${response.status}).`)
  const body = await response.json()
  const text = body?.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error("Inference returned no text.")
  return text
}
