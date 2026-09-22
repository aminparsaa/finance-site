import test from "node:test"
import assert from "node:assert/strict"
import { DEFAULT_HF_MODEL, createChatRequest, runHuggingFaceInference, verifyHuggingFaceToken } from "../src/services/huggingFaceClient.js"

test("Hugging Face chat requests are constrained and conditional", () => {
  const request = createChatRequest({ prompt: "Explain the supplied evidence." })
  assert.equal(request.model, DEFAULT_HF_MODEL)
  assert.equal(request.temperature, 0.2)
  assert.match(request.messages[0].content, /uncertainty/)
})

test("token verification reports success without returning identity data", async () => {
  const result = await verifyHuggingFaceToken("test-token", async (_url, options) => {
    assert.equal(options.headers.Authorization, "Bearer test-token")
    return { ok: true, status: 200 }
  })
  assert.deepEqual(result, { ok: true, status: "READY", message: "Token verified for this tab." })
})

test("inference parser extracts only the assistant message", async () => {
  const response = await runHuggingFaceInference("test-token", { prompt: "Reply with CONNECTED." }, async (_url, options) => {
    assert.equal(options.headers.Authorization, "Bearer test-token")
    return { ok: true, json: async () => ({ choices: [{ message: { content: "CONNECTED" } }] }) }
  })
  assert.equal(response, "CONNECTED")
})
