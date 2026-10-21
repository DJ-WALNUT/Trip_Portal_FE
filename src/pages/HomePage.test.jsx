import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import dayjs from '@/lib/dayjs'
import HomePage from './HomePage'
import { setSiteInfo, resetSiteInfo } from '@/test/mockSiteInfo'

vi.mock('axios')
vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule))
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
    resetSiteInfo()
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

  const TWO = [
    { label: '링크A', url: 'https://a.example.com' },
    { label: '링크B', url: 'https://b.example.com' },
  ]

  it('school links come from links.school', async () => {
    setSiteInfo({ 'links.school': TWO })
    renderHome()
    await screen.findByText('오늘 공지')
    const nav = screen.getByRole('navigation', { name: '학교 바로가기' })
    expect(within(nav).getAllByRole('link')).toHaveLength(2)
    expect(within(nav).getByRole('link', { name: '링크B' })).toHaveAttribute('href', 'https://b.example.com')
  })

  it('hero text and instagram id come from site info', async () => {
    setSiteInfo({ 'home.hero_title': '새 제목', 'home.hero_sub': '새 부제', 'sns.instagram': 'my.insta' })
    renderHome()
    await screen.findByText('오늘 공지')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('새 제목')
    expect(screen.getByText('새 부제')).toBeInTheDocument()
    expect(screen.getByText('@my.insta')).toBeInTheDocument()
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

  it('maintenance view uses site info for school links and notice text', async () => {
    setSiteInfo({
      'links.school': TWO,
      'maintenance.notice': '점검 문구1\n점검 문구2',
      'maintenance.available': '가능 서비스A\n가능 서비스B',
    })
    axios.get.mockImplementation((url) =>
      url === '/api/notices' ? Promise.reject(new Error('down')) : Promise.resolve({ data: [] })
    )
    renderHome()
    await waitFor(() => expect(screen.getByText('여정은 지금 점검 중!')).toBeInTheDocument())
    const nav = screen.getByRole('navigation', { name: '학교 바로가기' })
    expect(within(nav).getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText(/점검 문구1/)).toBeInTheDocument()
    expect(screen.getByText(/가능 서비스B/)).toBeInTheDocument()
  })

  it('rental disabled: 대여 신청 quick action is not a link and aria-disabled', async () => {
    setSiteInfo({ 'rental.enabled': false })
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
