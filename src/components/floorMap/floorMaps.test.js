import { describe, it, expect } from 'vitest'
import { normalizeLabel, scopeSvg, readLabels, findMapRoom, formatLocation, FLOOR_MAPS } from './floorMaps'

describe('normalizeLabel', () => {
  it('unifies club room spacing and ignores case / extra whitespace', () => {
    expect(normalizeLabel('동방18')).toBe('동방 18')
    expect(normalizeLabel(' 동방  5 ')).toBe('동방 5')
    expect(normalizeLabel('b333')).toBe('B333')
    expect(normalizeLabel('총동연')).toBe('총동연')
  })

  it('returns empty for missing values', () => {
    expect(normalizeLabel('')).toBe('')
    expect(normalizeLabel(undefined)).toBe('')
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

describe('readLabels', () => {
  it('joins labels split across tspans and counts repeats', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<text><tspan>동방 3</tspan></text>' +
      '<text><tspan>동방</tspan><tspan x="7" y="18">21</tspan></text>' +
      '<text><tspan>계단</tspan></text><text><tspan>계단</tspan></text></svg>'
    const labels = readLabels(svg)
    expect(labels.get('동방 3')).toBe(1)
    expect(labels.get('동방 21')).toBe(1)
    expect(labels.get('계단')).toBe(2)
  })
})

describe('FLOOR_MAPS / findMapRoom', () => {
  it('loads the sophie floor plans', () => {
    expect(FLOOR_MAPS.length).toBeGreaterThanOrEqual(2)
    for (const m of FLOOR_MAPS) expect(m.svg).toMatch(/<svg/)
  })

  it('every club room 1–40 resolves to exactly one floor', () => {
    for (let n = 1; n <= 40; n += 1) expect(findMapRoom(`동방 ${n}`), `동방 ${n}`).not.toBeNull()
  })

  it('resolves club rooms and named rooms from the floor plan itself', () => {
    expect(findMapRoom('동방 5')).toMatchObject({ label: '동방 5', map: { floor: '2층' } })
    expect(findMapRoom('동방21')).toMatchObject({ label: '동방 21', map: { floor: '3층' } })
    expect(findMapRoom('총동연')).toMatchObject({ map: { floor: '3층' } })
    expect(findMapRoom('총학생회')).toMatchObject({ map: { floor: '3층' } })
  })

  it('skips classroom codes even if they are drawn on the plan', () => {
    expect(findMapRoom('B333')).toBeNull()
    expect(formatLocation('B333')).toBe('B333')
  })

  it('skips labels that do not pin down one place', () => {
    expect(findMapRoom('계단')).toBeNull()       // 두 층 모두, 3층엔 두 번
    expect(findMapRoom('남자화장실')).toBeNull() // 두 층 모두
  })

  it('returns null for unknown locations', () => {
    expect(findMapRoom('N421')).toBeNull()
    expect(findMapRoom('동방 99')).toBeNull()
    expect(findMapRoom('')).toBeNull()
  })

  it('formatLocation prefixes the floor only for places on a floor plan', () => {
    expect(formatLocation('동방 5')).toBe('2층 · 동방 5')
    expect(formatLocation('총동연')).toBe('3층 · 총동연')
    expect(formatLocation('N421')).toBe('N421')
  })
})
