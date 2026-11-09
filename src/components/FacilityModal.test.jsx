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

  it('shows a floor plan for club rooms and labels the floor', () => {
    render(<FacilityModal isOpen facility={{ name: 'COMA', loc: '동방 19', desc: '' }} onClose={() => {}} />)
    expect(screen.getByRole('figure', { name: '소피이바라관 3층 평면도, 동방 19 위치' })).toBeInTheDocument()
    expect(screen.getByText('3층 · 동방 19')).toBeInTheDocument()
  })

  it('shows a floor plan for named rooms like 총동연', () => {
    render(<FacilityModal isOpen facility={{ name: '총동아리연합회실', loc: '총동연', desc: '' }} onClose={() => {}} />)
    expect(screen.getByRole('figure', { name: '소피이바라관 3층 평면도, 총동연 위치' })).toBeInTheDocument()
    expect(screen.getByText('3층 · 총동연')).toBeInTheDocument()
  })

  it('lets club rooms with a photo switch between floor plan and photo', async () => {
    render(<FacilityModal isOpen facility={{ name: '밴드실험', loc: '동방 37', imgUrl: '/api/campus/image/x.jpg' }} onClose={() => {}} />)
    expect(screen.getByRole('figure')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: '사진' }))
    expect(screen.getByRole('img', { name: '밴드실험' })).toBeInTheDocument()
    expect(screen.queryByRole('figure')).toBeNull()
  })

  it('keeps the photo area for ordinary facilities', () => {
    render(<FacilityModal isOpen facility={facility} onClose={() => {}} />)
    expect(screen.queryByRole('figure')).toBeNull()
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.getByText('이미지가 없습니다')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    const { container } = render(<FacilityModal isOpen={false} facility={facility} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
