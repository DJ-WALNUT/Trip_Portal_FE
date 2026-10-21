import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import CheckPage from './CheckPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({
  default: (p) => <span data-icon={p.name} data-state={p.state} />,
}))

const OK = {
  status: 'success',
  user_info: { name: '김철수', student_id: '2023' },
  data: [
    { items: '우산', date: '2026-10-21 10:00:00', status: '신청', due_date: '2026-10-25' },
    { items: '계산기', date: '2026-10-10 10:00:00', status: '미반납', due_date: '2026-10-14' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime('2026-10-21T03:00:00Z')
})
afterEach(() => { vi.useRealTimers() })

async function submit(data) {
  axios.post.mockResolvedValue({ data })
  render(<MemoryRouter><CheckPage /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('이름'), { target: { value: '김철수' } })
  fireEvent.change(screen.getByLabelText('학번'), { target: { value: '2023' } })
  fireEvent.click(screen.getByRole('button', { name: '확인하기' }))
}

describe('CheckPage', () => {
  it('renders records as cards with tones', async () => {
    await submit(OK)
    expect(await screen.findByText('김철수님의 기록')).toBeInTheDocument()
    expect(screen.getByText('신청').className).toContain('badge--pending')
    expect(screen.getByText('미반납').className).toContain('badge--overdue')
  })

  it('fail message', async () => {
    await submit({ status: 'fail', message: '기록이 없습니다.' })
    expect(await screen.findByText('기록이 없습니다.')).toBeInTheDocument()
  })

  it('posts same body', async () => {
    await submit(OK)
    await screen.findByText('김철수님의 기록')
    expect(axios.post).toHaveBeenCalledWith('/api/check', { name: '김철수', student_id: '2023' })
  })
})
