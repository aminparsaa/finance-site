import { createAdapterRegistry } from "./src/adapters/registry.js"
import { getRoute } from "./src/app/routes.js"
import { createDataRepository } from "./src/services/dataRepository.js"
import { loadConfig, saveConfig } from "./src/services/configStore.js"
import { STATUS } from "./src/domain/schemas.js"
import { DEFAULT_HF_MODEL, runHuggingFaceInference, verifyHuggingFaceToken } from "./src/services/huggingFaceClient.js"
import { renderApp } from "./src/ui/render.js"

const runtimeMeta = window.__APP_META__ ?? {
  basePath: document.querySelector('meta[name="x-base-path"]')?.content ?? "/",
  deploymentStatus: "PENDING DEPLOY",
  hfProviderStatus: "NOT CONNECTED",
}
const repository = createDataRepository({ registry: createAdapterRegistry(), runtimeMeta })
let state = repository.getSnapshot()
let config = loadConfig()
let countdownTimer = null
let browserOnlyToken = ""
let browserState = {
  status: STATUS.NOT_CONNECTED,
  model: DEFAULT_HF_MODEL,
  result: "No request has been sent from this tab.",
}
const baseLlmState = state.system.find((item) => item.label === "LLM") ?? {
  status: STATUS.NOT_CONNECTED,
  note: "LLM is optional and not connected.",
}

function render() {
  const root = document.querySelector("#app")
  if (!root) return
  root.innerHTML = renderApp(getRoute(), state, config, browserState)
  document.body.classList.toggle("compact-mode", Boolean(config.compactMode))
  bindPageEvents()
  updateCountdown()
}

function bindPageEvents() {
  document.querySelectorAll("[data-config-key]").forEach((element) => {
    const eventName = element.type === "number" ? "input" : "change"
    element.addEventListener(eventName, () => {
      const key = element.dataset.configKey
      let value
      if (element.type === "checkbox") value = element.checked
      else if (element.type === "number") value = Number(element.value)
      else value = element.value
      config = saveConfig({ ...config, [key]: value })
      if (getRoute() === "settings") render()
    })
  })

  document.querySelector("#historical-indicator")?.addEventListener("change", (event) => {
    state = {
      ...state,
      historical: { ...state.historical, selectedIndicator: event.target.value },
    }
    render()
  })

  document.querySelector("#refresh-data")?.addEventListener("click", async (event) => {
    const button = event.currentTarget
    button.disabled = true
    button.innerHTML = "Checking adapters ..."
    await repository.refresh()
    button.disabled = false
    button.innerHTML = "Refresh adapters <span>refresh</span>"
    showToast("No live adapter is connected. Nothing was refreshed.")
  })

  document.querySelector("#hf-test-connect")?.addEventListener("click", testHuggingFaceConnection)
  document.querySelector("#hf-clear-token")?.addEventListener("click", clearBrowserToken)
}

function setLlmState(status, note) {
  state = {
    ...state,
    system: state.system.map((item) => item.label === "LLM" ? { ...item, status, note } : item),
    adapters: state.adapters.map((adapter) => adapter.id === "llm-provider" ? { ...adapter, status } : adapter),
  }
}

async function testHuggingFaceConnection() {
  const tokenInput = document.querySelector("#hf-browser-token")
  const modelInput = document.querySelector("#hf-browser-model")
  const button = document.querySelector("#hf-test-connect")
  const token = tokenInput?.value.trim() || browserOnlyToken
  const model = modelInput?.value.trim() || DEFAULT_HF_MODEL
  if (!token) {
    browserState = { ...browserState, status: STATUS.UNAVAILABLE, result: "Enter a token before testing." }
    render()
    return
  }

  browserOnlyToken = token
  browserState = { status: STATUS.VERIFYING, model, result: "Verifying token and testing one inference request ..." }
  if (tokenInput) tokenInput.value = ""
  if (button) button.disabled = true
  render()

  const verified = await verifyHuggingFaceToken(browserOnlyToken)
  if (!verified.ok) {
    browserOnlyToken = ""
    browserState = { ...browserState, status: STATUS.UNAVAILABLE, result: verified.message }
    setLlmState(STATUS.NOT_CONNECTED, baseLlmState.note)
    render()
    return
  }

  try {
    const response = await runHuggingFaceInference(browserOnlyToken, {
      model,
      prompt: "Reply with exactly CONNECTED. This is a connectivity test, not market analysis.",
    })
    browserState = { status: STATUS.READY, model, result: `Connected in this tab. Provider response: ${response}` }
    setLlmState(STATUS.READY, "Hugging Face inference is connected in this tab only; no token is persisted.")
  } catch (error) {
    browserState = { status: STATUS.PARTIAL, model, result: `Token verified, but inference failed: ${error.message}` }
    setLlmState(STATUS.PARTIAL, "Hugging Face token verified, but inference is not currently available for this model.")
  }
  render()
}

function clearBrowserToken() {
  browserOnlyToken = ""
  browserState = { status: STATUS.NOT_CONNECTED, model: DEFAULT_HF_MODEL, result: "Browser-only token cleared from this tab." }
  setLlmState(baseLlmState.status, baseLlmState.note)
  render()
}

function updateCountdown() {
  if (countdownTimer) window.clearInterval(countdownTimer)
  const block = document.querySelector("[data-countdown-target]")
  if (!block) return
  const target = Date.parse(block.dataset.countdownTarget)
  const value = block.querySelector("strong")
  if (!value || Number.isNaN(target)) return
  const tick = () => {
    const remaining = Math.max(0, target - Date.now())
    const seconds = Math.floor(remaining / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const rest = seconds % 60
    value.textContent = [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":")
  }
  tick()
  countdownTimer = window.setInterval(tick, 1000)
}

function showToast(message) {
  let toast = document.querySelector(".toast")
  if (!toast) {
    toast = document.createElement("div")
    toast.className = "toast"
    document.body.append(toast)
  }
  toast.textContent = message
  toast.classList.add("is-visible")
  window.setTimeout(() => toast.classList.remove("is-visible"), 3400)
}

window.addEventListener("hashchange", render)
window.addEventListener("DOMContentLoaded", () => {
  render()
  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {})
  }
})

if (document.readyState !== "loading") render()
