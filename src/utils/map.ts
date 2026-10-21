// Mercator: y = -ln(tan(pi/4 + phi/2)) = -asinh(tan(phi)); asinh keeps the equator exactly 0.
export function mercatorXY(
  lat: number,
  lon: number,
  scale: number,
  translate: readonly [number, number],
) {
  const lambda = (lon * Math.PI) / 180
  const phi = (lat * Math.PI) / 180
  return {
    x: scale * lambda + translate[0],
    y: -scale * Math.asinh(Math.tan(phi)) + translate[1],
  }
}
