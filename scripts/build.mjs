import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist")
const basePath = process.env.BASE_PATH || "/"
const deploymentStatus = process.env.DEPLOYMENT_STATUS || "PENDING DEPLOY"
const hfProviderStatus = process.env.HF_PROVIDER_STATUS || "NOT CONNECTED"

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })

for (const file of ["styles.css", "app.js", "manifest.webmanifest", "sw.js"]) {
  await cp(path.join(root, file), path.join(dist, file))
}
await cp(path.join(root, "src"), path.join(dist, "src"), { recursive: true })

let index = await readFile(path.join(root, "index.html"), "utf8")
index = index.replaceAll("__BASE_PATH__", basePath)
const runtime = `<script>window.__APP_META__=${JSON.stringify({ basePath, deploymentStatus, hfProviderStatus })}</script>`
index = index.replace("<script type=\"module\" src=\"./app.js\"></script>", `${runtime}\n    <script type="module" src="./app.js"></script>`)
await writeFile(path.join(dist, "index.html"), index)
await writeFile(
  path.join(dist, "build-meta.json"),
  `${JSON.stringify({ basePath, deploymentStatus, hfProviderStatus, builtAt: new Date().toISOString() }, null, 2)}\n`
)

console.log(`Built ${dist} with base path ${basePath}`)
