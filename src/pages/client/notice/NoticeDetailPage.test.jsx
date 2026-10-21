import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import NoticeDetailPage from './NoticeDetailPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({
  default: (p) => <span data-icon={p.name} />,
}))

const base = {
  id: 7, title: '제목', author: '학생회', date: '2026-10-20 09:00:00', views: 3,
  content: '본문', files: [],
}

async function setup(notice) {
  axios.get.mockResolvedValue({ data: { ...base, ...notice } })
  render(
    <MemoryRouter initialEntries={['/notices/7']}>
      <Routes><Route path="/notices/:id" element={<NoticeDetailPage />} /></Routes>
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { name: '제목' })
}

beforeEach(() => { vi.clearAllMocks() })

describe('NoticeDetailPage', () => {
  it('increments views once', async () => {
    await setup({})
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('/api/notices/7', { params: { increment: 'true' } })
  })

  it('attachments collapsed by default', async () => {
    await setup({ files: [{ id: 1, filename: 'a.pdf' }, { id: 2, filename: 'b.hwp' }] })
    const btn = screen.getByRole('button', { name: /첨부파일 2개/ })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/api/notices/download/7/a.pdf')
    expect(links[1]).toHaveAttribute('href', '/api/notices/download/7/b.hwp')
    expect(screen.getByText('PDF')).toBeInTheDocument()
  })

  it('no files text', async () => {
    await setup({ files: [] })
    expect(screen.getByText('첨부파일 없음')).toBeInTheDocument()
  })

  it('auto links urls', async () => {
    await setup({ content: '참고 https://a.b/c' })
    expect(screen.getByRole('link', { name: 'https://a.b/c' })).toHaveAttribute('href', 'https://a.b/c')
  })
})
