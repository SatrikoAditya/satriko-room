export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return false
    // Release the probe context; browsers cap the number of live WebGL contexts.
    gl.getExtension?.('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
