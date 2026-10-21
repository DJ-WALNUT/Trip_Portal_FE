import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  return { ...actual, BrowserRouter: ({ children }) => <actual.MemoryRouter initialEntries={['/admin/dashboard']}>{children}</actual.MemoryRouter> }
})
vi.mock('./components/ProtectedRoute', async () => {
  const { Outlet } = await import('react-router-dom')
  return { default: () => <Outlet /> }
})
vi.mock('./components/icons/LucianIcon', () => ({ default: () => <span /> }))
vi.mock('@/components/icons/LucianIcon', () => ({ default: () => <span /> }))
vi.mock('./components/Footer', () => ({ default: () => <footer /> }))
vi.mock('./components/z_dino(easter)/DinoGame', () => ({ default: () => null }))
vi.mock('./pages/admin/AdminDashboardPage', () => ({ default: () => <div>dash</div> }))
vi.mock('axios', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { status: 'success', data: [] } }), post: vi.fn() } }))
for (const p of ['./pages/HomePage','./pages/client/TeaserPage','./pages/admin/AdminTeaserPage','./pages/client/notice/NoticePage','./pages/client/notice/NoticeDetailPage','./pages/client/MapPage','./pages/client/borrow/BorrowPage','./pages/client/borrow/CheckPage','./pages/client/borrow/SuccessPage','./pages/client/DepartmentPage','./pages/client/OrganPage','./pages/client/terms/TermsPage','./pages/client/terms/PrivacyPage','./pages/client/terms/EmailRefusalPage','./pages/client/terms/CreditsPage','./pages/admin/AdminLoginPage','./pages/admin/AdminNoticeListPage','./pages/admin/AdminNoticeWritePage','./pages/admin/AdminInstagramPage','./pages/admin/borrow/AdminApprovePage','./pages/admin/borrow/AdminReturnPage','./pages/admin/borrow/AdminStockPage','./pages/admin/borrow/AdminLogPage']) {
  vi.doMock(p, () => ({ default: () => null }))
}

window.scrollTo = vi.fn()

describe('App routing', () => {
  it('admin route has no user header', async () => {
    const { default: App } = await import('./App')
    render(<App />)
    expect(await screen.findByText('dash')).toBeTruthy()
    expect(screen.queryByAltText('여정 로고')).toBeNull()
  })
})
