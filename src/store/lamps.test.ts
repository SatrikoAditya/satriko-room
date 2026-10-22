import { beforeEach, describe, expect, it } from 'vitest'

import { useSceneStore } from './useSceneStore'

describe('lamps', () => {
  beforeEach(() => useSceneStore.getState().setTheme('day'))

  it('are off by day and toggle one at a time', () => {
    const s = useSceneStore.getState()
    expect(s.lampsOn).toEqual({ 'bedside-lamp': false, 'desk-lamp': false })
    s.toggleLamp('desk-lamp')
    expect(useSceneStore.getState().lampsOn).toEqual({
      'bedside-lamp': false,
      'desk-lamp': true,
    })
    useSceneStore.getState().toggleLamp('desk-lamp')
    expect(useSceneStore.getState().lampsOn['desk-lamp']).toBe(false)
  })

  it('follow the theme again whenever it changes', () => {
    const s = useSceneStore.getState()
    s.toggleLamp('bedside-lamp')
    s.setTheme('night')
    expect(useSceneStore.getState().lampsOn).toEqual({
      'bedside-lamp': true,
      'desk-lamp': true,
    })
    useSceneStore.getState().toggleLamp('bedside-lamp')
    expect(useSceneStore.getState().lampsOn['bedside-lamp']).toBe(false)
    useSceneStore.getState().setTheme('day')
    expect(useSceneStore.getState().lampsOn).toEqual({
      'bedside-lamp': false,
      'desk-lamp': false,
    })
  })
})
