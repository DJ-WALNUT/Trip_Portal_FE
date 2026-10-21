import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import AdminDashboardPage from './AdminDashboardPage'

vi.mock('axios')
vi.mock('@/layouts/AdminContext', () => ({
  useAdmin: () => ({ pendingCount: 3, refreshPendingCount: vi.fn() }),
}))

const logs = [
  { 대여시각: '2026-10-20 10:00:00', 이름: '김철수', 학번: '20201111', 대여물품: '우산', 대여현황: '신청' },
  { 대여시각: '2026-10-19 10:00:00', 이름: '이영희', 학번: '20202222', 대여물품: '보조배터리', 대여현황: '반납완료' },
]

function setup() {
  axios.get.mockImplementation((url) => {
    if (url === '/api/admin/dashboard') return Promise.resolve({ data: { status: 'success', today_count: 12, recent_logs: logs } })
    if (url === '/api/admin/ongoing') return Promise.resolve({ data: { status: 'success', data: Array.from({ length: 8 }, (_, i) => ({ id: i })) } })
    if (url === '/api/system/snowfall') return Promise.resolve({ data: { status: 'success', enabled: false } })
    return Promise.reject(new Error(url))
  })
  return render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>)
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'master')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('stat cards link to the right pages', async () => {
    setup()
    const today = await screen.findByRole('link', { name: /금일 대여 12건/ })
    expect(today).toHaveAttribute('href', '/admin/borrow/log')
    await waitFor(() => expect(screen.getByRole('link', { name: /대여 중 8건/ })).toHaveAttribute('href', '/admin/borrow/return'))
    expect(screen.getByRole('link', { name: /승인 대기 3건/ })).toHaveAttribute('href', '/admin/borrow/approve')
  })

  it('snowfall toggle master only', async () => {
    localStorage.setItem('adminRole', 'sub')
    const { unmount } = setup()
    await screen.findByRole('link', { name: /금일 대여 12건/ })
    expect(screen.queryByRole('switch')).toBeNull()
    unmount()

    vi.resetAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    localStorage.setItem('adminRole', 'master')
    setup()
    const sw = await screen.findByRole('switch')
    axios.post.mockResolvedValue({ data: { status: 'success', enabled: true } })
    await userEvent.click(sw)
    expect(axios.post).toHaveBeenCalledWith('/api/admin/system/snowfall', { enabled: true })
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('눈송이 효과를 켰습니다.'))
  })

  it('recent logs show names and tone badges', async () => {
    setup()
    await screen.findByRole('link', { name: /금일 대여 12건/ })
    const table = document.querySelector('.rtable__table')
    expect(within(table).getByText('김철수')).toBeInTheDocument()
    expect(within(table).getByText('이영희')).toBeInTheDocument()
    expect(within(table).getByText('신청')).toHaveClass('badge--pending')
    expect(within(table).getByText('반납완료')).toHaveClass('badge--done')
  })
})
