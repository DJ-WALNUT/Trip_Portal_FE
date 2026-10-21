import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import NoticePage from './NoticePage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({
  default: (p) => <span data-icon={p.name} />,
}))

const make = (n) => Array.from({ length: n }, (_, i) => ({
  id: i + 1, title: `공지 ${i + 1}`, content: `내용 ${i + 1}`, author: '학생회',
  date: '2026-09-01 10:00:00', views: i, fixed: false, files: [],
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime('2026-10-21T03:00:00Z')
})
afterEach(() => { vi.useRealTimers() })

async function setup(list) {
  axios.get.mockResolvedValue({ data: list })
  const { container } = render(<MemoryRouter><NoticePage /></MemoryRouter>)
  await waitFor(() => expect(container.querySelector('.rtable__table')).toBeTruthy())
  return container.querySelector('.rtable__table')
}
const titles = (table) => within(table).getAllByRole('link').map((a) => a.textContent)

describe('NoticePage', () => {
  it('paginates 10 per page', async () => {
    const table = await setup(make(12))
    expect(titles(table)).toHaveLength(10)
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(titles(table)).toHaveLength(2)
  })

  it('search by title resets to page 1', async () => {
    const table = await setup(make(12))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.change(screen.getByPlaceholderText('검색어를 입력하세요'), { target: { value: '공지 1' } })
    fireEvent.click(screen.getByRole('button', { name: '검색' }))
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
    expect(titles(table).every((t) => t.includes('공지 1'))).toBe(true)
    fireEvent.change(screen.getByPlaceholderText('검색어를 입력하세요'), { target: { value: 'zzz' } })
    fireEvent.click(screen.getByRole('button', { name: '검색' }))
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
  })

  it('badges and attachment count', async () => {
    const list = make(3)
    list[0].fixed = true
    list[1].date = '2026-10-20 09:00:00'
    list[2].files = [{ id: 1, filename: 'a.pdf' }, { id: 2, filename: 'b.pdf' }]
    const table = await setup(list)
    expect(within(table).getByText('고정')).toBeInTheDocument()
    expect(within(table).getAllByText('NEW')).toHaveLength(1)
    const att = within(table).getByLabelText('첨부파일 2개')
    expect(att).toHaveTextContent('2')
  })
})
