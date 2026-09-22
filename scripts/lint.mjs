import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await collect(fullPath)))
    else if (entry.name.endsWith(".js") || entry.name.endsWith(".mjs")) files.push(fullPath)
  }
  return files
}

function checkSyntax(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--check", file], { stdio: "pipe" })
    let output = ""
    child.stderr.on("data", (chunk) => { output += chunk })
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(output)))
  })
}

const files = await collect(root)
for (const file of files) await checkSyntax(file)
const source = await Promise.all(files.map((file) => readFile(file, "utf8")))
const forbidden = /(?:sk-[A-Za-z0-9]{12,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,})/
if (source.some((content) => forbidden.test(content))) throw new Error("Possible credential pattern found")
console.log(`Linted ${files.length} JavaScript files`)
