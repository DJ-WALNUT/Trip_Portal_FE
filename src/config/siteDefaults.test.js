import { describe, it, expect } from 'vitest'
import { DEFAULT_SITE_INFO } from './siteDefaults'

const KEYS = [
  'contact.address', 'contact.room', 'contact.email', 'contact.manager',
  'sns.instagram', 'sns.linktree', 'sns.kakao',
  'links.school', 'links.external',
  'home.hero_sub', 'home.hero_title',
  'footer.copyright',
  'maintenance.notice', 'maintenance.available',
  'rental.enabled', 'rental.return_days', 'rental.cancel_notice',
]

describe('DEFAULT_SITE_INFO', () => {
  it('has exactly the 17 spec keys in order', () => {
    expect(Object.keys(DEFAULT_SITE_INFO)).toEqual(KEYS)
  })
  it('links.school items have label and url', () => {
    expect(DEFAULT_SITE_INFO['links.school']).toHaveLength(5)
    for (const l of DEFAULT_SITE_INFO['links.school']) {
      expect(typeof l.label).toBe('string')
      expect(l.url).toMatch(/^https:\/\//)
    }
  })
})
