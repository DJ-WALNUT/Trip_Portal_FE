import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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

// 기본값 문자열이 다른 소스에 하드코딩되지 않았는지 확인하는 가드.
// TeaserPage는 동결된 화면이라 제외한다.
describe('hard-coded site info guard', () => {
  const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..')  // jsdom의 URL은 fileURLToPath와 호환되지 않아 파일 경로부터 변환한다
  const MARKERS = [
    'N507', 'cukeng2026@gmail.com', 'cuk.engineering', 'linktr.ee/cuk_engineering',
    'pf.kakao.com/_xcyDGn', '2025saegil.cukeng.kr', 'calendar2024_list.do',
    'absence_notification.do', 'uportal.catholic.ac.kr', 'e-cyber.catholic.ac.kr',
    '제4대 공과대학 학생회', '변화를 새길, 우리의 여정!', '05:00 ~ 06:00', '김세호',
  ]
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = join(dir, e.name)
      return e.isDirectory() ? walk(p) : [p]
    })
  const files = walk(SRC)
    .map((p) => relative(SRC, p).split('\\').join('/'))
    .filter((p) => /\.(js|jsx)$/.test(p))
    .filter((p) => !/\.test\./.test(p))
    .filter((p) => p !== 'config/siteDefaults.js')
    .filter((p) => !p.startsWith('vendor/'))
    .filter((p) => p !== 'pages/client/TeaserPage.jsx')
    // OrganPage의 조직 소개 문장은 홈 히어로 문구(home.hero_sub)와 별개의 고정 본문이라 제외한다.
    .filter((p) => p !== 'pages/client/OrganPage.jsx')
    .filter((p) => p !== 'test/mockSiteInfo.js')

  it('scans a non-trivial set of files', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it.each(MARKERS)('"%s" is not hard-coded in src', (marker) => {
    const hits = files.filter((p) => readFileSync(join(SRC, p), 'utf-8').includes(marker))
    expect(hits).toEqual([])
  })
})
