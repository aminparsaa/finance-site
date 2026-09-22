import { createNotConnectedAdapter } from "../sourceAdapter.js"

export function createFredAdapter() {
  return createNotConnectedAdapter({
    id: "fred-macro",
    label: "Federal Reserve Economic Data",
    kind: "macro",
    description: "Secondary macro series adapter for validation, history and context.",
    sourceUrl: "https://fred.stlouisfed.org/",
    capabilities: ["fetch", "parse", "validate", "normalize", "historical series"],
    requiredEnv: ["FED_DATA_PROVIDER"],
    status: "PARTIAL",
  })
}

export function createFredCpiAdapter() {
  return { ...createFredAdapter(), id: "fred-cpi", label: "FRED CPI adapter" }
}

export function createFredPpiAdapter() {
  return { ...createFredAdapter(), id: "fred-ppi", label: "FRED PPI adapter" }
}

export function createFredPceAdapter() {
  return { ...createFredAdapter(), id: "fred-pce", label: "FRED PCE adapter" }
}
