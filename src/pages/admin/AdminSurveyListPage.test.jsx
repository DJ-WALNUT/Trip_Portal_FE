import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import AdminSurveyListPage from './AdminSurveyListPage'

vi.mock('axios')

const rows = [
  { id: 1, title: '공개 설문', is_public: true, is_closed: false, deadline: null, date: '2026-11-01', views: 3 },
  { id: 2, title: '숨긴 설문', is_public: false, is_closed: true, deadline: '2026-01-01', date: '2026-10-01', views: 0 },
]
const setup = () => render(<MemoryRouter><AdminSurveyListPage /></MemoryRouter>)

describe('AdminSurveyListPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'master')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    axios.get.mockResolvedValue({ data: rows })
  })

  it('loads including private posts and shows status badges', async () => {
    const { container } = setup()
    expect((await screen.findAllByText('숨긴 설문')).length).toBeGreaterThan(0)
    expect(axios.get).toHaveBeenCalledWith('/api/surveys', { params: { include_private: 'true' } })
    expect(screen.getAllByText('미공개').length).toBeGreaterThan(0)
    expect(screen.getAllByText('마감').length).toBeGreaterThan(0)
    expect(container.querySelector('[data-private="true"]')).not.toBeNull()
    expect(screen.getByRole('link', { name: /새 설문 등록/ })).toHaveAttribute('href', '/admin/surveys/write')
  })

  it('master can delete; the row disappears', async () => {
    axios.delete.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    setup()
    await user.click((await screen.findAllByRole('button', { name: '공개 설문 삭제' }))[0])
    expect(window.confirm).toHaveBeenCalled()
    expect(axios.delete).toHaveBeenCalledWith('/api/surveys/1')
    await waitFor(() => expect(screen.queryByText('공개 설문')).toBeNull())
  })

  it('declining the confirm deletes nothing', async () => {
    window.confirm.mockImplementation(() => false)
    const user = userEvent.setup()
    setup()
    await user.click((await screen.findAllByRole('button', { name: '공개 설문 삭제' }))[0])
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('sub admin sees edit but not delete', async () => {
    localStorage.setItem('adminRole', 'sub')
    setup()
    expect((await screen.findAllByRole('button', { name: '공개 설문 수정' })).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: '공개 설문 삭제' })).toBeNull()
  })
})
