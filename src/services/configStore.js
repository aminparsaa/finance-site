const STORAGE_KEY = "xauusd-intelligence.preferences.v1"

export const DEFAULT_CONFIG = Object.freeze({
  economicCalendarProvider: "not-connected",
  marketDataProvider: "not-connected",
  newsProvider: "not-connected",
  fedDataProvider: "not-connected",
  llmProvider: "not-connected",
  browserAgentProvider: "not-connected",
  staleAfterMinutes: 30,
  inlineTolerance: 0.05,
  compactMode: false,
})

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export function loadConfig() {
  if (!canUseStorage()) return { ...DEFAULT_CONFIG }
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null")
    return { ...DEFAULT_CONFIG, ...(stored ?? {}) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveConfig(config) {
  const safeConfig = { ...DEFAULT_CONFIG, ...config }
  if (canUseStorage()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeConfig))
  return safeConfig
}

export function clearConfig() {
  if (canUseStorage()) window.localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_CONFIG }
}
