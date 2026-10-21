import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import axios from 'axios'
import AdminReturnPage from './AdminReturnPage'
import { setSiteInfo, resetSiteInfo } from '@/test/mockSiteInfo'

vi.mock('axios')
vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule))
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const HERE = dirname(fileURLToPath(import.meta.url))

// 오늘(서울) = 2026-10-21. 기한 = 대여일 + 4일, 연체는 기한 다음 날부터.
const rows = [
  { id: 1, date: '2026-10-16 10:00', name: '연체자', student_id: '1', phone: '010', items: '우산' }, // 기한 10-20 → 연체
  { id: 2, date: '2026-10-17 10:00', name: '기한당일', student_id: '2', phone: '010', items: '우산' }, // 기한 10-21 → 아직 아님
  { id: 3, date: '2026-10-20 10:00', name: '정상', student_id: '3', phone: '010', items: '우산' },
]

describe('AdminReturnPage overdue rows', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-21T03:00:00Z'))
    localStorage.setItem('isAdmin', 'true')
    axios.get.mockResolvedValue({ data: { data: rows } })
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    resetSiteInfo()
  })

  it('rental.return_days=10: a rental 5 days old is not overdue and the due-date label follows', async () => {
    setSiteInfo({ 'rental.return_days': 10 })
    const { container } = render(<MemoryRouter><AdminReturnPage /></MemoryRouter>)
    await screen.findAllByText('연체자')
    expect(container.querySelectorAll('tr[data-overdue="true"]')).toHaveLength(0)
    expect(screen.getByText(/10일 전/)).toBeInTheDocument()
    expect(container.querySelector('.borrow-dates__due')).toHaveTextContent('2026-10-11')
  })

  it('tints only rows overdue from the day after due (table row and card)', async () => {
    const { container } = render(<MemoryRouter><AdminReturnPage /></MemoryRouter>)
    await screen.findAllByText('연체자')
    const trs = [...container.querySelectorAll('tr[data-overdue="true"]')]
    const lis = [...container.querySelectorAll('li[data-overdue="true"]')]
    expect(trs).toHaveLength(1)
    expect(lis).toHaveLength(1)
    expect(trs[0].textContent).toContain('연체자')
    expect(lis[0].textContent).toContain('연체자')
    const red = [...container.querySelectorAll('.borrow-overdue')].map((el) => el.textContent)
    expect(new Set(red)).toEqual(new Set(['2026-10-16 10:00']))
  })

  it('styles data-overdue rows for both table and card with the overdue tone', () => {
    const css = readFileSync(resolve(HERE, 'AdminBorrow.css'), 'utf-8')
    expect(css).toMatch(/tr\[data-overdue="true"\]\s*>\s*td[^{]*\{[^}]*var\(--tone-overdue-bg\)/)
    expect(css).toMatch(/li\[data-overdue="true"\][^{]*\{[^}]*var\(--tone-overdue-bg\)/)
  })
})
