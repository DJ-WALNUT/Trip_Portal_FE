import { describe, it, expect } from 'vitest'
import dayjs from '@/lib/dayjs'
import { getBorrowTone, getBorrowToneFromBorrowedAt } from './borrowStatus'

const today = dayjs.tz('2026-10-21 12:00', 'Asia/Seoul')

describe('getBorrowTone', () => {
  it('신청 → pending, 반납완료 → done', () => {
    expect(getBorrowTone('신청', '2026-10-25', today)).toBe('pending')
    expect(getBorrowTone('반납완료', '2026-10-01', today)).toBe('done')
  })

  it('미반납: 기한 당일은 ongoing, 기한 지나면 overdue', () => {
    expect(getBorrowTone('미반납', '2026-10-21', today)).toBe('ongoing')
    expect(getBorrowTone('미반납', '2026-10-20', today)).toBe('overdue')
  })

  it('미반납이지만 기한이 없거나 잘못되면 ongoing', () => {
    expect(getBorrowTone('미반납', '-', today)).toBe('ongoing')
    expect(getBorrowTone('미반납', '', today)).toBe('ongoing')
  })

  it('그 외 상태는 neutral', () => {
    expect(getBorrowTone('대여중', '2026-10-20', today)).toBe('neutral')
  })

  it('today 기본값은 서울 현재 시각을 사용한다', () => {
    expect(getBorrowTone('미반납', '2000-01-01')).toBe('overdue')
  })
})

describe('getBorrowToneFromBorrowedAt', () => {
  it('대여일 + 4일을 기한으로 계산한다', () => {
    expect(getBorrowToneFromBorrowedAt('미반납', '2026-10-11 09:00:00', today)).toBe('overdue')
    expect(getBorrowToneFromBorrowedAt('미반납', '2026-10-19 09:00:00', today)).toBe('ongoing')
  })

  it('신청·반납완료 상태는 대여일과 무관하게 처리한다', () => {
    expect(getBorrowToneFromBorrowedAt('신청', '2026-10-01 09:00:00', today)).toBe('pending')
    expect(getBorrowToneFromBorrowedAt('반납완료', '2026-10-01 09:00:00', today)).toBe('done')
  })

  it('대여일이 잘못되면 throw하지 않는다', () => {
    expect(() => getBorrowToneFromBorrowedAt('미반납', 'garbage', today)).not.toThrow()
  })
})
