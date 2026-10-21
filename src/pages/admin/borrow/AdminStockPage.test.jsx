import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import AdminStockPage from './AdminStockPage'

vi.mock('axios')

const stock = () => [
  { 물품: '우산', 재고현황: 5, 카테고리: '생활' },
  { 물품: '보조배터리', 재고현황: 3, 카테고리: '전자' },
]

async function setup() {
  axios.get.mockResolvedValue({ data: { data: stock() } })
  axios.post.mockResolvedValue({ data: { status: 'success' } })
  const utils = render(<MemoryRouter><AdminStockPage /></MemoryRouter>)
  await screen.findAllByText('우산')
  const table = within(utils.container.querySelector('.rtable__table'))
  return { ...utils, table }
}

describe('AdminStockPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('marks edited rows', async () => {
    const { table, container } = await setup()
    const user = userEvent.setup()
    expect(screen.queryByText(/저장하지 않은 변경/)).toBeNull()
    const input = table.getAllByRole('spinbutton')[0]
    await user.clear(input)
    await user.type(input, '4')
    expect(screen.getByText('저장하지 않은 변경 1개')).toBeInTheDocument()
    expect(table.getByText('수정됨')).toBeInTheDocument()
    expect(container.querySelector('.rtable__table tr[data-dirty="true"]')).not.toBeNull()
    await user.clear(input)
    await user.type(input, '5')
    expect(screen.queryByText(/저장하지 않은 변경/)).toBeNull()
    expect(table.queryByText('수정됨')).toBeNull()
  })

  it('save clears dirty', async () => {
    const { table } = await setup()
    const user = userEvent.setup()
    const input = table.getAllByRole('spinbutton')[0]
    await user.clear(input)
    await user.type(input, '4')
    await user.click(screen.getByRole('button', { name: '전체 재고 저장하기' }))
    await waitFor(() => expect(screen.queryByText(/저장하지 않은 변경/)).toBeNull())
    expect(axios.post).toHaveBeenCalledWith('/api/admin/stock/update', {
      items: expect.arrayContaining([expect.objectContaining({ 물품: '우산', 재고현황: '4' })]),
    })
    expect(window.alert).toHaveBeenCalledWith('재고가 전체 저장되었습니다.')
  })

  it('delete confirm text', async () => {
    const { table } = await setup()
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(table.getAllByRole('button', { name: /삭제/ })[0])
    expect(confirmSpy).toHaveBeenCalledWith("'우산'을(를) 정말 삭제하시겠습니까?")
    expect(axios.post).not.toHaveBeenCalled()
  })
})
