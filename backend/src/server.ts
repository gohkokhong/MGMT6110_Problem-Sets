import express from 'express'

// 4000 is what frontend/vite.config.ts proxies /api to in dev - change both together.
const port = Number(process.env.PORT ?? 4000)

const app = express()

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`MGMT6110 backend listening on http://localhost:${port}`)
})
