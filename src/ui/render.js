import { EVENT_TAXONOMY } from "../data/eventTaxonomy.js"
import { CONTEXT_METRICS } from "../data/initialState.js"
import { buildHistoricalStats } from "../domain/surpriseEngine.js"
import { buildScenarios } from "../domain/scenarioEngine.js"
import { formatDateTime, formatRelativeTime } from "../domain/freshness.js"
import { STATUS } from "../domain/schemas.js"
import { ROUTES } from "../app/routes.js"
import { displayValue, escapeHtml, formatNumberOrUnavailable, linkOrUnavailable, numberValue, optionList, statusPill } from "./format.js"
import { emptyState, noteBox, pageHeading, panelHeader } from "./components.js"

function nav(route) {
  return Object.entries(ROUTES)
    .map(([key, item]) => `<a class="nav-link ${route === key ? "is-active" : ""}" href="${item.path}" ${route === key ? 'aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`)
    .join("")
}

function renderHeader(route, state) {
  const connected = state.adapters.filter((adapter) => adapter.status === STATUS.LIVE).length
  return `<header class="topbar">
    <a class="brand" href="#/dashboard" aria-label="XAUUSD Intelligence dashboard">
      <span class="brand-mark">X</span>
      <span><strong>XAUUSD</strong><small>PRE-NEWS INTELLIGENCE</small></span>
    </a>
    <div class="topbar-meta">
      <span class="instrument-chip">XAUUSD / SPOT</span>
      <span class="connection-summary"><i></i>${connected} connected sources</span>
    </div>
  </header>
  <nav class="main-nav" aria-label="Primary navigation">${nav(route)}</nav>`
}

function renderFooter(state) {
  return `<footer class="app-footer">
    <span>Evidence-led intelligence / conditional scenarios only</span>
    <span>Last system check: ${escapeHtml(formatRelativeTime(state.updatedAt))}</span>
  </footer>`
}

function dataRow(label, value, meta = "") {
  return `<div class="data-row"><dt>${escapeHtml(label)}</dt><dd>${value}${meta ? `<small>${escapeHtml(meta)}</small>` : ""}</dd></div>`
}

function renderNextEvent(event) {
  const connected = Boolean(event?.indicator)
  if (!connected) {
    return `<section class="panel next-event-panel">
      <div class="next-event-main">
        <div class="panel-header"><div><p class="panel-kicker">NEXT IMPORTANT EVENT</p><h2>No verified release connected</h2></div>${statusPill(STATUS.NOT_CONNECTED)}</div>
        <p class="event-empty-copy">The calendar adapter is ready for CPI, NFP, PCE, FOMC and other high-impact US releases. Until a source is connected, the next event is deliberately left blank.</p>
        <div class="event-empty-actions"><a class="button button-secondary" href="#/sources">Review source adapters <span>&gt;</span></a><span class="small-muted">No forecast or timing is inferred.</span></div>
      </div>
      <div class="countdown-block"><span>COUNTDOWN</span><strong>--:--:--</strong><small>Awaiting verified release time</small></div>
      <dl class="event-fields">
        ${dataRow("Release date", displayValue(null))}
        ${dataRow("Iran time", displayValue(null))}
        ${dataRow("Forecast", displayValue(null))}
        ${dataRow("Previous", displayValue(null))}
        ${dataRow("Revised previous", displayValue(null))}
        ${dataRow("Actual", displayValue(null))}
      </dl>
      <div class="event-source"><span>PRIMARY SOURCE</span>${linkOrUnavailable(null)}<small>Last updated: UNAVAILABLE</small></div>
    </section>`
  }
  return `<section class="panel next-event-panel">
    <div class="next-event-main">
      <div class="panel-header"><div><p class="panel-kicker">NEXT IMPORTANT EVENT</p><h2>${escapeHtml(event.indicator)}</h2></div>${statusPill(event.status)}</div>
      <p class="event-empty-copy">Release metadata is source-linked. Actual remains blank until the official release is verified.</p>
    </div>
    <div class="countdown-block" data-countdown-target="${escapeHtml(event.release_datetime_utc ?? "")}"><span>COUNTDOWN</span><strong>--:--:--</strong><small>Calculated from UTC release time</small></div>
    <dl class="event-fields">
      ${dataRow("Release date", displayValue(formatDateTime(event.release_datetime_utc, "UTC")))}
      ${dataRow("Iran time", displayValue(formatDateTime(event.release_datetime_utc, "Asia/Tehran")))}
      ${dataRow("Forecast", displayValue(event.forecast))}
      ${dataRow("Previous", displayValue(event.previous))}
      ${dataRow("Revised previous", displayValue(event.revised_previous))}
      ${dataRow("Actual", displayValue(event.actual))}
    </dl>
    <div class="event-source"><span>PRIMARY SOURCE</span>${linkOrUnavailable(event.source_url, event.source ?? "Source") }<small>Last updated: ${escapeHtml(formatRelativeTime(event.retrieved_at))}</small></div>
  </section>`
}

