import { describe, it, expect } from 'vitest'
import { fitViewBox, shiftUp, FULL_VIEWBOX } from './campusMapView'

const parse = (vb) => vb.split(' ').map(Number)
const focus = { x: 100, y: 200, w: 800, h: 600 }

describe('fitViewBox', () => {
  it('matches the container aspect ratio so the map fills it without letterboxing', () => {
    for (const aspect of [0.5, 0.75, 1, 4 / 3, 2, 3]) {
      const [, , w, h] = parse(fitViewBox(focus, aspect))
      expect(w / h).toBeCloseTo(aspect, 5)
    }
  })

  it('always keeps the whole focus area (all buildings) visible', () => {
    for (const aspect of [0.5, 1, 2, 3]) {
      const [x, y, w, h] = parse(fitViewBox(focus, aspect))
      expect(x).toBeLessThanOrEqual(focus.x + 1e-6)
      expect(y).toBeLessThanOrEqual(focus.y + 1e-6)
      expect(x + w).toBeGreaterThanOrEqual(focus.x + focus.w - 1e-6)
      expect(y + h).toBeGreaterThanOrEqual(focus.y + focus.h - 1e-6)
    }
  })

  it('zooms in tightly when the container already has the focus aspect', () => {
    const [x, y, w, h] = parse(fitViewBox(focus, focus.w / focus.h))
    expect([x, y, w, h].map(Math.round)).toEqual([100, 200, 800, 600])
  })

  it('fills extra space with map that exists instead of empty area (stays inside the map when possible)', () => {
    const full = { x: 0, y: 0, w: 1000, h: 1000 }
    const [x, y, w, h] = parse(fitViewBox({ x: 600, y: 100, w: 400, h: 400 }, 2, full))
    expect(w).toBe(800)
    expect(h).toBe(400)
    expect(x + w).toBeLessThanOrEqual(1000) // 오른쪽 끝을 넘지 않고 왼쪽으로 밀림
    expect(x).toBeGreaterThanOrEqual(0)
    expect(y).toBe(100)
  })

  it('shiftUp moves the focus down so the map content sits higher in the frame', () => {
    expect(shiftUp(focus, 0.1)).toEqual({ x: 100, y: 260, w: 800, h: 600 })
    expect(shiftUp(focus, 0)).toEqual(focus)
    const [, yBase] = parse(fitViewBox(focus, focus.w / focus.h))
    const [, yShifted] = parse(fitViewBox(shiftUp(focus, 0.1), focus.w / focus.h))
    expect(yShifted).toBeGreaterThan(yBase)
  })

  it('falls back to the full map for a bad aspect', () => {
    expect(fitViewBox(focus, 0)).toBe(FULL_VIEWBOX)
    expect(fitViewBox(focus, NaN)).toBe(FULL_VIEWBOX)
  })
})
