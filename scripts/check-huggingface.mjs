const token = process.env.HF_TOKEN

if (!token) {
  console.log("status=NOT CONNECTED")
  process.exit(0)
}

const response = await fetch("https://huggingface.co/api/whoami-v2", {
  headers: { Authorization: `Bearer ${token}` },
})

if (!response.ok) {
  console.error(`Hugging Face token verification failed with HTTP ${response.status}.`)
  process.exit(1)
}

console.log("status=PARTIAL")
