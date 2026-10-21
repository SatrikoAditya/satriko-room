// Fails (exit 1) when an asset or JS budget is exceeded.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const sum = (dir, pred) =>
  readdirSync(dir, { withFileTypes: true }).reduce((t, e) => {
    const p = join(dir, e.name)
    return (
      t + (e.isDirectory() ? sum(p, pred) : pred(e.name) ? statSync(p).size : 0)
    )
  }, 0)
const kb = (n) => Math.round(n / 1024)

const assetChecks = [
  ['public/models', (n) => n.endsWith('.glb'), 2 * 1024 * 1024, '3D models'],
  [
    'public/audio',
    (n) => n.endsWith('.mp3') && !n.startsWith('music'),
    7 * 30 * 1024,
    'sound effects',
  ],
  ['public/poster', (n) => n.endsWith('.webp'), 2 * 300 * 1024, 'posters'],
]

let failed = false

function report(label, size, limit) {
  const ok = size <= limit
  failed ||= !ok
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${label}: ${kb(size)} KB (limit ${kb(limit)} KB)`,
  )
}

for (const [dir, pred, limit, label] of assetChecks) {
  let size = 0
  try {
    size = sum(dir, pred)
  } catch {
    size = 0
  }
  report(label, size, limit)
}

const NEXT_DIR = '.next'
const ROUTE = '/[[...section]]/page'

function gzipSize(file) {
  return gzipSync(readFileSync(file)).length
}

function listJsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? listJsFiles(p) : e.name.endsWith('.js') ? [p] : []
  })
}

// Turbopack writes the route's shared runtime/framework chunks to its own
// build-manifest.json and the chunks of its client components to the
// client-reference manifest. Together they are what the HTML loads.
function readClientReferenceManifest(file) {
  const holder = { __RSC_MANIFEST: {} }
  new Function('globalThis', readFileSync(file, 'utf8'))(holder)
  return Object.values(holder.__RSC_MANIFEST)[0]
}

function firstLoadFiles() {
  const routeDir = join(NEXT_DIR, 'server', 'app', ROUTE.replace(/\/page$/, ''))
  const build = JSON.parse(
    readFileSync(join(routeDir, 'page', 'build-manifest.json'), 'utf8'),
  )
  const manifest = readClientReferenceManifest(
    join(routeDir, 'page_client-reference-manifest.js'),
  )
  const clientChunks = Object.values(manifest.clientModules).flatMap((m) =>
    m.chunks.map((c) => c.replace(/^\/_next\//, '')),
  )
  // polyfillFiles are noModule: modern browsers never download them.
  const files = [...build.rootMainFiles, ...clientChunks]
  return [...new Set(files)].filter((f) => f.endsWith('.js'))
}

function checkJsBudgets() {
  if (!existsSync(NEXT_DIR)) {
    console.log('SKIP js budgets (run yarn build first)')
    return
  }
  const initial = new Set(firstLoadFiles())
  const initialSize = [...initial].reduce(
    (t, f) => t + gzipSize(join(NEXT_DIR, f)),
    0,
  )
  report(`first-load JS ${ROUTE} (gzip)`, initialSize, 200 * 1024)

  const lazy = listJsFiles(join(NEXT_DIR, 'static', 'chunks'))
    .filter((p) => !initial.has(p.slice(NEXT_DIR.length + 1)))
    .map((p) => ({ p, size: gzipSize(p) }))
    .sort((a, b) => b.size - a.size)
  report(
    `largest lazy chunk (scene) (gzip) ${lazy[0]?.p ?? ''}`,
    lazy[0]?.size ?? 0,
    350 * 1024,
  )
}

checkJsBudgets()
process.exit(failed ? 1 : 0)
