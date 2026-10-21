import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import AdminNoticeWritePage from './AdminNoticeWritePage'

vi.mock('axios')

function setup(path = '/admin/notices/write') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/notices/write" element={<AdminNoticeWritePage />} />
        <Route path="/admin/notices/edit/:id" element={<AdminNoticeWritePage />} />
        <Route path="/admin/notices" element={<p>목록 페이지</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminNoticeWritePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'master')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
  })

  it('drop adds files like input', () => {
    const { container } = setup()
    const dropzone = container.querySelector('.dropzone')
    const file = new File(['a'], 'a.pdf')
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } })
    expect(screen.getByText('a.pdf')).toBeInTheDocument()
  })

  it('fixed toggle maps to formData', async () => {
    axios.post.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('switch'))
    await user.type(screen.getByLabelText('제목'), '제목')
    await user.type(screen.getByLabelText('내용'), '내용')
    await user.click(screen.getByRole('button', { name: '작성 완료' }))
    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    const fd = axios.post.mock.calls[0][1]
    expect(axios.post.mock.calls[0][0]).toBe('/api/notices')
    expect(fd.get('fixed')).toBe('true')
    expect(fd.get('is_public')).toBe('false')
  })

  it('validation alert kept', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: '작성 완료' }))
    expect(window.alert).toHaveBeenCalledWith('제목과 내용은 필수입니다.')
    expect(axios.post).not.toHaveBeenCalled()
  })
})
