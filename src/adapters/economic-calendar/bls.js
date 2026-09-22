import { createNotConnectedAdapter } from "../sourceAdapter.js"

export function createBlsAdapter() {
  return createNotConnectedAdapter({
    id: "bls-employment",
    label: "US Bureau of Labor Statistics",
    kind: "economic-calendar",
    description: "Primary adapter boundary for CPI, PPI, Employment Situation, claims and JOLTS.",
    sourceUrl: "https://www.bls.gov/data/",
    capabilities: ["fetch", "parse", "validate", "normalize", "release metadata"],
    requiredEnv: ["ECONOMIC_CALENDAR_PROVIDER"],
    status: "PARTIAL",
  })
}

export function createBlsCpiAdapter() {
  return { ...createBlsAdapter(), id: "bls-cpi", label: "BLS CPI adapter" }
}

export function createBlsPpiAdapter() {
  return { ...createBlsAdapter(), id: "bls-ppi", label: "BLS PPI adapter" }
}

export function createBlsClaimsAdapter() {
  return { ...createBlsAdapter(), id: "bls-claims", label: "BLS Jobless Claims adapter" }
}

export function createBlsJoltsAdapter() {
  return { ...createBlsAdapter(), id: "bls-jolts", label: "BLS JOLTS adapter" }
}
