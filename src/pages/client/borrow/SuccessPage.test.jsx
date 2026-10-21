import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SuccessPage from './SuccessPage'
import { setSiteInfo, resetSiteInfo } from '@/test/mockSiteInfo'

vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule))

vi.mock('@/components/icons/LucianIcon', () => ({
  default: (p) => <span data-icon={p.name} data-state={p.state} />,
}))

function setup(state) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/success', state }]}>
      <Routes>
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/" element={<div>메인 페이지</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SuccessPage', () => {
  beforeEach(resetSiteInfo)

  it('uses contact.room and rental.cancel_notice from site info', () => {
    setSiteInfo({ 'contact.room': '공대방(N999)', 'rental.cancel_notice': '자동 취소 안내A\n안내B' })
    setup({ items: ['우산'], date: '2026-10-21', returnDate: '2026-10-25' })
    expect(screen.getAllByText(/공대방\(N999\)/).length).toBe(2)
    expect(screen.queryByText(/N507/)).toBeNull()
    expect(screen.getByText(/자동 취소 안내A/)).toBeInTheDocument()
    expect(screen.getByText(/안내B/)).toBeInTheDocument()
  })

  it('redirects without state', () => {
    setup(undefined)
    expect(screen.getByText('메인 페이지')).toBeInTheDocument()
  })

  it('shows info and check link', () => {
    setup({ items: ['우산'], date: '2026-10-21', returnDate: '2026-10-25' })
    expect(screen.getByText('대여 신청이 완료되었습니다!')).toBeInTheDocument()
    expect(screen.getAllByText(/공대방\(N507\)/).length).toBeGreaterThan(0)
    expect(screen.getByText('2026-10-25')).toBeInTheDocument()
    expect(screen.getByText('우산')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '신청 확인하기' })).toHaveAttribute('href', '/check')
    expect(screen.getByRole('link', { name: '메인으로 돌아가기' })).toHaveAttribute('href', '/')
  })
})
