import { createBlsAdapter, createBlsCpiAdapter, createBlsPpiAdapter, createBlsClaimsAdapter, createBlsJoltsAdapter } from "./economic-calendar/bls.js"
import { createFredAdapter, createFredCpiAdapter, createFredPpiAdapter, createFredPceAdapter } from "./economic-calendar/fred.js"
import { createFederalReserveAdapter } from "./economic-calendar/fed.js"
import { createMarketDataAdapter, createTreasuryDataAdapter } from "./market-data/market.js"
import { createNewsAdapter, createIsmAdapter, createBeaAdapter, createCensusRetailSalesAdapter } from "./news/news.js"
import { createBrowserResearchAgentAdapter } from "./browser/agent.js"
import { createLlmAdapter } from "./llm/provider.js"

export function createAdapterRegistry() {
  const adapters = [
    createBlsAdapter(),
    createBlsCpiAdapter(),
    createBlsPpiAdapter(),
    createBlsClaimsAdapter(),
    createBlsJoltsAdapter(),
    createFredAdapter(),
    createFredCpiAdapter(),
    createFredPpiAdapter(),
    createFredPceAdapter(),
    createFederalReserveAdapter(),
    createMarketDataAdapter(),
    createTreasuryDataAdapter(),
    createNewsAdapter(),
    createIsmAdapter(),
    createBeaAdapter(),
    createCensusRetailSalesAdapter(),
    createBrowserResearchAgentAdapter(),
    createLlmAdapter(),
  ]
  return Object.freeze(adapters)
}

export function getAdapter(registry, id) {
  return registry.find((adapter) => adapter.id === id) ?? null
}
