import dayjs from '@/lib/dayjs'
import { parseSeoul } from '@/lib/notice'

const SEOUL = 'Asia/Seoul'
const BORROW_PERIOD_DAYS = 4

export function getBorrowTone(status, dueDate, today = dayjs().tz()) {
  if (status === '신청') return 'pending'
  if (status === '반납완료') return 'done'
  if (status !== '미반납') return 'neutral'

  const due = parseSeoul(dueDate)
  if (!due) return 'ongoing'
  const todayKey = dayjs(today).tz(SEOUL).format('YYYY-MM-DD')
  const dueKey = due.format('YYYY-MM-DD')
  return todayKey > dueKey ? 'overdue' : 'ongoing'
}

// 관리자 목록용: 기한 = 대여일 + 4일 (백엔드 check_status와 동일 규칙)
export function getBorrowToneFromBorrowedAt(status, borrowedAt, today) {
  const borrowed = parseSeoul(borrowedAt)
  const dueDate = borrowed
    ? borrowed.add(BORROW_PERIOD_DAYS, 'day').format('YYYY-MM-DD')
    : ''
  return getBorrowTone(status, dueDate, today)
}
