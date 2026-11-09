// 동방 평면도 데이터.
// 동방은 "동방 N" 형태의 주소만 넘겨받기 때문에, 어느 층인지는 평면도 SVG 안의
// "동방 N" 라벨을 읽어서 판단한다. SVG를 고치거나 층을 추가해도 코드는 그대로 둔다.
import sophieF2 from '../sophie F2.svg?raw'
import sophieF3 from '../sophie F3.svg?raw'

const CLUB_ROOM_RE = /^\s*동방\s*(\d+)\s*$/

/** "동방 5" → 5, 그 외 → null */
export function parseClubRoomNumber(loc) {
  const m = typeof loc === 'string' ? loc.match(CLUB_ROOM_RE) : null
  return m ? Number(m[1]) : null
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

/** SVG 안의 "동방 N" 라벨 번호 집합. tspan으로 줄바꿈된 라벨("동방" / "21")도 읽는다. */
export function readRoomLabels(svg) {
  const rooms = new Set()
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  for (const text of doc.querySelectorAll('text')) {
    const n = parseClubRoomNumber(text.textContent.replace(/\s+/g, ' '))
    if (n !== null) rooms.add(n)
  }
  return rooms
}

const defineFloor = (id, buildingId, buildingName, floor, raw) => {
  const svg = scopeSvg(raw, `fm-${id}`)
  return { id, buildingId, buildingName, floor, svg, rooms: readRoomLabels(svg) }
}

export const FLOOR_MAPS = [
  defineFloor('sophie-2f', 'sophie_barat', '소피이바라관', '2층', sophieF2),
  defineFloor('sophie-3f', 'sophie_barat', '소피이바라관', '3층', sophieF3),
]

/** 주소가 평면도에 있는 동방이면 { number, map }, 아니면 null */
export function findClubRoom(loc) {
  const number = parseClubRoomNumber(loc)
  if (number === null) return null
  const map = FLOOR_MAPS.find((m) => m.rooms.has(number))
  return map ? { number, map } : null
}

/** 목록 표시용 주소: 동방이면 층을 붙인다 ("동방 5" → "2층 · 동방 5") */
export function formatLocation(loc) {
  const room = findClubRoom(loc)
  return room ? `${room.map.floor} · ${loc}` : loc
}
