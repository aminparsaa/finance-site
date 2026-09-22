import { createNotConnectedAdapter } from "../sourceAdapter.js"

export function createLlmAdapter(overrides = {}) {
  return createNotConnectedAdapter({
    id: "llm-provider",
    label: "LLM analysis provider",
    kind: "llm",
    description: "Optional text layer for summaries, conflict explanations and scenario wording.",
    sourceUrl: null,
    capabilities: ["summarize", "extract", "explain conflict", "compose scenario"],
    requiredEnv: ["LLM_PROVIDER"],
    status: "NOT CONNECTED",
    ...overrides,
  })
}
