// Bogor is "Kota Hujan", the City of Rain: the window sometimes shows rain.

/** How often the weather may change during a visit. */
export const WEATHER_CHECK_MS = 3 * 60_000
/** Chance that a check starts rain. */
export const P_START_RAIN = 0.25
/** Chance that a check stops rain. With P_START_RAIN this rains a third of the time. */
export const P_STOP_RAIN = 0.5
/** Rain called by the umbrella stand lasts this long, then the weather goes back. */
export const CALLED_RAIN_MS = 60_000
/** Rain fades in and out of the window over this many seconds. */
export const RAIN_FADE_SECONDS = 3
