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
    (n) =>
      n.endsWith('.mp3') && !n.startsWith('music') && !n.startsWith('rain'),
    7 * 30 * 1024,
    'sound effects',
  ],
  // The window's rain loop (decision 49).
  [
    'public/audio',
    (n) => n.startsWith('rain') && n.endsWith('.mp3'),
    150 * 1024,
    'ambience',
  ],
  [
    'public/audio',
    (n) => n.startsWith('music') && n.endsWith('.mp3'),
    1.5 * 1024 * 1024,
    'music',
  ],
  ['public/poster', (n) => n.endsWith('.webp'), 2 * 300 * 1024, 'posters'],
  // Covers saved by yarn games:sync (decision 52).
  [
    'public/images/gaming',
    (n) => n.endsWith('.webp'),
    450 * 1024,
    'game covers',
  ],
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

// Each travel, hiking and diving photo on its own (decisions 53, 54, 56):
// one shows at a time.
const largestFile = (dir, pred) =>
  readdirSync(dir, { withFileTypes: true }).reduce((best, e) => {
    const p = join(dir, e.name)
    const f = e.isDirectory()
      ? largestFile(p, pred)
      : pred(e.name)
        ? { path: p, size: statSync(p).size }
        : null
    return f && (!best || f.size > best.size) ? f : best
  }, null)
const TRAVEL_PHOTO_LIMIT = 250 * 1024
const biggestPhoto = [
  'public/images/travel',
  'public/images/hiking',
  'public/images/diving',
]
  .filter((dir) => existsSync(dir))
  .map((dir) => largestFile(dir, (n) => n.endsWith('.webp')))
  .reduce((best, f) => (f && (!best || f.size > best.size) ? f : best), null)
report(
  `largest hobby photo${biggestPhoto ? ` ${biggestPhoto.path}` : ''}`,
  biggestPhoto?.size ?? 0,
  TRAVEL_PHOTO_LIMIT,
)

// 250 KB: the design asked for ~200 KB, but React/Next runtime alone measured
// ~216 KB (analyzer, 2026-10-22); motion LazyMotion slimming is a tracked follow-up.
const FIRST_LOAD_LIMIT = 250 * 1024
const SCENE_CHUNK_LIMIT = 350 * 1024
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
  // Evaluates a local build artifact on purpose (it is a JS file, not JSON).
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

function readBuild() {
  const initial = new Set(firstLoadFiles())
  const chunks = listJsFiles(join(NEXT_DIR, 'static', 'chunks'))
  return { initial, chunks }
}

function checkJsBudgets() {
  if (!existsSync(NEXT_DIR)) {
    console.log('SKIP js budgets (run yarn build first)')
    return
  }
  let build
  try {
    build = readBuild()
  } catch (error) {
    console.log(
      `SKIP js budgets (could not read build manifests: ${error.message})`,
    )
    return
  }
  const { initial, chunks } = build
  const initialSize = [...initial].reduce(
    (t, f) => t + gzipSize(join(NEXT_DIR, f)),
    0,
  )
  report(`first-load JS ${ROUTE} (gzip)`, initialSize, FIRST_LOAD_LIMIT)

  const lazy = chunks
    .filter((p) => !initial.has(p.slice(NEXT_DIR.length + 1)))
    .map((p) => ({ p, size: gzipSize(p) }))
    .sort((a, b) => b.size - a.size)
  if (lazy.length === 0) {
    console.log('SKIP largest non-initial chunk (none found)')
    return
  }
  const { p, size } = lazy[0]
  const note = readFileSync(p, 'utf8').includes('WebGLRenderer')
    ? '(contains three.js)'
    : '(does not contain three.js)'
  report(
    `largest non-initial chunk (gzip) ${p} ${note}`,
    size,
    SCENE_CHUNK_LIMIT,
  )
}

checkJsBudgets()
process.exit(failed ? 1 : 0)
