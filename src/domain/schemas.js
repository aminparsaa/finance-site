export const STATUS = Object.freeze({
  LIVE: "LIVE",
  STALE: "STALE",
  UNAVAILABLE: "UNAVAILABLE",
  CONFLICT: "CONFLICT",
  VERIFYING: "VERIFYING",
  NOT_CONNECTED: "NOT CONNECTED",
  READY: "READY",
  PARTIAL: "PARTIAL",
})

export const EVENT_FIELDS = Object.freeze([
  "event_id",
  "indicator",
  "country",
  "importance",
  "release_datetime_utc",
  "release_datetime_iran",
  "forecast",
  "previous",
  "revised_previous",
  "actual",
  "surprise",
  "source",
  "source_url",
  "retrieved_at",
  "status",
  "confidence",
  "notes",
])

export const PRICE_FIELDS = Object.freeze(["symbol", "timestamp", "price", "timeframe", "source"])

export function emptyEvent(overrides = {}) {
  return {
    event_id: null,
    indicator: null,
    country: "US",
    importance: null,
    release_datetime_utc: null,
    release_datetime_iran: null,
    forecast: null,
    previous: null,
    revised_previous: null,
    actual: null,
    surprise: null,
    source: null,
    source_url: null,
    retrieved_at: null,
    status: STATUS.UNAVAILABLE,
    confidence: null,
    notes: null,
    ...overrides,
  }
}

export function unavailable(value = null) {
  return value === undefined || value === "" ? null : value
}

export function normalizeEvent(input = {}) {
  const event = emptyEvent()
  for (const field of EVENT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, field)) event[field] = unavailable(input[field])
  }
  if (!event.status) event.status = STATUS.UNAVAILABLE
  return event
}

export function validateEvent(event) {
  const errors = []
  for (const field of EVENT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(event ?? {}, field)) errors.push(`Missing field: ${field}`)
  }
  if (event?.release_datetime_utc && Number.isNaN(Date.parse(event.release_datetime_utc))) {
    errors.push("release_datetime_utc must be an ISO date")
  }
  if (event?.retrieved_at && Number.isNaN(Date.parse(event.retrieved_at))) {
    errors.push("retrieved_at must be an ISO date")
  }
  return { valid: errors.length === 0, errors }
}

export function createUnavailableMetric(label, options = {}) {
  return {
    label,
    value: null,
    status: options.status ?? STATUS.NOT_CONNECTED,
    retrievedAt: options.retrievedAt ?? null,
    source: options.source ?? null,
    note: options.note ?? "No verified source is connected.",
  }
}

export function createSystemStatus(label, status, note) {
  return { label, status, note }
}
