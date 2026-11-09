import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import MapPage from './MapPage'

vi.mock('axios')
vi.mock('../../components/CampusMap', () => ({ default: () => <div data-testid="campus-map" /> }))

const data = {
  sophie_barat: {
    name: '소피이바라관',
    description: '',
    facilities: [
      { name: 'COMA', loc: '동방 19', desc: '학관 3층 동방 19\n검색어 : 코마방' },
      { name: '팀에뛰드', loc: '동방 1', desc: '' },
      { name: '예비군 대대본부', loc: 'B333', desc: '' },
    ],
  },
  nicols: {
    name: '니콜스관',
    description: '',
    facilities: [{ name: '학생지원팀', loc: 'N109', desc: '' }],
  },
}

beforeEach(() => {
  axios.get.mockResolvedValue({ data: { status: 'success', data } })
})

describe('MapPage search', () => {
  it('lists matching facilities under their building and opens the floor plan in one tap', async () => {
    render(<MapPage />)
    await userEvent.type(await screen.findByRole('textbox'), '코마')

    const hit = await screen.findByRole('button', { name: /COMA/ })
    expect(hit).toHaveTextContent('3층 · 동방 19')
    expect(screen.queryByRole('button', { name: /니콜스관/ })).toBeNull()

    await userEvent.click(hit)
    expect(screen.getByRole('dialog', { name: 'COMA' })).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: /동방 19 위치/ })).toBeInTheDocument()
  })

  it('a building-name match still shows the building without dumping its facilities', async () => {
    render(<MapPage />)
    await userEvent.type(await screen.findByRole('textbox'), '니콜스')
    expect(await screen.findByRole('button', { name: /니콜스관/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /학생지원팀/ })).toBeNull()
  })

  it('shows the floor next to club rooms in the building detail list', async () => {
    render(<MapPage />)
    await userEvent.type(await screen.findByRole('textbox'), '동방')
    await userEvent.click(await screen.findByRole('button', { name: /소피이바라관/ }))
    expect(screen.getByRole('button', { name: /팀에뛰드/ })).toHaveTextContent('2층 · 동방 1')
  })
})
