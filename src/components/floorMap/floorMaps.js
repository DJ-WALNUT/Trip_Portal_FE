// 소피이바라관 평면도 데이터.
// 엑셀 주소(location)가 평면도 SVG에 적힌 글자("동방 5", "총동연", "B333" 등)와 같으면
// 그 방을 평면도에서 보여준다. 어느 층인지도 SVG 글자를 읽어서 판단하므로,
// SVG에 방 이름을 적고 엑셀 주소에 같은 글자를 넣기만 하면 코드는 그대로 둔다.
import sophieF2 from '../sophie F2.svg?raw'
import sophieF3 from '../sophie F3.svg?raw'

/**
 * 라벨 비교용 정규화: 공백 정리, "동방21" → "동방 21", 영문 대소문자 무시.
 * 표시용이 아니라 비교 키로만 쓴다.
 */
export function normalizeLabel(text) {
  if (typeof text !== 'string') return ''
  const s = text.replace(/\s+/g, ' ').trim()
  const club = s.match(/^동방 ?(\d+)$/)
  return (club ? `동방 ${Number(club[1])}` : s).toUpperCase()
}

/**
 * 일러스트레이터 SVG는 .cls-1 같은 전역 클래스와 id="room" 같은 흔한 id를 쓴다.
 * HTML에 인라인으로 넣으면 <style>이 페이지 전체(캠퍼스 지도 포함)에 적용되므로
 * 평면도마다 접두사를 붙여 격리한다.
 */
export function scopeSvg(raw, prefix) {
  return raw
    .replace(/<\?xml[^>]*\?>\s*/, '')
    .replace(/\.cls-(\d+)/g, `.${prefix}-cls-$1`)
    .replace(/class="([^"]*)"/g, (_, names) =>
      `class="${names.replace(/(^|\s)cls-(\d+)/g, `$1${prefix}-cls-$2`)}"`)
    .replace(/\sid="([^"]*)"/g, ` id="${prefix}-$1"`)
}

/** SVG 안의 글자 라벨 → 등장 횟수. tspan으로 줄바꿈된 라벨("동방" / "21")도 한 라벨로 읽는다. */
export function readLabels(svg) {
  const counts = new Map()
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  for (const text of doc.querySelectorAll('text')) {
    const key = normalizeLabel(text.textContent)
    if (key) counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

const defineFloor = (id, buildingId, buildingName, floor, raw) => {
  const svg = scopeSvg(raw, `fm-${id}`)
  return { id, buildingId, buildingName, floor, svg, labels: readLabels(svg) }
}

export const FLOOR_MAPS = [
  defineFloor('sophie-2f', 'sophie_barat', '소피이바라관', '2층', sophieF2),
  defineFloor('sophie-3f', 'sophie_barat', '소피이바라관', '3층', sophieF3),
]

// 일반 교실 번호(B333 등)는 평면도에 적혀 있어도 대상이 아니다. 동방·총동연처럼 "B***" 주소가 없는 곳만 보여준다.
const CLASSROOM_CODE = /^[A-Z]+\d+(-\d+)?$/

/**
 * 주소가 평면도의 한 곳을 가리키면 { label, map }, 아니면 null.
 * "계단", "남자화장실"처럼 여러 번(같은 층 또는 여러 층) 나오는 글자는 위치를 특정할 수 없으므로 제외한다.
 */
export function findMapRoom(loc) {
  const key = normalizeLabel(loc)
  if (!key || CLASSROOM_CODE.test(key)) return null
  const hits = FLOOR_MAPS.filter((m) => m.labels.has(key))
  if (hits.length !== 1 || hits[0].labels.get(key) !== 1) return null
  return { label: key, map: hits[0] }
}

/** 목록 표시용 주소: 평면도에 있는 곳이면 층을 붙인다 ("동방 5" → "2층 · 동방 5") */
export function formatLocation(loc) {
  const room = findMapRoom(loc)
  return room ? `${room.map.floor} · ${loc}` : loc
}
