// Converts public/audio/*.ogg (CC0 originals) to mono 32 kHz 48 kbps MP3.
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const dir = join(import.meta.dirname, '..', 'public', 'audio')
for (const f of readdirSync(dir).filter((n) => n.endsWith('.ogg'))) {
  const dst = join(dir, f.replace(/\.ogg$/, '.mp3'))
  execFileSync(
    ffmpegPath,
    ['-y', '-i', join(dir, f), '-ac', '1', '-ar', '32000', '-b:a', '48k', dst],
    { stdio: 'ignore' },
  )
  console.log('wrote', dst)
}
