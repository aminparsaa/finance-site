import { createNotConnectedAdapter } from "../sourceAdapter.js"

export function createBrowserResearchAgentAdapter() {
  return createNotConnectedAdapter({
    id: "browser-research-agent",
    label: "Browser Research Agent",
    kind: "browser-agent",
    description: "Planned cross-check agent. It must retain visible source URL, timestamp and extraction trace.",
    sourceUrl: "https://github.com/browser-use/browsercode",
    capabilities: ["open sources", "extract", "cross-check", "record provenance", "re-verify"],
    requiredEnv: ["BROWSER_AGENT_PROVIDER"],
    status: "NOT CONNECTED",
  })
}
