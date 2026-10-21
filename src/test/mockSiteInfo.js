import { vi } from 'vitest'
import { DEFAULT_SITE_INFO } from '@/config/siteDefaults'

// 사용법 (테스트 파일 상단):
//   vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule))
//   setSiteInfo({ 'contact.manager': '홍길동' })   // 각 테스트에서 덮어쓰기
//   beforeEach(resetSiteInfo)

let override = {}
let cached = null
const refresh = vi.fn()

export const setSiteInfo = (next = {}) => {
  override = next
  cached = null
}
export const resetSiteInfo = () => {
  override = {}
  cached = null
  refresh.mockReset()
}
export const mockRefresh = refresh

export const contextModule = {
  useSiteInfo: () => {
    if (!cached) cached = { info: { ...DEFAULT_SITE_INFO, ...override }, refresh }
    return cached
  },
  SiteInfoProvider: ({ children }) => children,
}
