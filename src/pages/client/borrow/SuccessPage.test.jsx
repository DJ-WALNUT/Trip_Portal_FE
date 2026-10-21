import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SuccessPage from './SuccessPage'

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
  it('redirects without state', () => {
    setup(undefined)
    expect(screen.getByText('메인 페이지')).toBeInTheDocument()
  })

  it('shows info and check link', () => {
    setup({ items: ['우산'], date: '2026-10-21', returnDate: '2026-10-25' })
    expect(screen.getByText('대여 신청이 완료되었습니다!')).toBeInTheDocument()
    expect(screen.getAllByText(/공대방\(N502\)/).length).toBeGreaterThan(0)
    expect(screen.getByText('2026-10-25')).toBeInTheDocument()
    expect(screen.getByText('우산')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '신청 확인하기' })).toHaveAttribute('href', '/check')
    expect(screen.getByRole('link', { name: '메인으로 돌아가기' })).toHaveAttribute('href', '/')
  })
})
