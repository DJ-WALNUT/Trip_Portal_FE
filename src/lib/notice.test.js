import { describe, it, expect } from 'vitest'
import dayjs from '@/lib/dayjs'
import { isNewNotice, formatNoticeDate, getFileExt } from './notice'

const now = dayjs.tz('2026-10-21 12:00', 'Asia/Seoul')

describe('isNewNotice', () => {
  it('3일 이내 공지는 true', () => {
    expect(isNewNotice('2026-10-20T10:00:00+09:00', now)).toBe(true)
    expect(isNewNotice('2026-10-20T10:00:00', now)).toBe(true)
  })

  it('3일 경과한 공지는 false', () => {
    expect(isNewNotice('2026-10-17T11:00:00+09:00', now)).toBe(false)
  })

  it('미래 날짜 공지는 false', () => {
    expect(isNewNotice('2026-10-30T00:00:00+09:00', now)).toBe(false)
  })

  it('파싱 불가 입력은 false이고 throw하지 않는다', () => {
    expect(isNewNotice('garbage', now)).toBe(false)
    expect(isNewNotice(undefined, now)).toBe(false)
  })
})

describe('formatNoticeDate', () => {
  it('유효한 날짜는 KST 기준 YYYY.MM.DD', () => {
    expect(formatNoticeDate('2026-10-20T23:30:00+09:00')).toBe('2026.10.20')
    expect(formatNoticeDate('2026-10-20T23:30:00Z')).toBe('2026.10.21')
  })

  it('파싱 불가 입력은 원문을 그대로 돌려준다', () => {
    expect(formatNoticeDate('garbage')).toBe('garbage')
  })
})

describe('getFileExt', () => {
  it('대문자 확장자를 돌려준다', () => {
    expect(getFileExt('행사안내.PDF')).toBe('PDF')
    expect(getFileExt('포스터.jpeg')).toBe('JPEG')
  })

  it('확장자가 없으면 FILE', () => {
    expect(getFileExt('noext')).toBe('FILE')
  })

  it('4자를 넘는 확장자는 FILE', () => {
    expect(getFileExt('a.longext')).toBe('FILE')
  })
})
