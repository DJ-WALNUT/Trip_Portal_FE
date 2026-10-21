import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SchoolLinksEditor from './SchoolLinksEditor'

const L = (n) => Array.from({ length: n }, (_, i) => ({ label: `이름${i + 1}`, url: `https://e${i + 1}.kr` }))

describe('SchoolLinksEditor', () => {
  it('moves up / down', () => {
    const onChange = vi.fn()
    render(<SchoolLinksEditor value={L(3)} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('2번째 링크 위로'))
    expect(onChange).toHaveBeenLastCalledWith([L(3)[1], L(3)[0], L(3)[2]])
    fireEvent.click(screen.getByLabelText('2번째 링크 아래로'))
    expect(onChange).toHaveBeenLastCalledWith([L(3)[0], L(3)[2], L(3)[1]])
  })
  it('disables boundary moves', () => {
    render(<SchoolLinksEditor value={L(3)} onChange={() => {}} />)
    expect(screen.getByLabelText('1번째 링크 위로')).toBeDisabled()
    expect(screen.getByLabelText('3번째 링크 아래로')).toBeDisabled()
    expect(screen.getByLabelText('2번째 링크 위로')).toBeEnabled()
  })
  it('removes, edits and adds without mutating', () => {
    const onChange = vi.fn()
    const value = L(2)
    render(<SchoolLinksEditor value={value} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('1번째 링크 삭제'))
    expect(onChange).toHaveBeenLastCalledWith([L(2)[1]])
    fireEvent.change(screen.getByLabelText('2번째 링크 이름'), { target: { value: '새이름' } })
    expect(onChange).toHaveBeenLastCalledWith([L(2)[0], { label: '새이름', url: 'https://e2.kr' }])
    fireEvent.change(screen.getByLabelText('1번째 링크 주소'), { target: { value: 'https://x.kr' } })
    expect(onChange).toHaveBeenLastCalledWith([{ label: '이름1', url: 'https://x.kr' }, L(2)[1]])
    fireEvent.click(screen.getByText('+ 링크 추가'))
    expect(onChange).toHaveBeenLastCalledWith([...L(2), { label: '', url: '' }])
    expect(value).toEqual(L(2))
  })
  it('limits to 10 and keeps at least 1', () => {
    const { rerender } = render(<SchoolLinksEditor value={L(10)} onChange={() => {}} />)
    expect(screen.getByText('+ 링크 추가')).toBeDisabled()
    rerender(<SchoolLinksEditor value={L(1)} onChange={() => {}} />)
    expect(screen.getByLabelText('1번째 링크 삭제')).toBeDisabled()
  })
  it('shows error', () => {
    render(<SchoolLinksEditor value={L(1)} onChange={() => {}} errors="목록 오류" />)
    expect(screen.getByRole('alert')).toHaveTextContent('목록 오류')
  })
})
