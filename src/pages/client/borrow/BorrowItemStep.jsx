import { Search, Check } from 'lucide-react'
import { Button, BottomBar } from '@/components/ui'

function BorrowItemStep({ categories, selectedCategory, onCategory, searchTerm, onSearch, items, outOfStockItems = [], cart, onToggle, onNext }) {
  const renderItem = (item) => {
    const name = item['물품']
    const selected = cart.has(name)
    const out = Number(item['재고현황']) <= 0
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
        {selected && <span className="borrow-item__check" aria-hidden="true"><Check size={16} /></span>}
      </button>
    )
  }

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

      {items.length + outOfStockItems.length === 0 ? (
        <div className="borrow-empty">검색 결과가 없습니다.</div>
      ) : (
        <>
          {items.length > 0 && (
            <div className="borrow-items">{items.map(renderItem)}</div>
          )}

          {/* 재고 없는 물품: 선택 불가이므로 아래에 따로 모아서 표시 */}
          {outOfStockItems.length > 0 && (
            <section className="borrow-out" aria-labelledby="borrow-out-title">
              <h2 id="borrow-out-title" className="borrow-out__title">
                재고 없음 <span className="borrow-out__count">{outOfStockItems.length}</span>
              </h2>
              <div className="borrow-items">{outOfStockItems.map(renderItem)}</div>
            </section>
          )}
        </>
      )}

      <BottomBar>
        <span className="borrow-count" aria-live="polite">{cart.size}개 선택됨</span>
        <Button type="button" disabled={cart.size === 0} onClick={onNext}>다음 →</Button>
      </BottomBar>
    </>
  )
}

export default BorrowItemStep
