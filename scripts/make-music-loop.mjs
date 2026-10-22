// Cuts the radio's looping music from a licensed source track (see CREDITS.md).
// Usage: yarn music:loop <input> [startSeconds=0] [durationSeconds=90]
// Writes public/audio/music-cozy.mp3: stereo, 44.1 kHz, 128 kbps, no tags.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const FADE_SECONDS = 1.5 // soft fade at both ends hides the loop restart
const LOUDNESS = 'loudnorm=I=-16:TP=-1.5' // the in-app MUSIC_VOLUME sits it under the effects
const SILENCE = 'silencedetect=noise=-40dB:d=2' // report quiet stretches of 2 s or more

const output = join(
  import.meta.dirname,
  '..',
  'public',
  'audio',
  'music-cozy.mp3',
)

function fail(message) {
  console.error(message)
  console.error(
    'Usage: yarn music:loop <input> [startSeconds=0] [durationSeconds=90]',
  )
  process.exit(1)
}

const [input, startArg = '0', durationArg = '90'] = process.argv.slice(2)
const start = Number(startArg)
const duration = Number(durationArg)
if (!input || !existsSync(input)) fail(`Input file not found: ${input ?? ''}`)
if (!Number.isFinite(start) || start < 0) fail(`Invalid start: ${startArg}`)
if (!Number.isFinite(duration) || duration <= 2 * FADE_SECONDS) {
  fail(`Duration must be more than ${2 * FADE_SECONDS} s: ${durationArg}`)
}

const filters = [
  `afade=t=in:st=0:d=${FADE_SECONDS}`,
  `afade=t=out:st=${duration - FADE_SECONDS}:d=${FADE_SECONDS}`,
  LOUDNESS,
].join(',')

execFileSync(
  ffmpegPath,
  [
    '-y',
    '-ss',
    String(start),
    '-t',
    String(duration),
    '-i',
    input,
    '-vn', // drop embedded cover art
    '-map_metadata',
    '-1', // drop the source's tags
    '-id3v2_version',
    '0',
    '-write_id3v1',
    '0',
    '-af',
    filters,
    '-ac',
    '2',
    '-ar',
    '44100',
    '-b:a',
    '128k',
    output,
  ],
  { stdio: 'ignore' },
)
console.log(`wrote ${output} (${Math.round(statSync(output).size / 1024)} KB)`)

// ffmpeg prints silencedetect results on stderr.
const probe = spawnSync(
  ffmpegPath,
  ['-hide_banner', '-i', output, '-af', SILENCE, '-f', 'null', '-'],
  { encoding: 'utf8' },
)
const silences = (probe.stderr ?? '')
  .split('\n')
  .filter((line) => line.includes('silence_end'))
if (silences.length === 0) console.log('no silence of 2 s or more')
else {
  console.log('silence of 2 s or more found:')
  for (const line of silences) console.log(`  ${line.trim()}`)
}
