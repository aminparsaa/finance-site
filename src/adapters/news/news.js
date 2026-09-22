import { createNotConnectedAdapter } from "../sourceAdapter.js"

export function createNewsAdapter() {
  return createNotConnectedAdapter({
    id: "news-rss",
    label: "News and geopolitical feed",
    kind: "news",
    description: "Source-linked news boundary; relevance to gold must be explainable and time-stamped.",
    sourceUrl: null,
    capabilities: ["fetch", "parse", "validate", "normalize", "deduplicate", "source scoring"],
    requiredEnv: ["NEWS_PROVIDER"],
    status: "NOT CONNECTED",
  })
}

export function createIsmAdapter() {
  return createNotConnectedAdapter({
    id: "ism",
    label: "Institute for Supply Management",
    kind: "economic-calendar",
    description: "Boundary for ISM Manufacturing and Services releases.",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/",
    capabilities: ["fetch", "parse", "validate", "normalize"],
    requiredEnv: ["ECONOMIC_CALENDAR_PROVIDER"],
    status: "PARTIAL",
  })
}

export function createBeaAdapter() {
  return createNotConnectedAdapter({
    id: "bea-macro",
    label: "Bureau of Economic Analysis",
    kind: "economic-calendar",
    description: "Boundary for GDP and PCE data.",
    sourceUrl: "https://www.bea.gov/",
    capabilities: ["fetch", "parse", "validate", "normalize"],
    requiredEnv: ["ECONOMIC_CALENDAR_PROVIDER"],
    status: "PARTIAL",
  })
}

export function createCensusRetailSalesAdapter() {
  return createNotConnectedAdapter({
    id: "census-retail-sales",
    label: "US Census retail sales",
    kind: "economic-calendar",
    description: "Boundary for retail sales release data.",
    sourceUrl: "https://www.census.gov/retail/index.html",
    capabilities: ["fetch", "parse", "validate", "normalize"],
    requiredEnv: ["ECONOMIC_CALENDAR_PROVIDER"],
    status: "PARTIAL",
  })
}
