import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import AdminSurveyWritePage from './AdminSurveyWritePage'

vi.mock('axios')

const setup = (path = '/admin/surveys/write') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/admin/surveys/write" element={<AdminSurveyWritePage />} />
      <Route path="/admin/surveys/edit/:id" element={<AdminSurveyWritePage />} />
      <Route path="/admin/surveys" element={<p>목록 페이지</p>} />
    </Routes>
  </MemoryRouter>
)

async function fill(user, { title = '제목', link = 'https://forms.example.com/a', content = '내용' } = {}) {
  if (title) await user.type(screen.getByLabelText('제목'), title)
  if (link) await user.type(screen.getByLabelText('설문 링크'), link)
  if (content) await user.type(screen.getByLabelText('내용'), content)
}

describe('AdminSurveyWritePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'sub')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('posts trimmed JSON with defaults and returns to the list', async () => {
    axios.post.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    setup()
    expect(screen.getByRole('switch', { name: '공개' })).toBeChecked()
    await fill(user, { title: '  제목  ' })
    await user.type(screen.getByLabelText('예상 소요시간'), '3분')
    await user.click(screen.getByRole('button', { name: '등록' }))
    await screen.findByText('목록 페이지')
    expect(axios.post).toHaveBeenCalledWith('/api/surveys', {
      title: '제목', content: '내용', link_url: 'https://forms.example.com/a',
      deadline: '', duration: '3분', reward: '', is_public: true,
    })
  })

  it('blocks missing required fields and bad links before sending', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: '등록' }))
    expect(screen.getByRole('alert')).toHaveTextContent('제목, 설문 링크, 내용은 필수입니다.')
    await fill(user, { link: 'forms.example.com' })
    await user.click(screen.getByRole('button', { name: '등록' }))
    expect(screen.getByRole('alert')).toHaveTextContent('설문 링크는 http:// 또는 https://로 시작해야 합니다.')
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('shows the server error and keeps the input', async () => {
    axios.post.mockRejectedValue({ response: { status: 400, data: { error: '입력 길이를 초과했습니다.' } } })
    const user = userEvent.setup()
    setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: '등록' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('입력 길이를 초과했습니다.')
    expect(screen.getByLabelText('제목')).toHaveValue('제목')
    expect(screen.queryByText('목록 페이지')).toBeNull()
    expect(screen.getByRole('button', { name: '등록' })).toBeEnabled()
  })

  it('edit mode loads without counting a view, fills the form and PUTs', async () => {
    axios.get.mockResolvedValue({ data: {
      id: 3, title: '기존', content: '기존 내용', link_url: 'https://f.example.com/3',
      deadline: '2026-12-01', duration: null, reward: '기프티콘', is_public: false,
    } })
    axios.put.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    setup('/admin/surveys/edit/3')
    await waitFor(() => expect(screen.getByLabelText('제목')).toHaveValue('기존'))
    expect(axios.get).toHaveBeenCalledWith('/api/surveys/3', { params: { increment: 'false' } })
    expect(screen.getByLabelText('마감일')).toHaveValue('2026-12-01')
    expect(screen.getByLabelText('예상 소요시간')).toHaveValue('')
    expect(screen.getByRole('switch', { name: '공개' })).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: '수정 저장' }))
    await screen.findByText('목록 페이지')
    expect(axios.put.mock.calls[0][0]).toBe('/api/surveys/3')
    expect(axios.put.mock.calls[0][1]).toMatchObject({ title: '기존', deadline: '2026-12-01', duration: '', is_public: false })
  })

  it('a slow save cannot be submitted twice', async () => {
    let resolve
    axios.post.mockReturnValue(new Promise((r) => { resolve = r }))
    const user = userEvent.setup()
    setup()
    await fill(user)
    const submit = screen.getByRole('button', { name: '등록' })
    await user.click(submit)
    expect(submit).toBeDisabled()
    await user.click(submit)
    expect(axios.post).toHaveBeenCalledTimes(1)
    resolve({ data: {} })
    await screen.findByText('목록 페이지')
  })
})
