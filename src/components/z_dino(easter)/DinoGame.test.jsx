import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DinoGame from './DinoGame'

describe('DinoGame', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', () => 0)
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  it('isOpen=false 이면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<DinoGame isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('닫기 버튼이 onClose 를 호출한다', () => {
    const onClose = vi.fn()
    render(<DinoGame isOpen onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Esc 키가 onClose 를 호출한다', () => {
    const onClose = vi.fn()
    render(<DinoGame isOpen onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
