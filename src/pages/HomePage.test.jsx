import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import dayjs from '@/lib/dayjs'
import HomePage from './HomePage'

vi.mock('axios')
const flags = vi.hoisted(() => ({ RENTAL_ENABLED: true }))
vi.mock('@/config/features', () => ({
  get RENTAL_ENABLED() {
    return flags.RENTAL_ENABLED
  },
}))
vi.mock('@/components/DomeGallery', () => ({ default: () => <div data-testid="dome" /> }))
vi.mock('@/components/FloatingSNS', () => ({ default: () => null }))
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const today = dayjs().tz().format('YYYY-MM-DD')
const notices = [
  { id: 1, title: '고정 공지', date: '2020-01-01', fixed: true },
  { id: 2, title: '오늘 공지', date: today, fixed: false },
]

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )

const SCHOOL = [
  ['학교 홈페이지', 'https://www.catholic.ac.kr'],
  ['학사일정', 'https://www.catholic.ac.kr/ko/support/calendar2024_list.do'],
  ['트리니티', 'https://uportal.catholic.ac.kr'],
  ['사이버캠퍼스', 'https://e-cyber.catholic.ac.kr'],
  ['공결허가원', 'https://www.catholic.ac.kr/ko/support/absence_notification.do'],
]

describe('HomePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    flags.RENTAL_ENABLED = true
    axios.get.mockImplementation((url) => {
      if (url === '/api/notices') return Promise.resolve({ data: notices })
      return Promise.resolve({ data: [] })
    })
  })

  it('hero background gallery is inert and hidden from assistive tech', async () => {
    const { container } = renderHome()
    await screen.findByText('오늘 공지')
    const bg = container.querySelector('.hero-background')
    expect(bg).not.toBeNull()
    expect(bg).toHaveAttribute('inert')
    expect(bg).toHaveAttribute('aria-hidden', 'true')
  })

  it('hero quick actions', async () => {
    renderHome()
    await screen.findByText('오늘 공지')
    expect(screen.getByRole('link', { name: /대여 신청/ })).toHaveAttribute('href', '/borrow')
    expect(screen.getByRole('link', { name: /대여 확인/ })).toHaveAttribute('href', '/check')
    expect(screen.getByRole('link', { name: /성심지도/ })).toHaveAttribute('href', '/campusmap')
  })

  it('school links kept', async () => {
    renderHome()
    await screen.findByText('오늘 공지')
    SCHOOL.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    })
  })

  it('notice badges', async () => {
    renderHome()
    const pinned = (await screen.findByText('고정 공지')).closest('li')
    expect(within(pinned).getByText('고정')).toBeInTheDocument()
    const fresh = screen.getByText('오늘 공지').closest('li')
    expect(within(fresh).getByText('NEW')).toBeInTheDocument()
  })

  it('maintenance view', async () => {
    axios.get.mockImplementation((url) =>
      url === '/api/notices' ? Promise.reject(new Error('down')) : Promise.resolve({ data: [] })
    )
    renderHome()
    await waitFor(() => expect(screen.getByText('여정은 지금 점검 중!')).toBeInTheDocument())
    SCHOOL.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    })
    expect(screen.queryByTestId('dome')).not.toBeInTheDocument()
  })

  it('rental disabled: 대여 신청 quick action is not a link and aria-disabled', async () => {
    flags.RENTAL_ENABLED = false
    const { container } = renderHome()
    await screen.findByText('오늘 공지')
    expect(screen.queryByRole('link', { name: /대여 신청/ })).not.toBeInTheDocument()
    expect(container.querySelector('a[href="/borrow"]')).toBeNull()
    const action = screen.getByText('대여 신청').closest('.hero-action')
    expect(action.tagName).not.toBe('A')
    expect(action).toHaveAttribute('aria-disabled', 'true')
    expect(action).toHaveAttribute('title', '대여 신청은 현재 이용할 수 없습니다.')
    expect(within(action).getByText('현재 이용할 수 없습니다')).toBeInTheDocument()
    // 나머지 바로가기는 그대로
    expect(screen.getByRole('link', { name: /대여 확인/ })).toHaveAttribute('href', '/check')
    expect(screen.getByRole('link', { name: /성심지도/ })).toHaveAttribute('href', '/campusmap')
  })
})
