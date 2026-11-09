import React, { useLayoutEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { parseClubRoomNumber } from './floorMaps'
import './FloorMap.css'

// 좁은 화면에서는 평면도 전체가 너무 작아 라벨을 읽기 어려우므로 확대 상태로 시작한다.
const NARROW_QUERY = '(max-width: 560px)'
const startsZoomed = () => typeof window !== 'undefined' && !!window.matchMedia?.(NARROW_QUERY).matches

const toRoot = (svg, el) => svg.getScreenCTM().inverse().multiply(el.getScreenCTM())

/**
 * 라벨("동방 N")의 중심점을 기준으로 그 점을 포함하는 방 도형을 찾는다.
 * 방 도형에는 id가 없어서 라벨 위치로 매칭한다. (회전된 방도 CTM으로 처리)
 */
function locateRoom(svg, roomGroup, number) {
  const label = [...svg.querySelectorAll('text')]
    .find((t) => parseClubRoomNumber(t.textContent.replace(/\s+/g, ' ')) === number)
  if (!label || typeof label.getBBox !== 'function' || !svg.getScreenCTM()) return null

  const lb = label.getBBox()
  const center = new DOMPoint(lb.x + lb.width / 2, lb.y + lb.height / 2).matrixTransform(toRoot(svg, label))

  const shapes = roomGroup ? [...roomGroup.children] : []
  const shape = shapes.find((s) => {
    const local = center.matrixTransform(toRoot(svg, s).inverse())
    if (typeof s.isPointInFill === 'function') return s.isPointInFill(local)
    const b = s.getBBox()
    return local.x >= b.x && local.x <= b.x + b.width && local.y >= b.y && local.y <= b.y + b.height
  })

  // 확대용 영역: 도형이 있으면 도형의 외곽, 없으면 라벨 외곽 (루트 좌표계)
  const boxEl = shape || label
  const b = boxEl.getBBox()
  const m = toRoot(svg, boxEl)
  const corners = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]
    .map(([x, y]) => new DOMPoint(x, y).matrixTransform(m))
  const xs = corners.map((p) => p.x)
  const ys = corners.map((p) => p.y)
  const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }

  return { label, shape, center, box }
}

function zoomedViewBox(full, box) {
  const w = Math.min(full.w, Math.max(full.w * 0.5, box.w * 3.5))
  const h = w * (full.h / full.w)
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const x = Math.min(Math.max(cx - w / 2, full.x), full.x + full.w - w)
  const y = Math.min(Math.max(cy - h / 2, full.y), full.y + full.h - h)
  return `${x} ${y} ${w} ${h}`
}

/**
 * 동방 평면도. map은 FLOOR_MAPS 항목, number는 강조할 동방 번호.
 */
const FloorMap = ({ map, number }) => {
  const canvasRef = useRef(null)
  const geometry = useRef(null) // { full, box } — 대상 동방을 찾았을 때만
  const [zoomed, setZoomed] = useState(startsZoomed)

  // SVG를 직접 넣고(React가 다시 그리며 강조 클래스를 지우지 않도록) 대상 동방을 찾아 강조한다.
  // 프로젝트 내부 SVG 에셋(사용자 입력 아님)을 스코프 처리한 문자열이다.
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.innerHTML = map.svg
    const svg = canvas.querySelector('svg')
    if (!svg) return
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('focusable', 'false')

    const [x, y, w, h] = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number)
    const full = w > 0 && h > 0 ? { x, y, w, h } : null
    const roomGroup = svg.querySelector(`[id="fm-${map.id}-room"]`)
    const found = locateRoom(svg, roomGroup, number)

    svg.classList.add('floor-map-svg')
    roomGroup?.classList.add('floor-map-rooms')
    if (found) {
      svg.classList.add('is-focused')
      found.label.classList.add('floor-map-target-label')
      found.shape?.classList.add('floor-map-target')
    }

    geometry.current = full && found ? { full, box: found.box } : null
  }, [map.id, map.svg, number])

  // 위 effect 다음에 실행되어(선언 순서) 찾은 위치 기준으로 확대/전체 보기를 적용한다
  useLayoutEffect(() => {
    const svg = canvasRef.current?.querySelector('svg')
    const g = geometry.current
    if (!svg || !g) return
    const { full, box } = g
    svg.setAttribute('viewBox', zoomed ? zoomedViewBox(full, box) : `${full.x} ${full.y} ${full.w} ${full.h}`)
  }, [zoomed, map.id, map.svg, number])

  const place = `${map.buildingName} ${map.floor}`

  return (
    <figure className="floor-map" aria-label={`${place} 평면도, 동방 ${number} 위치`}>
      <div className="floor-map-toolbar">
        <span className="floor-map-place">{place}</span>
        <button
          type="button"
          className="floor-map-zoom"
          aria-pressed={zoomed}
          onClick={() => setZoomed((z) => !z)}
        >
          {zoomed ? <ZoomOut size={16} aria-hidden="true" /> : <ZoomIn size={16} aria-hidden="true" />}
          {zoomed ? '전체 보기' : '확대'}
        </button>
      </div>
      <div ref={canvasRef} className="floor-map-canvas" />
      <figcaption className="floor-map-caption">
        <span className="floor-map-legend" aria-hidden="true" />
        동방 {number} · {place}
      </figcaption>
    </figure>
  )
}

export default FloorMap
