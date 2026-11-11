import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import SurveyPage from './SurveyPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const base = { content: '내용', author: '여정 학생회', date: '2026-11-01', views: 0, is_public: true }
const open = { ...base, id: 1, title: '열린 설문', link_url: 'https://forms.example.com/1', deadline: null, duration: '3분', reward: '기프티콘', is_closed: false }
const closed = { ...base, id: 2, title: '끝난 설문', link_url: 'https://forms.example.com/2', deadline: '2026-01-01', duration: null, reward: null, is_closed: true }

async function setup(data) {
  axios.get.mockResolvedValue({ data })
  const utils = render(<MemoryRouter><SurveyPage /></MemoryRouter>)
  await waitFor(() => expect(utils.container.querySelector('.ui-spinner')).toBeNull())
  return utils
}

describe('SurveyPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('requests the public list and shows the concept copy', async () => {
    await setup([open])
    expect(axios.get).toHaveBeenCalledWith('/api/surveys')
    expect(screen.getByText('심심하세요? 설문조사 하실래요?')).toBeInTheDocument()
  })

  it('shows the registration guide with Instagram and Kakao channel links', async () => {
    await setup([])
    const insta = screen.getByRole('link', { name: '공과대학 인스타' })
    expect(insta).toHaveAttribute('href', 'https://www.instagram.com/cuk.engineering')
    expect(insta).toHaveAttribute('target', '_blank')
    const kakao = screen.getByRole('link', { name: '공과대학 카카오톡 채널' })
    expect(kakao).toHaveAttribute('href', 'https://pf.kakao.com/_xcyDGn')
    expect(kakao).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('open row: title links to detail, button opens the survey in a new tab, chips shown', async () => {
    const { container } = await setup([open, closed])
    const table = container.querySelector('.rtable__table')
    expect(within(table).getByRole('link', { name: '열린 설문' })).toHaveAttribute('href', '/surveys/1')
    const go = within(table).getAllByRole('link', { name: '설문조사 하러가기' })
    expect(go).toHaveLength(1)
    expect(go[0]).toHaveAttribute('href', 'https://forms.example.com/1')
    expect(go[0]).toHaveAttribute('target', '_blank')
    expect(go[0]).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(table).getByText('3분')).toBeInTheDocument()
    expect(within(table).getByText('기프티콘')).toBeInTheDocument()
    expect(within(table).getByText('상시')).toBeInTheDocument()
  })

  it('closed row has no survey link and is marked', async () => {
    const { container } = await setup([closed])
    const table = container.querySelector('.rtable__table')
    expect(within(table).queryByRole('link', { name: '설문조사 하러가기' })).toBeNull()
    expect(container.querySelector('[data-closed="true"]')).not.toBeNull()
    expect(within(table).getAllByText('마감').length).toBeGreaterThan(0)
  })

  it('never renders an unsafe link as a button', async () => {
    const { container } = await setup([{ ...open, link_url: 'javascript:alert(1)' }])
    expect(container.querySelector('a[href^="javascript"]')).toBeNull()
    expect(screen.queryByRole('link', { name: '설문조사 하러가기' })).toBeNull()
  })

  it('paginates 10 per page', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ ...open, id: i + 1, title: `설문 ${i + 1}` }))
    const { container } = await setup(many)
    const table = container.querySelector('.rtable__table')
    const count = () => within(table).getAllByRole('link', { name: '설문조사 하러가기' }).length
    expect(count()).toBe(10)
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(count()).toBe(2)
  })

  it('empty, failed and malformed responses', async () => {
    const first = await setup([])
    expect(screen.getByText('진행 중인 설문조사가 없습니다.')).toBeInTheDocument()
    first.unmount()

    const second = await setup('<html></html>')
    expect(screen.getByText('진행 중인 설문조사가 없습니다.')).toBeInTheDocument()
    second.unmount()

    axios.get.mockRejectedValue(new Error('down'))
    render(<MemoryRouter><SurveyPage /></MemoryRouter>)
    expect(await screen.findByText('설문조사를 불러오지 못했습니다.')).toBeInTheDocument()
  })
})
