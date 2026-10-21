import { describe, it, expect, vi, afterEach } from 'vitest'
import { readBool, writeBool } from './safeStorage'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('readBool / writeBool', () => {
  it('저장한 boolean을 다시 읽는다', () => {
    writeBool('flag', true)
    expect(readBool('flag', false)).toBe(true)
    writeBool('flag', false)
    expect(readBool('flag', true)).toBe(false)
  })

  it('값이 없으면 fallback', () => {
    expect(readBool('missing', true)).toBe(true)
  })

  it('getItem이 throw하면 fallback을 돌려준다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error()
    })
    expect(readBool('flag', true)).toBe(true)
  })

  it('setItem이 throw해도 writeBool은 throw하지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error()
    })
    expect(() => writeBool('flag', true)).not.toThrow()
  })
})
