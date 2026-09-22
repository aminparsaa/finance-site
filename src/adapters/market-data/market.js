import { createNotConnectedAdapter } from "../sourceAdapter.js"

export function createMarketDataAdapter() {
  return createNotConnectedAdapter({
    id: "market-data",
    label: "Market data provider",
    kind: "market-data",
    description: "Provider boundary for XAUUSD, DXY, US 2Y and US 10Y observations.",
    sourceUrl: null,
    capabilities: ["fetch", "parse", "validate", "normalize", "OHLC windows"],
    requiredEnv: ["MARKET_DATA_PROVIDER"],
    status: "NOT CONNECTED",
  })
}

export function createTreasuryDataAdapter() {
  return createNotConnectedAdapter({
    id: "treasury-yields",
    label: "US Treasury yields adapter",
    kind: "market-data",
    description: "Provider boundary for US 2Y and US 10Y yield levels and direction.",
    sourceUrl: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
    capabilities: ["fetch", "parse", "validate", "normalize"],
    requiredEnv: ["MARKET_DATA_PROVIDER"],
    status: "NOT CONNECTED",
  })
}
