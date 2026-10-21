import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import AdminNoticeListPage from './AdminNoticeListPage'

vi.mock('axios')

const longTitle = '아주 긴 공지사항 제목 '.repeat(30).trim()

describe('AdminNoticeListPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'master')
    axios.get.mockResolvedValue({
      data: [{ id: 1, title: longTitle, fixed: true, is_public: true, author: '관리자', date: '2026-10-20', views: 3 }],
    })
  })

  it('keeps the full title in a title attribute and the badge visible', async () => {
    render(<MemoryRouter><AdminNoticeListPage /></MemoryRouter>)
    const texts = await screen.findAllByTitle(longTitle)
    expect(texts.length).toBeGreaterThan(0)
    texts.forEach((el) => {
      expect(el.className).toContain('notice-title__text')
      expect(el.textContent).toBe(longTitle)
    })
    expect(screen.getAllByText('고정').length).toBeGreaterThan(0)
  })
})
