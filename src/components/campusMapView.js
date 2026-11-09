// 캠퍼스 지도 화면 맞춤 계산.
// 원본 SVG(1114×1155)는 상하좌우에 길만 있는 여백이 커서, 좁은 화면에서는 건물이 작아진다.
// 건물 영역(focus)이 지도 칸을 최대한 채우도록, 칸의 실제 가로세로 비율에 맞춘 viewBox를 만든다.

export const FULL = { x: 0, y: 0, w: 1114.27, h: 1155.08 }
export const FULL_VIEWBOX = `${FULL.x} ${FULL.y} ${FULL.w} ${FULL.h}`

// 건물 레이어 외곽(브라우저 getBBox 실측값). 런타임 측정이 안 될 때(테스트 등) 사용.
export const BUILDINGS_BOX = { x: 120.86, y: 178.59, w: 823.94, h: 672.77 }

// 선택 시 테두리·그림자가 잘리지 않도록 건물 영역 바깥에 두는 여유 (긴 변 기준 비율)
const PAD_RATIO = 0.08

export const padBox = (box, ratio = PAD_RATIO) => {
  const p = Math.max(box.w, box.h) * ratio
  return { x: box.x - p, y: box.y - p, w: box.w + p * 2, h: box.h + p * 2 }
}

// 지도를 칸 안에서 위로 올리는 정도 (건물 영역 높이 기준 비율).
// 0이면 가운데, 0.05면 건물 영역 높이의 5%만큼 위로 올라가 상단 여백이 덜 보인다. 음수면 아래로.
// 위쪽 여백(PAD_RATIO)보다 크게 올리면 맨 위 건물이 잘릴 수 있다.
export const SHIFT_UP_RATIO = 0.05

export const shiftUp = (box, ratio = SHIFT_UP_RATIO) => ({ ...box, y: box.y + box.h * ratio })

const clampAxis =(start, size, min, max) =>
  size <= max - min ? Math.min(Math.max(start, min), max - size) : min + (max - min - size) / 2

/**
 * focus 영역이 모두 보이면서 aspect(가로/세로)와 같은 비율의 viewBox 문자열.
 * 남는 쪽은 실제 지도(길 등)로 채우고, 가능하면 지도 밖 빈 공간은 보이지 않게 한다.
 */
export function fitViewBox(focus, aspect, full = FULL) {
  if (!(aspect > 0) || !Number.isFinite(aspect)) return FULL_VIEWBOX
  let w = focus.w
  let h = focus.h
  if (w / h > aspect) h = w / aspect
  else w = h * aspect
  const x = clampAxis(focus.x + focus.w / 2 - w / 2, w, full.x, full.x + full.w)
  const y = clampAxis(focus.y + focus.h / 2 - h / 2, h, full.y, full.y + full.h)
  return `${x} ${y} ${w} ${h}`
}
