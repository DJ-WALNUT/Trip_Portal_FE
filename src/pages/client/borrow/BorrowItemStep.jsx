import { Search } from 'lucide-react'
import { Button, BottomBar } from '@/components/ui'

function BorrowItemStep({ categories, selectedCategory, onCategory, searchTerm, onSearch, items, cart, onToggle, onNext }) {
  return (
    <>
      <p className="borrow-lead">원하는 물품을 선택(클릭)한 후 다음으로 넘어가세요.</p>

      <div className="borrow-search">
        <Search className="borrow-search__icon" size={18} aria-hidden="true" />
        <input
          type="text"
          className="borrow-search__input"
          placeholder="빌리고 싶은 물품명을 검색하세요..."
          aria-label="물품 검색"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="borrow-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={selectedCategory === cat ? 'borrow-tab borrow-tab--active' : 'borrow-tab'}
            aria-pressed={selectedCategory === cat}
            onClick={() => onCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="borrow-items">
        {items.length > 0 ? (
          items.map((item) => {
            const name = item['물품']
            const selected = cart.has(name)
            const out = item['재고현황'] <= 0
            return (
              <button
                key={name}
                type="button"
                className={`borrow-item${selected ? ' borrow-item--selected' : ''}${out ? ' borrow-item--out' : ''}`}
                aria-pressed={selected}
                aria-disabled={out}
                onClick={() => onToggle(name, item['재고현황'])}
              >
                <span className="borrow-item__name">{name}</span>
                <span className="borrow-item__stock">남은 수량: {out ? '품절' : item['재고현황'] + '개'}</span>
                {selected && <span className="borrow-item__check" aria-hidden="true">✔</span>}
              </button>
            )
          })
        ) : (
          <div className="borrow-empty">검색 결과가 없습니다.</div>
        )}
      </div>

      <BottomBar>
        <span className="borrow-count" aria-live="polite">{cart.size}개 선택됨</span>
        <Button type="button" disabled={cart.size === 0} onClick={onNext}>다음 →</Button>
      </BottomBar>
    </>
  )
}

export default BorrowItemStep
