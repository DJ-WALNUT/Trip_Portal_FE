import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import axios from 'axios'
import ScheduleManager from './ScheduleManager'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const ROWS = [{ id: 1, name: '중간고사', start: '2026-10-20', end: '2026-10-26' }]
const table = (c) => within(c.querySelector('.rtable__table'))

describe('ScheduleManager', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    axios.get.mockResolvedValue({ data: ROWS })
  })

  it('lists schedules', async () => {
    const { container } = render(<ScheduleManager />)
    await screen.findAllByText('중간고사')
    expect(axios.get).toHaveBeenCalledWith('/api/schedule')
    expect(table(container).getByText('2026-10-26')).toBeInTheDocument()
  })

  it('adds via POST and reloads', async () => {
    axios.post.mockResolvedValue({ status: 201, data: { status: 'success' } })
    const { container } = render(<ScheduleManager />)
    await screen.findAllByText('중간고사')
    fireEvent.click(screen.getByText('+ 일정 추가'))
    const t = table(container)
    fireEvent.change(t.getByLabelText('일정 이름'), { target: { value: '축제' } })
    fireEvent.change(t.getByLabelText('시작일'), { target: { value: '2026-11-01' } })
    fireEvent.change(t.getByLabelText('종료일'), { target: { value: '2026-11-03' } })
    fireEvent.click(t.getByText('저장'))
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/admin/schedule', { name: '축제', start: '2026-11-01', end: '2026-11-03' }))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('저장되었습니다.'))
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2))
  })

  it('edits via PUT', async () => {
    axios.put.mockResolvedValue({ data: { status: 'success' } })
    const { container } = render(<ScheduleManager />)
    await screen.findAllByText('중간고사')
    fireEvent.click(table(container).getByText('수정'))
    fireEvent.change(table(container).getByLabelText('일정 이름'), { target: { value: '기말고사' } })
    fireEvent.click(table(container).getByText('저장'))
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith('/api/admin/schedule/1', { name: '기말고사', start: '2026-10-20', end: '2026-10-26' }))
  })

  it('deletes only after confirm', async () => {
    axios.delete.mockResolvedValue({ data: { status: 'success' } })
    const { container } = render(<ScheduleManager />)
    await screen.findAllByText('중간고사')
    window.confirm.mockReturnValueOnce(false)
    fireEvent.click(table(container).getByText('삭제'))
    expect(window.confirm).toHaveBeenCalledWith('이 학사일정을 삭제하시겠습니까?')
    expect(axios.delete).not.toHaveBeenCalled()
    fireEvent.click(table(container).getByText('삭제'))
    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith('/api/admin/schedule/1'))
  })

  it('shows 400 errors under the row', async () => {
    axios.post.mockRejectedValue({ response: { status: 400, data: { status: 'fail', errors: { name: '이름을 입력해 주세요.' } } } })
    const { container } = render(<ScheduleManager />)
    await screen.findAllByText('중간고사')
    fireEvent.click(screen.getByText('+ 일정 추가'))
    fireEvent.click(table(container).getByText('저장'))
    expect(await table(container).findByText('이름을 입력해 주세요.')).toBeInTheDocument()
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('alerts on other failures', async () => {
    axios.post.mockRejectedValue({ response: { status: 500 } })
    const { container } = render(<ScheduleManager />)
    await screen.findAllByText('중간고사')
    fireEvent.click(screen.getByText('+ 일정 추가'))
    fireEvent.click(table(container).getByText('저장'))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('저장 실패'))
  })
})
