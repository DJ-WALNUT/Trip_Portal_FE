import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import SurveyDetailPage from './SurveyDetailPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const survey = {
  id: 7, title: '학식 만족도 조사', content: '참여 부탁드려요\n문의 https://example.com/help 로',
  link_url: 'https://forms.example.com/7', deadline: '2099-12-31', duration: '3분', reward: '기프티콘',
  author: '여정 학생회', views: 5, is_public: true, date: '2026-11-01', is_closed: false,
}

const setup = () => render(
  <MemoryRouter initialEntries={['/surveys/7']}>
    <Routes>
      <Route path="/surveys/:id" element={<SurveyDetailPage />} />
      <Route path="/surveys" element={<p>목록 페이지</p>} />
    </Routes>
  </MemoryRouter>
)

describe('SurveyDetailPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('fetches once with increment and puts the CTA between the title and the body', async () => {
    axios.get.mockResolvedValue({ data: survey })
    setup()
    const title = await screen.findByRole('heading', { level: 1, name: '학식 만족도 조사' })
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('/api/surveys/7', { params: { increment: 'true' } })
    const cta = screen.getByRole('link', { name: '설문조사 하러가기' })
    expect(cta).toHaveAttribute('href', 'https://forms.example.com/7')
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
    const body = screen.getByText(/참여 부탁드려요/)
    expect(title.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(cta.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('3분')).toBeInTheDocument()
    expect(screen.getByText('기프티콘')).toBeInTheDocument()
    expect(screen.getByText('~ 2099.12.31')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://example.com/help' })).toHaveAttribute('target', '_blank')
  })

  it('closed survey shows a disabled button and no survey link', async () => {
    axios.get.mockResolvedValue({ data: { ...survey, deadline: '2026-01-01', is_closed: true } })
    setup()
    expect(await screen.findByRole('button', { name: '마감된 설문입니다' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: '설문조사 하러가기' })).toBeNull()
  })

  it('no deadline shows 상시; unsafe link is never rendered', async () => {
    axios.get.mockResolvedValue({ data: { ...survey, deadline: null, link_url: 'javascript:alert(1)' } })
    const { container } = setup()
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByText('상시').length).toBeGreaterThan(0)
    expect(container.querySelector('a[href^="javascript"]')).toBeNull()
  })

  it('missing survey shows a notice with a way back', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } })
    setup()
    expect(await screen.findByText('존재하지 않거나 삭제된 설문조사입니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '목록으로' })).toBeInTheDocument()
  })
})
