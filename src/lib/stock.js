const isSameNumber = (a, b) => {
  const x = Number(a)
  const y = Number(b)
  return x === y || (Number.isNaN(x) && Number.isNaN(y))
}

// 물품 이름 기준으로 수량 또는 카테고리가 바뀐 항목 이름을 모은다.
// 한쪽에만 있는 이름(추가·삭제)도 변경으로 본다.
export function getDirtyItemNames(original, current) {
  const originalByName = new Map(original.map((item) => [String(item.물품), item]))
  const currentByName = new Map(current.map((item) => [String(item.물품), item]))
  const dirty = new Set()

  for (const name of new Set([...originalByName.keys(), ...currentByName.keys()])) {
    const before = originalByName.get(name)
    const after = currentByName.get(name)
    if (!before || !after) {
      dirty.add(name)
    } else if (!isSameNumber(before.재고현황, after.재고현황) || before.카테고리 !== after.카테고리) {
      dirty.add(name)
    }
  }
  return dirty
}
