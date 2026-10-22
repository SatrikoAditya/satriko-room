'use client'

import { useEffect } from 'react'

import { useSceneStore } from '@store/useSceneStore'

import { CALLED_RAIN_MS, WEATHER_CHECK_MS } from '@constants/weather'
import type { Weather } from '@interfaces/ui'
import { forcedWeather, initialWeather, nextWeather } from '@utils/weather'

/**
 * Random weather for the window: it opens with rain about one visit in three
 * and may start or stop raining every few minutes. The umbrella stand calls
 * rain for CALLED_RAIN_MS, after which the window goes back to the weather the
 * scheduler wants. `?weather=` fixes it (previews, steady screenshots).
 */
export function useWeather() {
  useEffect(() => {
    const store = useSceneStore
    const forced = forcedWeather(window.location.search)
    let base: Weather = forced ?? initialWeather(Math.random)
    let calling = false
    store.getState().setWeather(base)

    const check = forced
      ? null
      : window.setInterval(() => {
          base = nextWeather(base, Math.random)
          if (!calling) store.getState().setWeather(base)
        }, WEATHER_CHECK_MS)

    let endCall: number | undefined
    const unsubscribe = store.subscribe((s, prev) => {
      if (s.rainCalls === prev.rainCalls) return
      window.clearTimeout(endCall)
      calling = true
      endCall = window.setTimeout(() => {
        calling = false
        store.getState().setWeather(base)
      }, CALLED_RAIN_MS)
    })

    return () => {
      if (check !== null) window.clearInterval(check)
      window.clearTimeout(endCall)
      unsubscribe()
    }
  }, [])
}
