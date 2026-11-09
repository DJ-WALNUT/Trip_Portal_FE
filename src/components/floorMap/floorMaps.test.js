import { describe, it, expect } from 'vitest'
import { parseClubRoomNumber, scopeSvg, readRoomLabels, findClubRoom, formatLocation, FLOOR_MAPS } from './floorMaps'

describe('parseClubRoomNumber', () => {
  it('reads "동방 N" with or without a space', () => {
    expect(parseClubRoomNumber('동방 5')).toBe(5)
    expect(parseClubRoomNumber('동방18')).toBe(18)
    expect(parseClubRoomNumber(' 동방 40 ')).toBe(40)
  })

  it('ignores ordinary room codes', () => {
    expect(parseClubRoomNumber('B314')).toBeNull()
    expect(parseClubRoomNumber('N421')).toBeNull()
    expect(parseClubRoomNumber('')).toBeNull()
    expect(parseClubRoomNumber(undefined)).toBeNull()
  })
})

describe('scopeSvg', () => {
  const raw = '<svg id="_레이어_1"><defs><style>.cls-1, .cls-2 { fill: #fff; }</style></defs>' +
    '<g id="room"><rect class="cls-1 cls-2"/></g></svg>'

  it('prefixes class names in both the <style> block and class attributes', () => {
    const out = scopeSvg(raw, 'fm-x')
    expect(out).toContain('.fm-x-cls-1, .fm-x-cls-2')
    expect(out).toContain('class="fm-x-cls-1 fm-x-cls-2"')
    expect(out).not.toMatch(/[".\s]cls-1/)
  })

  it('prefixes ids so two floor plans can share a page', () => {
    const out = scopeSvg(raw, 'fm-x')
    expect(out).toContain('id="fm-x-room"')
    expect(out).toContain('id="fm-x-_레이어_1"')
  })
})

describe('readRoomLabels', () => {
  it('joins labels split across tspans ("동방" / "21")', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<text><tspan>동방 3</tspan></text>' +
      '<text><tspan>동방</tspan><tspan x="7" y="18">21</tspan></text>' +
      '<text><tspan>계단</tspan></text></svg>'
    expect([...readRoomLabels(svg)].sort((a, b) => a - b)).toEqual([3, 21])
  })
})

describe('FLOOR_MAPS / findClubRoom', () => {
  it('loads the sophie floor plans', () => {
    expect(FLOOR_MAPS.length).toBeGreaterThanOrEqual(2)
    for (const m of FLOOR_MAPS) expect(m.svg).toMatch(/<svg/)
  })

  it('every club room 1–40 lives on exactly one floor', () => {
    for (let n = 1; n <= 40; n += 1) {
      const hits = FLOOR_MAPS.filter((m) => m.rooms.has(n))
      expect(hits, `동방 ${n}`).toHaveLength(1)
    }
  })

  it('resolves the floor from the floor plan itself', () => {
    expect(findClubRoom('동방 5')).toMatchObject({ number: 5, map: { floor: '2층' } })
    expect(findClubRoom('동방 21')).toMatchObject({ number: 21, map: { floor: '3층' } })
  })

  it('formatLocation prefixes the floor only for club rooms', () => {
    expect(formatLocation('동방 5')).toBe('2층 · 동방 5')
    expect(formatLocation('B314')).toBe('B314')
  })

  it('returns null for non club rooms or unknown numbers', () => {
    expect(findClubRoom('B314')).toBeNull()
    expect(findClubRoom('동방 99')).toBeNull()
  })
})
