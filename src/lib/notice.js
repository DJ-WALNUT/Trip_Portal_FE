import dayjs from '@/lib/dayjs'

const SEOUL = 'Asia/Seoul'
const OFFSET_RE = /([+-]\d{2}:?\d{2}|Z)$/i
const DAY_MS = 24 * 60 * 60 * 1000

// 오프셋이 있으면 그대로, 없으면 서울 시각으로 해석한다. 실패하면 null.
export function parseSeoul(input) {
  if (typeof input !== 'string' || !input.trim()) return null
  try {
    const parsed = OFFSET_RE.test(input.trim())
      ? dayjs(input.trim()).tz(SEOUL)
      : dayjs.tz(input.trim(), SEOUL)
    return parsed.isValid() ? parsed : null
  } catch {
    return null
  }
}

export function isNewNotice(dateStr, now = dayjs().tz(), days = 3) {
  const date = parseSeoul(dateStr)
  if (!date) return false
  const diff = dayjs(now).valueOf() - date.valueOf()
  return diff >= 0 && diff < days * DAY_MS
}

export function formatNoticeDate(dateStr) {
  const date = parseSeoul(dateStr)
  return date ? date.format('YYYY.MM.DD') : dateStr
}

// 확장자는 1~4자 영문/숫자 등 공백 없는 토큰만 인정한다. 그 밖이면 'FILE'.
export function getFileExt(filename) {
  if (typeof filename !== 'string') return 'FILE'
  const dot = filename.lastIndexOf('.')
  if (dot <= 0) return 'FILE'
  const ext = filename.slice(dot + 1)
  return /^[^\s.]{1,4}$/.test(ext) ? ext.toUpperCase() : 'FILE'
}
