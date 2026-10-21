import { describe, it, expect } from 'vitest'
import { getDirtyItemNames } from './stock'

const base = [{ 물품: '우산', 재고현황: 5, 카테고리: '생활' }]

describe('getDirtyItemNames', () => {
  it('숫자 표기만 다르고 값이 같으면 변경 없음', () => {
    const current = [{ 물품: '우산', 재고현황: '5', 카테고리: '생활' }]
    expect(getDirtyItemNames(base, current).size).toBe(0)
  })

  it('수량이 바뀌면 해당 물품 이름이 포함된다', () => {
    const current = [{ 물품: '우산', 재고현황: 4, 카테고리: '생활' }]
    expect(getDirtyItemNames(base, current).has('우산')).toBe(true)
  })

  it('카테고리가 바뀌어도 포함된다', () => {
    const current = [{ 물품: '우산', 재고현황: 5, 카테고리: '기타' }]
    expect(getDirtyItemNames(base, current).has('우산')).toBe(true)
  })
})
