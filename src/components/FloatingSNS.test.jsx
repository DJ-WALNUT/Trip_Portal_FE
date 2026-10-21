import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import FloatingSNS from './FloatingSNS'
import { instagramUrl } from '@/lib/siteInfo'
import { setSiteInfo, resetSiteInfo } from '@/test/mockSiteInfo'

vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule))

describe('FloatingSNS', () => {
  beforeEach(resetSiteInfo)

  it('links come from site info', () => {
    setSiteInfo({
      'sns.instagram': 'my.insta',
      'sns.linktree': 'https://linktr.ee/x',
      'sns.kakao': 'https://pf.kakao.com/x',
    })
    render(<FloatingSNS />)
    expect(screen.getByRole('link', { name: /인스타/ })).toHaveAttribute('href', instagramUrl('my.insta'))
    expect(screen.getByRole('link', { name: /링크트리/ })).toHaveAttribute('href', 'https://linktr.ee/x')
    expect(screen.getByRole('link', { name: /카카오톡/ })).toHaveAttribute('href', 'https://pf.kakao.com/x')
  })
})
