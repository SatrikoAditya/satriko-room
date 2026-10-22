import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSceneStore } from '@store/useSceneStore'

import { CALLED_RAIN_MS, WEATHER_CHECK_MS } from '@constants/weather'

import { useWeather } from './useWeather'

describe('useWeather', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useSceneStore.setState({ weather: 'clear' })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    window.history.replaceState(null, '', '/')
  })

  it('follows the address when it forces the weather', () => {
    window.history.replaceState(null, '', '/?weather=rain')
    renderHook(() => useWeather())
    expect(useSceneStore.getState().weather).toBe('rain')
    act(() => {
      vi.advanceTimersByTime(WEATHER_CHECK_MS * 5)
    })
    expect(useSceneStore.getState().weather).toBe('rain')
  })

  it('picks the first weather and may change it at each check', () => {
    const rolls = [0.9, 0.1, 0.1]
    vi.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0.9)
    renderHook(() => useWeather())
    expect(useSceneStore.getState().weather).toBe('clear')
    act(() => {
      vi.advanceTimersByTime(WEATHER_CHECK_MS)
    })
    expect(useSceneStore.getState().weather).toBe('rain')
    act(() => {
      vi.advanceTimersByTime(WEATHER_CHECK_MS)
    })
    expect(useSceneStore.getState().weather).toBe('clear')
  })

  it('lets the umbrella call rain for a minute, then goes back', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    renderHook(() => useWeather())
    expect(useSceneStore.getState().weather).toBe('clear')
    act(() => useSceneStore.getState().callRain())
    expect(useSceneStore.getState().weather).toBe('rain')
    act(() => {
      vi.advanceTimersByTime(CALLED_RAIN_MS - 1000)
    })
    expect(useSceneStore.getState().weather).toBe('rain')
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(useSceneStore.getState().weather).toBe('clear')
  })
})
