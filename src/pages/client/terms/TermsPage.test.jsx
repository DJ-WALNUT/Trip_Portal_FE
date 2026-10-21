import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TermsPage from './TermsPage'

describe('TermsPage', () => {
  it('제목을 렌더링한다', () => {
    vi.stubGlobal('scrollTo', () => {})
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ text: () => Promise.resolve('# 이용약관\n\n본문') })))
    render(<TermsPage />)
    expect(screen.getByRole('heading', { level: 1, name: '이용약관' })).toBeInTheDocument()
  })
})