function renderContext(state) {
  return `<section class="panel context-panel">
    ${panelHeader("CURRENT XAUUSD CONTEXT", "Cross-asset context", "No live values are shown until they are source-linked and time-stamped.")}
    <div class="metric-grid">${CONTEXT_METRICS.map((definition) => {
      const metric = state.context[definition.key]
      return `<article class="metric-card"><div class="metric-card-top"><span>${escapeHtml(definition.label)}</span>${statusPill(metric?.status ?? STATUS.UNAVAILABLE)}</div><strong>${displayValue(metric?.value)}</strong><small>${escapeHtml(metric?.note ?? definition.detail)}</small><em>Last updated: ${escapeHtml(formatRelativeTime(metric?.retrievedAt))}</em></article>`
    }).join("")}</div>
  </section>`
}

function renderScenarioCard(scenario) {
  return `<article class="scenario-card ${scenario.active ? "is-active" : ""}">
    <div class="scenario-card-header"><span class="scenario-index">${scenario.label === "ABOVE FORECAST" ? "01" : scenario.label === "IN LINE" ? "02" : "03"}</span><h3>${escapeHtml(scenario.label)}</h3></div>
    <p class="scenario-trigger">${escapeHtml(scenario.trigger)}</p>
    <dl class="scenario-details">
      ${dataRow("Macro", escapeHtml(scenario.macro))}
      ${dataRow("Transmission", escapeHtml(scenario.transmission))}
      ${dataRow("USD", escapeHtml(scenario.usd))}
      ${dataRow("Yields", escapeHtml(scenario.yields))}
      ${dataRow("Gold", escapeHtml(scenario.gold))}
    </dl>
    <span class="scenario-foot">${escapeHtml(scenario.dataStatus)} / no guaranteed direction</span>
  </article>`
}

function renderSystemStatus(state) {
  return `<section class="panel system-panel">
    ${panelHeader("SYSTEM STATUS", "Readiness, not prediction", "Connection state is explicit so missing data cannot look like a market signal.")}
    <div class="system-grid">${state.system.map((item) => `<div class="system-row"><div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.note)}</small></div>${statusPill(item.status)}</div>`).join("")}</div>
  </section>`
}

export function renderDashboard(state, config) {
  const scenarios = buildScenarios(null, { tolerance: config.inlineTolerance })
  return `${pageHeading("CONTROL ROOM / XAUUSD", "Pre-News Intelligence", "A source-aware workspace for what matters before the next US release.", '<a class="button button-primary" href="#/settings">Configure providers <span>&gt;</span></a>')}
    <div class="dashboard-stack">
      ${renderNextEvent(state.nextEvent)}
      ${renderContext(state)}
      <section class="panel scenario-panel">${panelHeader("SCENARIO ENGINE", "Conditional analysis", "Scenarios are evidence-dependent. They are not buy, sell or guaranteed-direction calls.")}<div class="scenario-grid">${scenarios.map(renderScenarioCard).join("")}</div></section>
      ${renderSystemStatus(state)}
    </div>`
}

