import { classifySurprise } from "./surpriseEngine.js"

const SCENARIO_COPY = Object.freeze({
  "ABOVE FORECAST": {
    label: "ABOVE FORECAST",
    trigger: "Verified actual is above the verified consensus.",
    macro: "A stronger-than-expected release could reinforce a firmer growth or inflation narrative, depending on the indicator.",
    transmission: "The first transmission to verify is whether rates and the expected policy path reprice in the same direction.",
    usd: "USD could receive support if the release lifts expected relative rates; this is conditional, not guaranteed.",
    yields: "Treasury yields could move higher if the release changes the expected policy path; confirm with observed market data.",
    gold: "Gold could face pressure through USD and real-yield channels, or remain supported if risk or positioning offsets them.",
  },
  "IN LINE": {
    label: "IN LINE",
    trigger: "Verified actual is within the configured in-line tolerance of consensus.",
    macro: "The release alone may add less information; revisions, details and the existing policy narrative become more important.",
    transmission: "Focus shifts to the surprise in sub-components, guidance, positioning, USD, yields and the immediate price response.",
    usd: "USD direction is more dependent on the broader rates narrative and concurrent data.",
    yields: "Yield direction may be driven by policy expectations, term premium or other releases rather than the headline alone.",
    gold: "Gold response is conditional on cross-asset confirmation; no direction should be inferred from an in-line print alone.",
  },
  "BELOW FORECAST": {
    label: "BELOW FORECAST",
    trigger: "Verified actual is below the verified consensus.",
    macro: "A softer-than-expected release could weaken a growth or inflation narrative, depending on the indicator and revisions.",
    transmission: "The first transmission to verify is whether expected rates, USD and Treasury yields reflect a softer policy path.",
    usd: "USD could weaken if the release lowers expected relative rates; this is conditional, not guaranteed.",
    yields: "Treasury yields could move lower if policy expectations ease; confirm with observed market data.",
    gold: "Gold could receive support through lower real-yield or USD channels, or fail to rally if risk and positioning dominate.",
  },
})

export function buildScenarios(event = null, context = {}) {
  const classification = classifySurprise(event?.surprise, context.tolerance ?? 0.05)
  return Object.values(SCENARIO_COPY).map((scenario) => ({
    ...scenario,
    active: classification === scenario.label,
    dataStatus: event ? "CONDITIONAL" : "NOT CONNECTED",
  }))
}

export function scenarioFromEvent(event, tolerance = 0.05) {
  const key = classifySurprise(event?.surprise, tolerance)
  return SCENARIO_COPY[key] ?? null
}
