import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

import DepartmentPage from './DepartmentPage'

describe('DepartmentPage', () => {
  it('renders the page title with graduation icon', () => {
    const { container } = render(<DepartmentPage />)
    expect(screen.getByRole('heading', { level: 1, name: '단과대 및 학과' })).toBeTruthy()
    expect(container.querySelector('[data-icon="graduation"]')).toBeTruthy()
  })

  it('links the newly added instagram accounts', () => {
    render(<DepartmentPage />)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('https://instagram.com/cuk_biologics')
    expect(hrefs).toContain('https://instagram.com/cuk_aibme')
  })
})