function renderTaxonomyCard(item) {
  return `<article class="taxonomy-card"><div class="taxonomy-top"><span class="priority">P${String(item.priority).padStart(2, "0")}</span>${statusPill("NOT CONNECTED")}</div><h3>${escapeHtml(item.label)}</h3><span class="taxonomy-family">${escapeHtml(item.family)} / ${escapeHtml(item.dataType)}</span><p>${escapeHtml(item.goldRelevance)}</p><div class="adapter-tags">${item.adapterIds.map((id) => `<code>${escapeHtml(id)}</code>`).join("")}</div></article>`
}

export function renderEvents(state) {
  return `${pageHeading("EVENT INTELLIGENCE", "US release watchlist", "The priority taxonomy is extensible; observations only appear after a provider returns validated, source-linked data.", '<button class="button button-secondary" id="refresh-data" type="button">Refresh adapters <span>refresh</span></button>')}
    <div class="page-stack">
      <section class="panel"><div class="panel-header"><div><p class="panel-kicker">NEXT RELEASE FEED</p><h2>Verified events</h2></div>${statusPill(STATUS.NOT_CONNECTED)}</div>${emptyState("No verified events yet", "Connect an economic-calendar adapter to populate release time, Iran time, forecast, previous, revision, actual and provenance. No event is guessed from a public schedule.", STATUS.UNAVAILABLE)}</section>
      <section class="panel"><div class="panel-header"><div><p class="panel-kicker">EXTENSIBLE TAXONOMY</p><h2>Tracked US indicators</h2></div><span class="count-badge">${EVENT_TAXONOMY.length} definitions</span></div><div class="taxonomy-grid">${EVENT_TAXONOMY.map(renderTaxonomyCard).join("")}</div></section>
      ${noteBox("NULL policy active", "Missing, unverifiable or disconnected values stay NULL and render as UNAVAILABLE. No demo event is presented as live.", "gold")}
    </div>`
}

function renderHistoricalMetric(label, value, suffix = "") {
  return `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${value === null ? displayValue(null) : displayValue(numberValue(value, 4), suffix)}</strong></div>`
}

export function renderHistorical(state, config) {
  const selected = state.historical.selectedIndicator ?? EVENT_TAXONOMY[0].id
  const definition = EVENT_TAXONOMY.find((item) => item.id === selected) ?? EVENT_TAXONOMY[0]
  const stats = buildHistoricalStats(state.historical.observations, definition, config.inlineTolerance)
  const windows = ["Before Release", "5m", "15m", "30m", "1h"]
  return `${pageHeading("HISTORICAL SURPRISE ENGINE", "What happened before?", "Deterministic surprise and reaction calculations are separated from any future LLM explanation.")}
    <div class="page-stack">
      <section class="panel historical-toolbar"><label for="historical-indicator">Indicator</label><select id="historical-indicator">${optionList(EVENT_TAXONOMY.map((item) => ({ value: item.id, label: item.label })), selected)}</select><span>${statusPill(stats.status)}</span></section>
      <section class="panel"><div class="panel-header"><div><p class="panel-kicker">${escapeHtml(definition.family.toUpperCase())}</p><h2>${escapeHtml(definition.label)}</h2></div><span class="small-muted">${escapeHtml(definition.goldRelevance)}</span></div><div class="stats-grid">${renderHistoricalMetric("Sample size", stats.sampleSize, "observations")}${renderHistoricalMetric("Mean surprise", stats.meanSurprise, definition.unit ?? "")}${renderHistoricalMetric("Median surprise", stats.medianSurprise, definition.unit ?? "")}${renderHistoricalMetric("Positive", stats.positiveCount)}${renderHistoricalMetric("Negative", stats.negativeCount)}${renderHistoricalMetric("In line", stats.inlineCount)}</div></section>
      <section class="panel"><div class="panel-header"><div><p class="panel-kicker">HISTORICAL XAUUSD REACTION</p><h2>Release windows</h2></div>${statusPill(STATUS.UNAVAILABLE)}</div><div class="reaction-table"><div class="reaction-row reaction-head"><span>Window</span><span>Return</span><span>Observation status</span><span>Source</span></div>${windows.map((window) => `<div class="reaction-row"><span>${escapeHtml(window)}</span><strong>${displayValue(null)}</strong>${statusPill(STATUS.UNAVAILABLE)}<span class="small-muted">${escapeHtml("No price series connected")}</span></div>`).join("")}</div></section>
      ${noteBox("Correlation is not causality", "A synchronized price move is not causal proof. When connected, every reaction window will retain the release timestamp, price source and calculation method.", "neutral")}
    </div>`
}

