import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist")
const basePath = process.env.BASE_PATH || "/"
const deploymentStatus = process.env.DEPLOYMENT_STATUS || "PENDING DEPLOY"
const hfProviderStatus = process.env.HF_PROVIDER_STATUS || "NOT CONNECTED"
const assetVersion = process.env.ASSET_VERSION || process.env.GITHUB_SHA || String(Date.now())

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })

for (const file of ["styles.css", "app.js", "manifest.webmanifest", "sw.js"]) {
  await cp(path.join(root, file), path.join(dist, file))
}
await cp(path.join(root, "src"), path.join(dist, "src"), { recursive: true })

async function versionModuleImports(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) await versionModuleImports(file)
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue
    const source = await readFile(file, "utf8")
    const versioned = source.replace(/(from\s+["'])(\.\.?\/[^"']+\.js)(["'])/g, `$1$2?v=${assetVersion}$3`)
    if (versioned !== source) await writeFile(file, versioned)
  }
}

await versionModuleImports(dist)

let index = await readFile(path.join(root, "index.html"), "utf8")
index = index.replaceAll("__BASE_PATH__", basePath)
index = index.replace('href="./styles.css"', `href="./styles.css?v=${assetVersion}"`)
const runtime = `<script>window.__APP_META__=${JSON.stringify({ basePath, deploymentStatus, hfProviderStatus, assetVersion })}</script>`
index = index.replace("<script type=\"module\" src=\"./app.js\"></script>", `${runtime}\n    <script type="module" src="./app.js?v=${assetVersion}"></script>`)
await writeFile(path.join(dist, "index.html"), index)
await writeFile(
  path.join(dist, "build-meta.json"),
  `${JSON.stringify({ basePath, deploymentStatus, hfProviderStatus, assetVersion, builtAt: new Date().toISOString() }, null, 2)}\n`
)

console.log(`Built ${dist} with base path ${basePath}`)
