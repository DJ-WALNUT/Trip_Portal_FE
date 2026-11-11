import { describe, it, expect } from 'vitest'
import dayjs from '@/lib/dayjs'
import { getSurveyBadge, isSafeSurveyLink, toSurveyList } from './survey'

const today = dayjs.tz('2026-11-11 23:30', 'Asia/Seoul')

describe('getSurveyBadge', () => {
  it('closed wins over everything', () => {
    expect(getSurveyBadge({ is_closed: true, deadline: '2026-11-10' }, today)).toEqual({ tone: 'neutral', label: '마감' })
  })
  it('no deadline is 상시', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: null }, today)).toEqual({ tone: 'done', label: '상시' })
  })
  it('deadline today is 오늘 마감 even late at night', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-11' }, today)).toEqual({ tone: 'pending', label: '오늘 마감' })
  })
  it('counts calendar days in KST', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-12' }, today).label).toBe('D-1')
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-20' }, today)).toEqual({ tone: 'ongoing', label: 'D-9' })
  })
  it('client clock ahead of server never shows a negative D-day', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-10' }, today).label).toBe('오늘 마감')
  })
})

describe('helpers', () => {
  it('isSafeSurveyLink', () => {
    expect(isSafeSurveyLink(' https://a.b ')).toBe(true)
    expect(isSafeSurveyLink('HTTP://a.b')).toBe(true)
    ;['javascript:alert(1)', '//a.b', 'a.b', '', null, undefined].forEach((v) => expect(isSafeSurveyLink(v)).toBe(false))
  })
  it('toSurveyList', () => {
    expect(toSurveyList([{ id: 1 }])).toEqual([{ id: 1 }])
    ;['<html>', null, undefined, { a: 1 }].forEach((v) => expect(toSurveyList(v)).toEqual([]))
  })
})
