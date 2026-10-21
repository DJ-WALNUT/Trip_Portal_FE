import { describe, it, expect } from 'vitest'
import { mergeSiteInfo, instagramUrl } from './siteInfo'

const defaults = { a: '기본', b: 1, c: [1] }

describe('mergeSiteInfo', () => {
  it('prefers server values', () => {
    expect(mergeSiteInfo(defaults, { a: '서버', b: 0 })).toEqual({ a: '서버', b: 0, c: [1] })
  })
  it('falls back to defaults on null/undefined', () => {
    expect(mergeSiteInfo(defaults, { a: null, b: undefined })).toEqual(defaults)
  })
  it('ignores unknown server keys', () => {
    expect(mergeSiteInfo(defaults, { z: 'x' })).toEqual(defaults)
  })
  it('returns a copy of defaults when server is not an object', () => {
    for (const bad of [null, undefined, 'x', 3]) {
      const out = mergeSiteInfo(defaults, bad)
      expect(out).toEqual(defaults)
      expect(out).not.toBe(defaults)
    }
  })
})

describe('instagramUrl', () => {
  it('builds profile url', () => {
    expect(instagramUrl('cuk.engineering')).toBe('https://www.instagram.com/cuk.engineering')
  })
})
