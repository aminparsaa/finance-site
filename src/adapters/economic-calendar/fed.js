import { createNotConnectedAdapter } from "../sourceAdapter.js"

export function createFederalReserveAdapter() {
  return createNotConnectedAdapter({
    id: "federal-reserve",
    label: "Federal Reserve",
    kind: "fed",
    description: "Primary boundary for FOMC decisions, statements and speaker material.",
    sourceUrl: "https://www.federalreserve.gov/",
    capabilities: ["fetch", "parse", "validate", "normalize", "text extraction"],
    requiredEnv: ["FED_DATA_PROVIDER"],
    status: "PARTIAL",
  })
}
