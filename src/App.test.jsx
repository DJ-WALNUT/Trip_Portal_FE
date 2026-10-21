import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const nav = vi.hoisted(() => ({ path: '/admin/dashboard' }))

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  return { ...actual, BrowserRouter: ({ children }) => <actual.MemoryRouter initialEntries={[nav.path]}>{children}</actual.MemoryRouter> }
})
vi.mock('./components/ProtectedRoute', async () => {
  const { Outlet } = await import('react-router-dom')
  return { default: () => <Outlet /> }
})
vi.mock('./components/icons/LucianIcon', () => ({ default: () => <span /> }))
vi.mock('@/components/icons/LucianIcon', () => ({ default: () => <span /> }))
vi.mock('./components/Footer', () => ({ default: () => <footer data-testid="site-footer" /> }))
vi.mock('./components/z_dino(easter)/DinoGame', () => ({ default: () => null }))
vi.mock('./pages/admin/AdminDashboardPage', () => ({ default: () => <div>dash</div> }))
vi.mock('axios', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { status: 'success', data: [] } }), post: vi.fn() } }))
for (const p of ['./pages/HomePage','./pages/client/TeaserPage','./pages/admin/AdminTeaserPage','./pages/client/notice/NoticePage','./pages/client/notice/NoticeDetailPage','./pages/client/MapPage','./pages/client/borrow/BorrowPage','./pages/client/borrow/CheckPage','./pages/client/borrow/SuccessPage','./pages/client/DepartmentPage','./pages/client/OrganPage','./pages/client/terms/TermsPage','./pages/client/terms/PrivacyPage','./pages/client/terms/EmailRefusalPage','./pages/client/terms/CreditsPage','./pages/admin/AdminLoginPage','./pages/admin/AdminNoticeListPage','./pages/admin/AdminNoticeWritePage','./pages/admin/AdminInstagramPage','./pages/admin/borrow/AdminApprovePage','./pages/admin/borrow/AdminReturnPage','./pages/admin/borrow/AdminStockPage','./pages/admin/borrow/AdminLogPage']) {
  vi.doMock(p, () => ({ default: () => null }))
}

window.scrollTo = vi.fn()

describe('App routing', () => {
  beforeEach(() => {
    vi.resetModules()
    nav.path = '/admin/dashboard'
  })

  it('admin route has no user header', async () => {
    const { default: App } = await import('./App')
    render(<App />)
    expect(await screen.findByText('dash')).toBeTruthy()
    expect(screen.queryByAltText('여정 로고')).toBeNull()
  })

  it('shows the footer on the public home page', async () => {
    nav.path = '/'
    const { default: App } = await import('./App')
    render(<App />)
    expect(await screen.findByTestId('site-footer')).toBeTruthy()
  })

  it.each(['/admin', '/admin/dashboard'])('hides the footer on %s', async (path) => {
    nav.path = path
    const { default: App } = await import('./App')
    const { container } = render(<App />)
    await Promise.resolve()
    expect(screen.queryByTestId('site-footer')).toBeNull()
    expect(container.querySelector('.wrapper > div[style]')).toBeNull()
  })
})
