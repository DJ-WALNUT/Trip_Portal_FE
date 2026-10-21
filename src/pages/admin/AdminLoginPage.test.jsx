import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import AdminLoginPage from './AdminLoginPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({
  default: (p) => <span data-testid="lucian" data-icon={p.name} data-state={p.state} />,
}))

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('keeps flow', async () => {
    axios.post.mockResolvedValue({ data: { status: 'success', role: 'master' } })
    render(<MemoryRouter><AdminLoginPage /></MemoryRouter>)
    expect(screen.getByTestId('lucian')).toHaveAttribute('data-state', 'locked')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'devmaster')
    await userEvent.click(screen.getByRole('button', { name: '로그인' }))
    expect(axios.post).toHaveBeenCalledWith('/api/admin/login', { password: 'devmaster' })
    await waitFor(() => expect(screen.getByTestId('lucian')).toHaveAttribute('data-state', 'unlocked'))
    expect(window.alert).toHaveBeenCalledWith('마스터 관리자님 환영합니다!')
    expect(localStorage.getItem('adminRole')).toBe('master')
  })

  it('alerts on wrong password', async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } })
    render(<MemoryRouter><AdminLoginPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText('비밀번호'), 'x')
    await userEvent.click(screen.getByRole('button', { name: '로그인' }))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('비밀번호가 틀렸습니다.'))
  })
})
