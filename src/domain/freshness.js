import { STATUS } from "./schemas.js"

export function getFreshnessStatus(retrievedAt, now = Date.now(), thresholdMinutes = 30) {
  if (!retrievedAt) return STATUS.UNAVAILABLE
  const timestamp = Date.parse(retrievedAt)
  if (Number.isNaN(timestamp)) return STATUS.UNAVAILABLE
  return now - timestamp <= thresholdMinutes * 60_000 ? STATUS.LIVE : STATUS.STALE
}

export function formatRelativeTime(retrievedAt, now = Date.now()) {
  if (!retrievedAt) return "UNAVAILABLE"
  const timestamp = Date.parse(retrievedAt)
  if (Number.isNaN(timestamp)) return "UNAVAILABLE"
  const minutes = Math.max(0, Math.round((now - timestamp) / 60_000))
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function formatDateTime(value, timeZone = "Asia/Tehran") {
  if (!value) return "UNAVAILABLE"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "UNAVAILABLE"
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
