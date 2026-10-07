// `npm run dev` at the repo root: starts backend/ and frontend/ dev servers together.
// No dependencies, so the root never needs `npm install`. Every output line is
// labelled with the app it came from. Ctrl+C stops both (press it twice to force);
// if either app exits on its own, the other is stopped too.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const apps = [
  { name: 'backend', color: 35 }, // magenta
  { name: 'frontend', color: 32 }, // green
]

const missing = apps.filter((app) => !existsSync(path.join(root, app.name, 'node_modules')))
if (missing.length > 0) {
  for (const app of missing) {
    console.error(`${app.name}/node_modules is missing - run: cd ${app.name} && npm install`)
  }
  process.exit(1)
}

const width = Math.max(...apps.map((app) => app.name.length))
let stopping = false
let forceTimer

const children = apps.map((app) => {
  const label = `\x1b[${app.color}m[${app.name}]\x1b[0m${' '.repeat(width - app.name.length)} `
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(root, app.name),
    // Output is piped, so tools would drop their colours without this.
    env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    // Own process group, so stop() reaches the processes npm starts, not just npm.
    detached: true,
  })
  createInterface({ input: child.stdout }).on('line', (line) => process.stdout.write(label + line + '\n'))
  createInterface({ input: child.stderr }).on('line', (line) => process.stderr.write(label + line + '\n'))
  child.on('error', (error) => {
    console.error(`${label}could not start: ${error.message}`)
    process.exitCode = 1
    stop('SIGTERM')
  })
  child.on('exit', (code, signal) => {
    if (stopping) return
    console.error(`${label}exited (${signal ?? `code ${code}`}) - stopping the other app`)
    process.exitCode = code || 1
    stop('SIGTERM')
  })
  return child
})

function signalAll(signal) {
  for (const child of children) {
    if (child.pid === undefined) continue
    try {
      process.kill(-child.pid, signal)
    } catch {
      // Group already gone.
    }
  }
}

function stop(signal) {
  if (stopping) {
    signalAll('SIGKILL')
    return
  }
  stopping = true
  signalAll(signal)
  // Anything still running after 5s is killed; unref'd so it never holds the process open.
  forceTimer = setTimeout(() => signalAll('SIGKILL'), 5000)
  forceTimer.unref()
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => stop(signal))
}
