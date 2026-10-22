// Turns a licensed rain loop into the window's rain sound (see CREDITS.md).
// Usage: yarn rain:loop <input>
// Writes public/audio/rain.mp3: mono, 32 kHz, 56 kbps, no tags, levelled to a
// soft average so RAIN_VOLUME sits it under the music. The input must already
// loop cleanly: no fades are added (they would break the loop).
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const TARGET_MEAN_DB = -26

const output = join(import.meta.dirname, '..', 'public', 'audio', 'rain.mp3')

const [input] = process.argv.slice(2)
if (!input || !existsSync(input)) {
  console.error(`Input file not found: ${input ?? ''}`)
  console.error('Usage: yarn rain:loop <input>')
  process.exit(1)
}

// ffmpeg prints volumedetect results on stderr.
const probe = spawnSync(
  ffmpegPath,
  ['-hide_banner', '-i', input, '-af', 'volumedetect', '-f', 'null', '-'],
  { encoding: 'utf8' },
)
const mean = Number(/mean_volume: (-?[\d.]+) dB/.exec(probe.stderr ?? '')?.[1])
if (!Number.isFinite(mean)) {
  console.error('Could not measure the input volume.')
  process.exit(1)
}
const gain = TARGET_MEAN_DB - mean

execFileSync(
  ffmpegPath,
  [
    '-y',
    '-i',
    input,
    '-vn',
    '-map_metadata',
    '-1',
    '-id3v2_version',
    '0',
    '-write_id3v1',
    '0',
    '-af',
    `volume=${gain.toFixed(1)}dB`,
    '-ac',
    '1',
    '-ar',
    '32000',
    '-b:a',
    '56k',
    output,
  ],
  { stdio: 'ignore' },
)
console.log(
  `wrote ${output} (${Math.round(statSync(output).size / 1024)} KB), mean ${mean} dB -> ${TARGET_MEAN_DB} dB`,
)
