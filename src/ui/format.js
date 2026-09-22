export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export function displayValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") {
    return '<span class="value-unavailable">UNAVAILABLE</span>'
  }
  return `${escapeHtml(value)}${suffix ? ` ${escapeHtml(suffix)}` : ""}`
}

export function statusSlug(status = "UNAVAILABLE") {
  return status.toLowerCase().replaceAll(" ", "-")
}

export function statusPill(status = "UNAVAILABLE") {
  return `<span class="status-pill status-${statusSlug(status)}"><i></i>${escapeHtml(status)}</span>`
}

export function numberValue(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return null
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: digits })
}

export function formatNumberOrUnavailable(value, digits = 2, suffix = "") {
  return displayValue(numberValue(value, digits), suffix)
}

export function linkOrUnavailable(url, label = "Source") {
  if (!url) return '<span class="value-unavailable">UNAVAILABLE</span>'
  return `<a class="source-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)} <span aria-hidden="true">&gt;</span></a>`
}

export function optionList(options, selected) {
  return options
    .map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === selected ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("")
}
