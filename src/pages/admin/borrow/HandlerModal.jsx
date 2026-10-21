import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui'

// 담당자 이름 입력 모달 (승인/반납 공용)
function HandlerModal({ title, description, confirmLabel, value, onChange, onSubmit, onClose }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="handler-modal-title">
        <h3 id="handler-modal-title">{title}</h3>
        <p>{description}</p>
        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="담당자 이름"
            aria-label="담당자 이름"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className="modal-input"
          />
          <div className="modal-actions">
            <Button type="submit" variant="primary" block>{confirmLabel}</Button>
            <Button variant="ghost" block onClick={onClose}>취소</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HandlerModal
