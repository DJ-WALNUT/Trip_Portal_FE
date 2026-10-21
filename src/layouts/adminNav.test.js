import { describe, it, expect } from 'vitest'
import { getAdminNav } from './adminNav'

const labels = (role) => getAdminNav(role).flatMap((g) => g.items.map((i) => i.label))

describe('getAdminNav', () => {
  it('hides master items for sub', () => {
    expect(labels('sub')).not.toContain('인스타 관리')
    expect(labels('sub')).not.toContain('티저 이벤트')
    expect(labels('master')).toContain('인스타 관리')
    expect(labels('master')).toContain('티저 이벤트')
  })
  it('treats null like sub', () => {
    expect(getAdminNav(null)).toEqual(getAdminNav('sub'))
  })
})

describe('site-info nav', () => {
  it('shows 정보 관리 only to master', () => {
    expect(labels('master')).toContain('정보 관리')
    expect(labels('sub')).not.toContain('정보 관리')
  })
})