function renderAdapter(adapter) {
  return `<article class="adapter-card"><div class="adapter-header"><div><span class="adapter-kind">${escapeHtml(adapter.kind)}</span><h3>${escapeHtml(adapter.label)}</h3></div>${statusPill(adapter.status)}</div><p>${escapeHtml(adapter.description)}</p><div class="adapter-contract"><span>fetch</span><span>parse</span><span>validate</span><span>normalize</span></div><div class="adapter-footer"><span>Env: ${escapeHtml(adapter.requiredEnv.join(", ") || "none")}</span>${linkOrUnavailable(adapter.sourceUrl, "Official source")}</div></article>`
}

export function renderSources(state) {
  const grouped = state.adapters.reduce((groups, adapter) => {
    const list = groups[adapter.kind] ?? []
    list.push(adapter)
    groups[adapter.kind] = list
    return groups
  }, {})
  const groupOrder = ["economic-calendar", "macro", "fed", "market-data", "news", "browser-agent", "llm"]
  return `${pageHeading("PROVENANCE LAYER", "Sources and adapters", "Every future observation must be fetchable, parseable, validated, normalized and source-visible.")}
    <div class="page-stack">
      <section class="panel conflict-panel"><div class="panel-header"><div><p class="panel-kicker">CONFLICT DETECTION</p><h2>Source reconciliation</h2></div>${statusPill(state.sourceConflicts.length ? STATUS.CONFLICT : STATUS.NOT_CONNECTED)}</div>${state.sourceConflicts.length ? state.sourceConflicts.map((conflict) => `<div class="conflict-row"><strong>${escapeHtml(conflict.indicator)}</strong><span>${escapeHtml(conflict.status)}</span></div>`).join("") : emptyState("Conflict monitor idle", "Once at least two sources return the same field, differences will be displayed as CONFLICT or RESOLVED with the primary-source rationale.", STATUS.NOT_CONNECTED)}</section>
      ${groupOrder.filter((kind) => grouped[kind]).map((kind) => `<section class="panel adapter-group"><div class="panel-header"><div><p class="panel-kicker">${escapeHtml(kind.replaceAll("-", " ").toUpperCase())}</p><h2>${grouped[kind].length} adapter${grouped[kind].length > 1 ? "s" : ""}</h2></div></div><div class="adapter-grid">${grouped[kind].map(renderAdapter).join("")}</div></section>`).join("")}
      ${noteBox("Primary-source rule", "The primary source is chosen by documented authority and field coverage, never hidden when another source disagrees. API keys belong on a backend or secret store, not this browser bundle.", "gold")}
    </div>`
}

function providerOptions(selected) {
  return optionList([
    { value: "not-connected", label: "Not connected" },
    { value: "server-proxy", label: "Backend proxy (planned)" },
    { value: "provider-placeholder", label: "Provider slot (planned)" },
  ], selected)
}

