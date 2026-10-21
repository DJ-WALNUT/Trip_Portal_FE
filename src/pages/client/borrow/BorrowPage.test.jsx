import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import BorrowPage from './BorrowPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const ITEMS = [
  { 물품: '우산', 카테고리: '생활', 재고현황: 3 },
  { 물품: '보조배터리', 카테고리: '전자', 재고현황: 2 },
  { 물품: '돗자리', 카테고리: '생활', 재고현황: 0 },
]
const DEPTS = ['컴퓨터공학과', '전자공학과']

let postResolve
beforeEach(() => {
  vi.clearAllMocks()
  window.scrollTo = vi.fn()
  window.alert = vi.fn()
  axios.get.mockImplementation((url) =>
    Promise.resolve({ data: { status: 'success', data: url === '/api/items' ? ITEMS : DEPTS } }))
  axios.post.mockImplementation(() => new Promise((res) => { postResolve = res }))
})

function setup() {
  return render(
    <MemoryRouter initialEntries={['/borrow']}>
      <Routes>
        <Route path="/borrow" element={<BorrowPage />} />
        <Route path="/success" element={<div>성공 페이지</div>} />
      </Routes>
    </MemoryRouter>
  )
}
const loaded = async () => { await screen.findByRole('button', { name: /우산/ }) }
const next = () => screen.getByRole('button', { name: /다음/ })

async function toForm() {
  await loaded()
  fireEvent.click(screen.getByRole('button', { name: /우산/ }))
  fireEvent.click(next())
}

describe('BorrowPage wizard', () => {
  it('step1 next disabled until selection', async () => {
    setup(); await loaded()
    expect(next()).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /우산/ }))
    expect(next()).toBeEnabled()
    expect(screen.getByText('1개 선택됨')).toBeInTheDocument()
  })

  it('sold out item not selectable', async () => {
    setup(); await loaded()
    const sold = screen.getByRole('button', { name: /돗자리/ })
    fireEvent.click(sold)
    expect(screen.getByText('0개 선택됨')).toBeInTheDocument()
    expect(sold).toHaveAttribute('aria-disabled', 'true')
  })

  it('search and category filter', async () => {
    setup(); await loaded()
    fireEvent.change(screen.getByPlaceholderText(/물품명을 검색/), { target: { value: '배터리' } })
    expect(screen.queryByRole('button', { name: /우산/ })).toBeNull()
    expect(screen.getByRole('button', { name: /보조배터리/ })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/물품명을 검색/), { target: { value: 'zzz' } })
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/물품명을 검색/), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: '전자' }))
    expect(screen.queryByRole('button', { name: /우산/ })).toBeNull()
  })

  it('next shows form and keeps cart', async () => {
    const spy = vi.spyOn(window.history, 'pushState')
    setup(); await toForm()
    expect(screen.getByLabelText('이름')).toBeInTheDocument()
    expect(screen.getByText('우산')).toBeInTheDocument()
    expect(spy).toHaveBeenCalledWith({ borrowStep: 2 }, '')
  })

  it('popstate returns to step1 with cart', async () => {
    setup(); await toForm()
    act(() => { window.dispatchEvent(new PopStateEvent('popstate')) })
    expect(await screen.findByRole('button', { name: /보조배터리/ })).toBeInTheDocument()
    expect(screen.getByText('1개 선택됨')).toBeInTheDocument()
  })

  async function fill() {
    fireEvent.change(screen.getByLabelText('이름'), { target: { name: 'name', value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('학번'), { target: { name: 'student_id', value: '202312345' } })
    fireEvent.change(screen.getByLabelText('학과'), { target: { name: 'department', value: '컴퓨터공학과' } })
    fireEvent.change(screen.getByLabelText('전화번호'), { target: { name: 'phone', value: '01012345678' } })
  }

  it('submit posts same payload once', async () => {
    setup(); await toForm(); await fill()
    const btn = screen.getByRole('button', { name: /대여 신청하기/ })
    fireEvent.click(btn); fireEvent.click(btn)
    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith('/api/borrow', {
      name: '홍길동', student_id: '202312345', department: '컴퓨터공학과',
      phone: '01012345678', selected_items: ['우산'],
    })
    await act(async () => { postResolve({ data: { status: 'success' } }) })
    expect(await screen.findByText('성공 페이지')).toBeInTheDocument()
  })

  it('button disabled while submitting', async () => {
    setup(); await toForm(); await fill()
    const btn = screen.getByRole('button', { name: /대여 신청하기/ })
    fireEvent.click(btn)
    await waitFor(() => expect(screen.getByRole('button', { name: /신청 중|대여 신청하기/ })).toBeDisabled())
    await act(async () => { postResolve({ data: { status: 'fail', message: 'x' } }) })
  })
})
