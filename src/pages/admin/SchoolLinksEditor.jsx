import React from 'react'
import { Button } from '@/components/ui'
import './AdminSiteInfo.css'

const MAX_LINKS = 10

// value: [{label, url}] — 부모가 가진 배열을 변경하지 않고 항상 새 배열을 onChange로 넘긴다.
function SchoolLinksEditor({ value, onChange, errors }) {
  const setRow = (i, patch) => onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  const move = (i, dir) => {
    const next = value.slice()
    const j = i + dir
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, { label: '', url: '' }])

  return (
    <div className="admin-site-info-links" id="site-info-links.school" tabIndex={-1}>
      <ul className="admin-site-info-links__list">
        {value.map((row, i) => {
          const n = i + 1
          return (
            <li key={i} className="admin-site-info-links__row">
              <input
                type="text"
                className="admin-site-info-links__label"
                aria-label={`${n}번째 링크 이름`}
                placeholder="이름"
                value={row.label}
                onChange={(e) => setRow(i, { label: e.target.value })}
              />
              <input
                type="url"
                className="admin-site-info-links__url"
                aria-label={`${n}번째 링크 주소`}
                placeholder="https://"
                value={row.url}
                onChange={(e) => setRow(i, { url: e.target.value })}
              />
              <div className="admin-site-info-links__actions">
                <Button variant="ghost" aria-label={`${n}번째 링크 위로`} disabled={i === 0} onClick={() => move(i, -1)}>▲</Button>
                <Button variant="ghost" aria-label={`${n}번째 링크 아래로`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>▼</Button>
                <Button variant="danger" aria-label={`${n}번째 링크 삭제`} disabled={value.length <= 1} onClick={() => remove(i)}>삭제</Button>
              </div>
            </li>
          )
        })}
      </ul>
      {errors ? <p className="admin-site-info-error" role="alert">{errors}</p> : null}
      <Button variant="ghost" disabled={value.length >= MAX_LINKS} onClick={add}>+ 링크 추가</Button>
    </div>
  )
}

export default SchoolLinksEditor
