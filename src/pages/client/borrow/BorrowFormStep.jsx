import { Button, BottomBar, Field } from '@/components/ui'

function BorrowFormStep({ cart, departments, formData, onChange, onBack, onEditItems, onSubmit, submitting }) {
  return (
    <form onSubmit={onSubmit} className="borrow-form">
      <section className="borrow-cart" aria-label="선택된 물품">
        <div className="borrow-cart__head">
          <h2 className="borrow-cart__title">선택된 물품</h2>
          <button type="button" className="borrow-link" onClick={onEditItems}>물품 수정</button>
        </div>
        <div className="borrow-tags">
          {Array.from(cart).map((name) => <span key={name} className="borrow-tag">{name}</span>)}
        </div>
      </section>

      <h2 className="borrow-form__title">신청자 정보</h2>
      <Field label="이름" htmlFor="borrow-name">
        <input id="borrow-name" type="text" name="name" placeholder="이름" required
          value={formData.name} onChange={onChange} />
      </Field>
      <Field label="학번" htmlFor="borrow-sid">
        <input id="borrow-sid" type="number" inputMode="numeric" name="student_id" placeholder="학번 (예: 202312345)"
          min="200000000" max="209909099" required value={formData.student_id} onChange={onChange} />
      </Field>
      <Field label="학과" htmlFor="borrow-dept">
        <select id="borrow-dept" name="department" required value={formData.department} onChange={onChange}>
          <option value="" disabled>학과 선택</option>
          {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
        </select>
      </Field>
      <Field label="전화번호" htmlFor="borrow-phone">
        <input id="borrow-phone" type="tel" name="phone" placeholder="전화번호 (01012345678)" required
          value={formData.phone} onChange={onChange} />
      </Field>

      <BottomBar>
        <Button type="button" variant="ghost" onClick={onBack}>← 이전</Button>
        <Button type="submit" disabled={cart.size === 0 || submitting}>
          {submitting ? '신청 중…' : '대여 신청하기'}
        </Button>
      </BottomBar>
    </form>
  )
}

export default BorrowFormStep
