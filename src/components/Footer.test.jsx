import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'
import { setSiteInfo, resetSiteInfo } from '@/test/mockSiteInfo'

vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule))

const setup = () => render(<MemoryRouter><Footer /></MemoryRouter>)

describe('Footer', () => {
  beforeEach(resetSiteInfo)

  it('renders manager, email, address and copyright from site info', () => {
    setSiteInfo({
      'contact.manager': '홍길동',
      'contact.email': 'a@b.cd',
      'contact.address': '테스트 주소 1',
      'footer.copyright': '저작권 1줄\n저작권 2줄',
    })
    const { container } = setup()
    const p = container.querySelector('.footer-container p')
    expect(p).toHaveTextContent('홈페이지 운영 책임자 : 홍길동')
    expect(p).toHaveTextContent('E Mail : a@b.cd')
    expect(p).toHaveTextContent('테스트 주소 1')
    expect(p).toHaveTextContent('저작권 1줄')
    expect(p).toHaveTextContent('저작권 2줄')
  })

  it('keeps legal links', () => {
    setup()
    expect(screen.getByRole('link', { name: '이용약관' })).toHaveAttribute('href', '/terms')
  })
})
