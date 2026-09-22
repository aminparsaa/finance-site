import test from "node:test"
import assert from "node:assert/strict"
import { createAdapterRegistry } from "../src/adapters/registry.js"
import { getRoute } from "../src/app/routes.js"
import { EVENT_TAXONOMY } from "../src/data/eventTaxonomy.js"
import { getFreshnessStatus } from "../src/domain/freshness.js"
import { buildScenarios } from "../src/domain/scenarioEngine.js"
import { computeSurprise, buildHistoricalStats, classifySurprise } from "../src/domain/surpriseEngine.js"
import { STATUS, normalizeEvent, validateEvent } from "../src/domain/schemas.js"
import { createInitialState } from "../src/data/initialState.js"
import { adapterContract } from "../src/adapters/sourceAdapter.js"

test("event schema preserves NULL for missing values", () => {
  const event = normalizeEvent({ indicator: "US CPI", actual: "" })
  assert.equal(event.actual, null)
  assert.equal(event.forecast, null)
  assert.equal(event.status, STATUS.UNAVAILABLE)
  assert.equal(validateEvent(event).valid, true)
})

test("invalid event dates are rejected without fabricating a replacement", () => {
  const event = normalizeEvent({ release_datetime_utc: "not-a-date" })
  const result = validateEvent(event)
  assert.equal(result.valid, false)
  assert.match(result.errors.join(" "), /release_datetime_utc/)
})

test("surprise engine is deterministic for numeric indicators", () => {
  assert.ok(Math.abs(computeSurprise({ actual: "3.2", forecast: "3.1" }) - 0.1) < 1e-9)
  assert.equal(classifySurprise(0.01, 0.05), "IN LINE")
  assert.equal(classifySurprise(0.2, 0.05), "ABOVE FORECAST")
  assert.equal(classifySurprise(-0.2, 0.05), "BELOW FORECAST")
  assert.equal(computeSurprise({ actual: "n/a", forecast: "3.1" }), null)
})

test("historical statistics count only verifiable surprise samples", () => {
  const stats = buildHistoricalStats([
    { actual: 3.2, forecast: 3.1 },
    { actual: 3.0, forecast: 3.1 },
    { actual: null, forecast: 3.1 },
  ], {}, 0.05)
  assert.equal(stats.sampleSize, 2)
  assert.equal(stats.positiveCount, 1)
  assert.equal(stats.negativeCount, 1)
  assert.equal(stats.inlineCount, 0)
  assert.equal(stats.medianSurprise, 0)
})

test("freshness never calls an absent timestamp LIVE", () => {
  const now = Date.parse("2026-09-22T12:00:00Z")
  assert.equal(getFreshnessStatus(null, now), STATUS.UNAVAILABLE)
  assert.equal(getFreshnessStatus("2026-09-22T11:45:00Z", now, 30), STATUS.LIVE)
  assert.equal(getFreshnessStatus("2026-09-22T10:00:00Z", now, 30), STATUS.STALE)
})

test("scenario engine always returns conditional, non-guaranteed language", () => {
  const scenarios = buildScenarios(null, { tolerance: 0.05 })
  assert.deepEqual(scenarios.map((scenario) => scenario.label), ["ABOVE FORECAST", "IN LINE", "BELOW FORECAST"])
  assert.ok(scenarios.every((scenario) => scenario.dataStatus === "NOT CONNECTED"))
  assert.ok(scenarios.every((scenario) => scenario.gold.toLowerCase().includes("could") || scenario.gold.toLowerCase().includes("conditional")))
})

test("route table is compatible with static hash hosting", () => {
  assert.equal(getRoute("#/dashboard"), "dashboard")
  assert.equal(getRoute("#/historical"), "historical")
  assert.equal(getRoute("#/missing"), "dashboard")
})

test("every adapter exposes the fetch-parse-validate-normalize contract", () => {
  const registry = createAdapterRegistry()
  assert.ok(registry.length > 0)
  assert.ok(registry.every(adapterContract))
  assert.ok(registry.some((adapter) => adapter.status === STATUS.NOT_CONNECTED))
  assert.equal(registry.find((adapter) => adapter.id === "bls-cpi").id, "bls-cpi")
  assert.equal(EVENT_TAXONOMY.length >= 12, true)
})

test("initial state makes missing live data visible", () => {
  const state = createInitialState({ runtimeMeta: { deploymentStatus: "READY" } })
  assert.equal(state.nextEvent.actual, null)
  assert.equal(state.context["gold-price"].status, STATUS.NOT_CONNECTED)
  assert.equal(state.system.find((item) => item.label === "GitHub Pages").status, "READY")
  assert.equal(state.system.find((item) => item.label === "Live Market Data").status, STATUS.NOT_CONNECTED)
})
