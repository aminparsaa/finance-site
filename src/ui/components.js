import { escapeHtml, statusPill } from "./format.js"

export function pageHeading(eyebrow, title, description, action = "") {
  return `<div class="page-heading">
    <div>
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="page-description">${escapeHtml(description)}</p>
    </div>
    ${action}
  </div>`
}

export function panelHeader(kicker, title, description = "") {
  return `<div class="panel-header">
    <div><p class="panel-kicker">${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2></div>
    ${description ? `<p class="panel-description">${escapeHtml(description)}</p>` : ""}
  </div>`
}

export function emptyState(title, body, status = "UNAVAILABLE") {
  return `<div class="empty-state">
    ${statusPill(status)}
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(body)}</p>
  </div>`
}

export function noteBox(title, body, tone = "neutral") {
  return `<aside class="note-box note-${escapeHtml(tone)}"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></aside>`
}
