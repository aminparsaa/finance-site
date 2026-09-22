import { createInitialState } from "../data/initialState.js"

export function createDataRepository({ registry, runtimeMeta } = {}) {
  let snapshot = createInitialState({ registry, runtimeMeta })
  return Object.freeze({
    getSnapshot: () => snapshot,
    refresh: async () => snapshot,
    replaceSnapshot: (nextSnapshot) => {
      snapshot = nextSnapshot
      return snapshot
    },
  })
}
