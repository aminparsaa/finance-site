function numeric(value) {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function computeSurprise(event, definition = {}) {
  const actual = numeric(event?.actual)
  const forecast = numeric(event?.forecast)
  if (actual === null || forecast === null) return null
  if (definition.surpriseMode === "forecast-minus-actual") return forecast - actual
  return actual - forecast
}

export function classifySurprise(value, tolerance = 0.05) {
  const surprise = numeric(value)
  if (surprise === null) return "UNAVAILABLE"
  if (Math.abs(surprise) <= tolerance) return "IN LINE"
  return surprise > 0 ? "ABOVE FORECAST" : "BELOW FORECAST"
}

function median(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function buildHistoricalStats(events = [], definition = {}, tolerance = 0.05) {
  const surprises = events.map((event) => computeSurprise(event, definition)).filter((value) => value !== null)
  const inlineCount = surprises.filter((value) => Math.abs(value) <= tolerance).length
  const positiveCount = surprises.filter((value) => value > tolerance).length
  const negativeCount = surprises.filter((value) => value < -tolerance).length
  const mean = surprises.length ? surprises.reduce((sum, value) => sum + value, 0) / surprises.length : null
  return {
    sampleSize: surprises.length,
    meanSurprise: mean,
    medianSurprise: median(surprises),
    positiveCount,
    negativeCount,
    inlineCount,
    status: surprises.length ? "READY" : "UNAVAILABLE",
  }
}
