import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import AdminApprovePage from './AdminApprovePage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))
const refreshPendingCount = vi.fn()
vi.mock('@/layouts/AdminContext', () => ({
  useAdmin: () => ({ pendingCount: 0, refreshPendingCount }),
}))

const one = [{ id: 4, date: '2026-10-20 10:00', name: '김철수', student_id: '20231111', items: '우산' }]
const two = [
  { id: 1, date: '2026-10-20 10:00', name: '김철수', student_id: '20231111', items: '우산' },
  { id: 2, date: '2026-10-20 11:00', name: '이영희', student_id: '20241111', items: '보조배터리' },
]

function setup(rows) {
  axios.get.mockResolvedValue({ data: { data: rows } })
  axios.post.mockResolvedValue({ data: { status: 'success' } })
  return render(<MemoryRouter><AdminApprovePage /></MemoryRouter>)
}

describe('AdminApprovePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    refreshPendingCount.mockClear()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('approve posts handler', async () => {
    setup(one)
    const user = userEvent.setup()
    await user.click((await screen.findAllByRole('button', { name: '승인' }))[0])
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    await user.type(screen.getByPlaceholderText('담당자 이름'), '홍길동')
    await user.click(screen.getByRole('button', { name: '확인' }))
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/admin/approve', { id: 4, handler: '홍길동' }))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('승인 처리되었습니다.'))
    await waitFor(() => expect(refreshPendingCount).toHaveBeenCalledTimes(1))
  })

  it('reject confirm', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    setup(one)
    const user = userEvent.setup()
    await user.click((await screen.findAllByRole('button', { name: '삭제' }))[0])
    expect(confirm).toHaveBeenCalledWith('정말 이 신청을 삭제(거절)하시겠습니까?')
    expect(axios.post).not.toHaveBeenCalled()
    confirm.mockReturnValue(true)
    await user.click(screen.getAllByRole('button', { name: '삭제' })[0])
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/admin/reject', { id: 4 }))
    await waitFor(() => expect(refreshPendingCount).toHaveBeenCalledTimes(1))
  })

  it('dialog esc closes', async () => {
    setup(one)
    const user = userEvent.setup()
    await user.click((await screen.findAllByRole('button', { name: '승인' }))[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('search filter kept', async () => {
    setup(two)
    const user = userEvent.setup()
    await screen.findAllByText('김철수')
    await user.type(screen.getByPlaceholderText('이름 또는 학번으로 검색'), '2024')
    expect(screen.getAllByText('이영희').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('김철수')).toHaveLength(0)
  })
})
