import { P_START_RAIN, P_STOP_RAIN } from '@constants/weather'
import type { Weather } from '@interfaces/ui'

/** Returns a number in [0, 1), like Math.random. */
type Rng = () => number

/** The long-run share of rain: a two-state chain that starts and stops rain at each check. */
export const RAIN_SHARE = P_START_RAIN / (P_START_RAIN + P_STOP_RAIN)

/** The weather a visit opens with: rain about as often as in the long run. */
export const initialWeather = (rng: Rng): Weather =>
  rng() < RAIN_SHARE ? 'rain' : 'clear'

/** The weather after one check. */
export const nextWeather = (current: Weather, rng: Rng): Weather =>
  current === 'clear'
    ? rng() < P_START_RAIN
      ? 'rain'
      : 'clear'
    : rng() < P_STOP_RAIN
      ? 'clear'
      : 'rain'

/**
 * `?weather=clear|rain` fixes the weather (for previews and steady test
 * screenshots); `?poster` keeps the posters clear. Otherwise null.
 */
export function forcedWeather(search: string): Weather | null {
  const params = new URLSearchParams(search)
  const asked = params.get('weather')
  if (asked === 'clear' || asked === 'rain') return asked
  return params.has('poster') ? 'clear' : null
}
