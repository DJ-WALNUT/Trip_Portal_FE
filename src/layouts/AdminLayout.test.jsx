import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import { useEffect } from 'react'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AdminLayout from './AdminLayout'

const HERE = dirname(fileURLToPath(import.meta.url))

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({
  default: (p) => <span data-icon={p.name} data-state={p.state} />,
}))

function Where() {
  const l = useLocation()
  return <div data-testid="where">{l.pathname}</div>
}

function setup(path = '/admin/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/*" element={<div>page</div>} />
        </Route>
        <Route path="/" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

const reqs = (n) => ({ data: { status: 'success', data: Array.from({ length: n }, (_, i) => ({ id: i })) } })

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('adminRole', 'master')
  axios.get.mockResolvedValue(reqs(0))
  axios.post.mockResolvedValue({})
})
afterEach(() => vi.restoreAllMocks())

describe('AdminLayout', () => {
  it('shows the 여정 관리자 logo text in the mobile topbar', () => {
    const { container } = setup()
    const topbar = container.querySelector('.admin-topbar')
    expect(within(topbar).getByText('여정 관리자')).toBeInTheDocument()
  })

  it('shows pending badge', async () => {
    axios.get.mockResolvedValue(reqs(3))
    setup()
    const link = (await screen.findAllByRole('link', { name: /대여 승인/ }))[0]
    await waitFor(() => expect(within(link).getByText('3')).toBeTruthy())
    expect(link.querySelector('[data-icon="bell"]').dataset.state).toBe('unread')
  })

  it('shows no badge and idle bell for zero', async () => {
    setup()
    const link = (await screen.findAllByRole('link', { name: /대여 승인/ }))[0]
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/admin/requests'))
    expect(within(link).queryByText('0')).toBeNull()
    expect(link.querySelector('[data-icon="bell"]').dataset.state).toBe('idle')
  })

  it('collapse persists', () => {
    const { unmount } = setup()
    fireEvent.click(screen.getByRole('button', { name: '사이드바 접기' }))
    expect(localStorage.getItem('adminSidebarCollapsed')).toBe('true')
    expect(screen.getByRole('button', { name: '사이드바 펼치기' })).toBeTruthy()
    unmount()
    setup()
    expect(screen.getByRole('button', { name: '사이드바 펼치기' })).toBeTruthy()
  })

  it('storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    setup()
    expect(screen.getByRole('button', { name: '사이드바 접기' })).toBeTruthy()
  })

  it('drawer closes on Esc and navigation', () => {
    const { container } = setup()
    const drawer = () => container.querySelector('[data-drawer]')
    expect(drawer().dataset.drawer).toBe('closed')
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
    expect(drawer().dataset.drawer).toBe('open')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(drawer().dataset.drawer).toBe('closed')
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
    fireEvent.click(within(drawer()).getByRole('link', { name: /반납 관리/ }))
    expect(drawer().dataset.drawer).toBe('closed')
  })

  it('logout keeps original flow', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    localStorage.setItem('isAdmin', 'true')
    setup()
    fireEvent.click(screen.getAllByRole('button', { name: /로그아웃/ })[0])
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/'))
    expect(axios.post).toHaveBeenCalledWith('/api/admin/logout')
    expect(localStorage.getItem('isAdmin')).toBeNull()
    expect(localStorage.getItem('adminRole')).toBeNull()
    expect(alertSpy).toHaveBeenCalledWith('로그아웃 되었습니다.')
  })

  it('does not reopen drawer when returning to a previous path', () => {
    const navRef = { current: null }
    function Grab() {
      const navigate = useNavigate()
      useEffect(() => {
        navRef.current = navigate
      })
      return null
    }
    const { container } = render(
      <MemoryRouter initialEntries={['/admin/notices']}>
        <Grab />
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin/*" element={<div>page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const drawer = () => container.querySelector('[data-drawer]')
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
    expect(drawer().dataset.drawer).toBe('open')
    fireEvent.click(within(drawer()).getByRole('link', { name: /반납 관리/ }))
    expect(drawer().dataset.drawer).toBe('closed')
    act(() => navRef.current(-1))
    expect(drawer().dataset.drawer).toBe('closed')
  })

  it('hides closed off-canvas sidebar from focus via CSS visibility', () => {
    const css = readFileSync(resolve(HERE, 'AdminLayout.css'), 'utf-8')
    expect(css).toMatch(/\.admin-sidebar\s*\{[^}]*visibility:\s*hidden/)
    expect(css).toMatch(/data-drawer="open"\]\s*\.admin-sidebar\s*\{[^}]*visibility:\s*visible/)
    const desktop = css.slice(css.indexOf('@media (min-width: 1024px)'))
    expect(desktop).toMatch(/\.admin-sidebar\s*\{[^}]*visibility:\s*visible/)
  })
})
