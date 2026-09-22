export const ROUTES = Object.freeze({
  dashboard: { label: "Dashboard", path: "#/dashboard" },
  events: { label: "Events", path: "#/events" },
  historical: { label: "Historical", path: "#/historical" },
  sources: { label: "Sources", path: "#/sources" },
  settings: { label: "Settings", path: "#/settings" },
})

export function getRoute(hash = window.location.hash) {
  const name = hash.replace(/^#\/?/, "").split("?")[0] || "dashboard"
  return Object.prototype.hasOwnProperty.call(ROUTES, name) ? name : "dashboard"
}