function providerField(id, label, description, value) {
  return `<label class="setting-field" for="${escapeHtml(id)}"><span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(description)}</small></span><select id="${escapeHtml(id)}" data-config-key="${escapeHtml(id)}">${providerOptions(value)}</select></label>`
}

export function renderSettings(config, state) {
  return `${pageHeading("CONTROL PLANE", "Settings", "Choose provider slots and freshness policy. This page never accepts or stores API secrets.")}
    <div class="settings-layout">
      <section class="panel"><div class="panel-header"><div><p class="panel-kicker">PROVIDER CONFIGURATION</p><h2>Connection slots</h2></div>${statusPill(STATUS.NOT_CONNECTED)}</div><div class="settings-list">${providerField("economicCalendarProvider", "Economic calendar", "CPI, NFP, PCE, PPI and other release metadata.", config.economicCalendarProvider)}${providerField("marketDataProvider", "Market data", "XAUUSD, DXY, US 2Y and US 10Y observations.", config.marketDataProvider)}${providerField("newsProvider", "News and geopolitical", "Source-linked text with relevance and timestamp.", config.newsProvider)}${providerField("fedDataProvider", "Federal Reserve", "FOMC decisions, statements and speaker material.", config.fedDataProvider)}${providerField("llmProvider", "LLM analysis", "Optional summaries and explanations; not numeric truth.", config.llmProvider)}${providerField("browserAgentProvider", "Browser research agent", "Open, extract, cross-check and retain provenance.", config.browserAgentProvider)}</div></section>
      <section class="panel"><div class="panel-header"><div><p class="panel-kicker">DATA QUALITY</p><h2>Freshness and tolerance</h2></div><span class="small-muted">Saved as non-secret preferences</span></div><div class="settings-list"><label class="setting-field" for="staleAfterMinutes"><span><strong>Stale threshold</strong><small>Minutes after retrieval before LIVE becomes STALE.</small></span><input id="staleAfterMinutes" data-config-key="staleAfterMinutes" type="number" min="1" max="1440" step="1" value="${escapeHtml(config.staleAfterMinutes)}" /></label><label class="setting-field" for="inlineTolerance"><span><strong>In-line tolerance</strong><small>Absolute surprise tolerance for deterministic classification.</small></span><input id="inlineTolerance" data-config-key="inlineTolerance" type="number" min="0" max="100" step="0.01" value="${escapeHtml(config.inlineTolerance)}" /></label><label class="setting-field setting-toggle" for="compactMode"><span><strong>Compact mode</strong><small>Reduce panel spacing on small screens.</small></span><input id="compactMode" data-config-key="compactMode" type="checkbox" ${config.compactMode ? "checked" : ""} /></label></div></section>
      <section class="panel security-panel"><div class="panel-header"><div><p class="panel-kicker">SECURITY</p><h2>Secret boundary</h2></div>${statusPill(STATUS.READY)}</div><ul class="plain-list"><li>No API key input is rendered.</li><li>No credentials are written to localStorage.</li><li>Provider secrets belong in backend environment variables or GitHub Actions secrets.</li><li>This static deployment cannot call private providers directly without a secure proxy.</li></ul></section>
      <section class="panel"><div class="panel-header"><div><p class="panel-kicker">RUNTIME STATUS</p><h2>What is connected?</h2></div></div><div class="system-grid">${state.system.map((item) => `<div class="system-row"><div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.note)}</small></div>${statusPill(item.status)}</div>`).join("")}</div></section>
    </div>`
}

export function renderApp(route, state, config) {
  const page = route === "events" ? renderEvents(state) : route === "historical" ? renderHistorical(state, config) : route === "sources" ? renderSources(state) : route === "settings" ? renderSettings(config, state) : renderDashboard(state, config)
  return `${renderHeader(route, state)}<main class="main-content">${page}</main>${renderFooter(state)}`
}
