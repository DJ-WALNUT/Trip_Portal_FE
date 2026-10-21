import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import LucianIcon from './LucianIcon'


// jsdom has no Element.animate; stub the registering modules so only wrapper logic is tested.
vi.mock('@/vendor/lucian-icons/box.js', () => ({}))
vi.mock('@/vendor/lucian-icons/bell.js', () => ({}))

describe('LucianIcon', () => {
  it('renders custom element tag', () => {
    const { container } = render(<LucianIcon name="box" />)
    expect(container.querySelector('lucian-box')).not.toBeNull()
  })

  it('decorative by default', () => {
    const { container } = render(<LucianIcon name="box" />)
    expect(container.querySelector('lucian-box').getAttribute('aria-hidden')).toBe('true')
  })

  it('label makes it meaningful', () => {
    const { container } = render(<LucianIcon name="box" label="대여 완료" />)
    const el = container.querySelector('lucian-box')
    expect(el.hasAttribute('aria-hidden')).toBe(false)
    expect(el.getAttribute('label')).toBe('대여 완료')
  })

  it('state prop updates attribute', () => {
    const { container, rerender } = render(<LucianIcon name="bell" state="idle" />)
    rerender(<LucianIcon name="bell" state="unread" />)
    expect(container.querySelector('lucian-bell').getAttribute('state')).toBe('unread')
  })
})
