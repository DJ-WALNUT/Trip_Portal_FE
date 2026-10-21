import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FacilityModal from './FacilityModal'

const facility = { name: '입학처', loc: 'N201', desc: '설명' }

describe('FacilityModal', () => {
  it('close button has aria-label 닫기 and calls onClose', async () => {
    const onClose = vi.fn()
    render(<FacilityModal isOpen facility={facility} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Esc calls onClose', () => {
    const onClose = vi.fn()
    render(<FacilityModal isOpen facility={facility} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when closed', () => {
    const { container } = render(<FacilityModal isOpen={false} facility={facility} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
