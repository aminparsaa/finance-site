import { STATUS } from "../domain/schemas.js"

export class AdapterNotConnectedError extends Error {
  constructor(adapterId) {
    super(`Source adapter is not connected: ${adapterId}`)
    this.name = "AdapterNotConnectedError"
    this.adapterId = adapterId
  }
}

export function createNotConnectedAdapter(config) {
  const adapter = {
    id: config.id,
    label: config.label,
    kind: config.kind,
    description: config.description,
    sourceUrl: config.sourceUrl ?? null,
    capabilities: config.capabilities ?? [],
    requiredEnv: config.requiredEnv ?? [],
    status: config.status ?? STATUS.NOT_CONNECTED,
    fetch: async () => {
      throw new AdapterNotConnectedError(config.id)
    },
    parse: (payload) => payload,
    validate: (payload) => ({ valid: false, errors: ["Adapter is not connected."] }),
    normalize: (payload) => payload,
  }
  return Object.freeze(adapter)
}

export function adapterContract(adapter) {
  return ["fetch", "parse", "validate", "normalize"].every(
    (method) => typeof adapter?.[method] === "function"
  )
}
