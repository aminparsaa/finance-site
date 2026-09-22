import { EVENT_TAXONOMY } from "./eventTaxonomy.js"
import { createAdapterRegistry } from "../adapters/registry.js"
import { createSystemStatus, createUnavailableMetric, emptyEvent, STATUS } from "../domain/schemas.js"

export const CONTEXT_METRICS = Object.freeze([
  { key: "gold-price", label: "Gold Price", detail: "XAUUSD spot / provider timestamp" },
  { key: "usd-context", label: "USD Context", detail: "Dollar strength and major USD drivers" },
  { key: "treasury-yields", label: "Treasury Yields", detail: "US 2Y / US 10Y and direction" },
  { key: "fed-expectations", label: "Fed Expectations", detail: "Rate path and meeting expectations" },
  { key: "inflation-context", label: "Inflation Context", detail: "CPI, PCE, PPI and trend" },
  { key: "labor-context", label: "Labor Market", detail: "NFP, unemployment, claims and JOLTS" },
  { key: "geopolitical-context", label: "Geopolitical Context", detail: "Only source-linked gold-relevant risk" },
])

export function createInitialState({ registry = createAdapterRegistry(), runtimeMeta = {} } = {}) {
  const hfProviderStatus = runtimeMeta.hfProviderStatus ?? STATUS.NOT_CONNECTED
  const adapters = registry.map((adapter) => adapter.id === "llm-provider" ? { ...adapter, status: hfProviderStatus } : adapter)
  const llmNote = hfProviderStatus === STATUS.PARTIAL
    ? "Hugging Face token verified in CI; browser-side inference is intentionally not exposed."
    : "LLM is optional and not connected."
  const metrics = Object.fromEntries(
    CONTEXT_METRICS.map((metric) => [metric.key, createUnavailableMetric(metric.label, { note: metric.detail })])
  )
  const system = [
    createSystemStatus("Frontend", STATUS.READY, "Static application shell is available."),
    createSystemStatus("Data Layer", STATUS.READY, "Normalized schemas and deterministic engines are available."),
    createSystemStatus("Source Adapters", STATUS.PARTIAL, "Adapter contracts exist; provider connections are pending."),
    createSystemStatus("GitHub Pages", runtimeMeta.deploymentStatus ?? "PENDING DEPLOY", "Deployment state is injected by the build workflow."),
    createSystemStatus("Live Market Data", STATUS.NOT_CONNECTED, "No market-data provider is connected."),
    createSystemStatus("Browser Agent", STATUS.NOT_CONNECTED, "Research agent boundary is defined but not connected."),
    createSystemStatus("LLM", hfProviderStatus, llmNote),
  ]
  return {
    instrument: "XAUUSD",
    updatedAt: null,
    nextEvent: emptyEvent(),
    events: [],
    context: metrics,
    historical: {
      selectedIndicator: EVENT_TAXONOMY[0].id,
      observations: [],
      reactions: [],
    },
    sourceConflicts: [],
    system,
    adapters,
    dataPolicy: {
      nullValues: true,
      noSyntheticMarketData: true,
      conditionalScenarios: true,
    },
  }
}
