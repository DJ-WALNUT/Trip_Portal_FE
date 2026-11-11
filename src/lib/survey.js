import dayjs from '@/lib/dayjs'

const SEOUL = 'Asia/Seoul'

// 목록·상세·홈·관리자에서 함께 쓰는 상태 배지. 마감 여부는 서버의 is_closed를 따른다.
export function getSurveyBadge(survey, today = dayjs().tz()) {
  if (survey.is_closed) return { tone: 'neutral', label: '마감' }
  if (!survey.deadline) return { tone: 'done', label: '상시' }

  const end = dayjs.tz(survey.deadline, SEOUL).startOf('day')
  const days = end.diff(dayjs(today).tz(SEOUL).startOf('day'), 'day')
  // 기기 시계가 서버보다 앞서도 음수 D-day는 보여주지 않는다
  if (!(days > 0)) return { tone: 'pending', label: '오늘 마감' }
  return { tone: 'ongoing', label: `D-${days}` }
}

// 버튼 href에 넣어도 되는 주소인지 (http/https만)
export function isSafeSurveyLink(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim())
}

// API가 배열이 아닌 응답(프록시 오류 페이지 등)을 줘도 화면이 깨지지 않게 한다
export function toSurveyList(data) {
  return Array.isArray(data) ? data : []
}
