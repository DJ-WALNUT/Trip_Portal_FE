import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import { DEFAULT_SITE_INFO } from '@/config/siteDefaults'
import { mockRefresh, resetSiteInfo } from '@/test/mockSiteInfo'
import AdminSiteInfoPage from './AdminSiteInfoPage'

vi.mock('axios')
vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule))
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const SERVER = { ...structuredClone(DEFAULT_SITE_INFO), 'system.snowfall': true }

function setup() {
  return render(
    <MemoryRouter initialEntries={['/admin/site-info']}>
      <Routes>
        <Route path="/admin/site-info" element={<AdminSiteInfoPage />} />
        <Route path="/admin/dashboard" element={<p>대시보드 이동됨</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminSiteInfoPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    resetSiteInfo()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'master')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    axios.get.mockImplementation((url) =>
      Promise.resolve({ data: url === '/api/site-info' ? { status: 'success', data: structuredClone(SERVER) } : [] })
    )
  })

  it('redirects non-master', async () => {
    localStorage.setItem('adminRole', 'sub')
    setup()
    expect(window.alert).toHaveBeenCalledWith('마스터 권한이 필요합니다.')
    expect(await screen.findByText('대시보드 이동됨')).toBeInTheDocument()
  })

  it('tracks changes and sends only changed keys', async () => {
    axios.put.mockResolvedValue({ data: { status: 'success', data: { ...SERVER, 'home.hero_title': '새 문구' } } })
    setup()
    const input = await screen.findByLabelText('히어로 제목')
    expect(screen.getByText('저장하지 않은 변경 0개')).toBeInTheDocument()
    expect(screen.getByText('저장')).toBeDisabled()
    fireEvent.change(input, { target: { value: '새 문구' } })
    expect(screen.getByText('저장하지 않은 변경 1개')).toBeInTheDocument()
    fireEvent.click(screen.getByText('저장'))
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith('/api/admin/site-info', { 'home.hero_title': '새 문구' }))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('저장되었습니다.'))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
    expect(screen.getByText('저장하지 않은 변경 0개')).toBeInTheDocument()
  })

  it('shows 400 errors and keeps input', async () => {
    axios.put.mockRejectedValue({ response: { status: 400, data: { status: 'fail', errors: { 'contact.email': '이메일 형식이 올바르지 않습니다.' } } } })
    setup()
    const email = await screen.findByLabelText('문의 이메일')
    fireEvent.change(email, { target: { value: 'bad' } })
    fireEvent.click(screen.getByText('저장'))
    expect(await screen.findByText('이메일 형식이 올바르지 않습니다.')).toBeInTheDocument()
    expect(screen.getByLabelText('문의 이메일')).toHaveValue('bad')
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('alerts on other failures and keeps draft', async () => {
    axios.put.mockRejectedValue({ response: { status: 500 } })
    setup()
    fireEvent.change(await screen.findByLabelText('히어로 제목'), { target: { value: 'x' } })
    fireEvent.click(screen.getByText('저장'))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('저장 실패'))
    expect(screen.getByLabelText('히어로 제목')).toHaveValue('x')
  })

  it('prevents double submit', async () => {
    let resolve
    axios.put.mockReturnValue(new Promise((r) => { resolve = r }))
    setup()
    fireEvent.change(await screen.findByLabelText('히어로 제목'), { target: { value: 'x' } })
    const btn = screen.getByText('저장')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(axios.put).toHaveBeenCalledTimes(1)
    resolve({ data: { status: 'success', data: { ...SERVER, 'home.hero_title': 'x' } } })
    await waitFor(() => expect(window.alert).toHaveBeenCalled())
  })

  it('sends return_days as a number and never system.snowfall', async () => {
    axios.put.mockResolvedValue({ data: { status: 'success', data: { ...SERVER, 'rental.return_days': 7 } } })
    setup()
    fireEvent.change(await screen.findByLabelText('반납 기간(일)'), { target: { value: '7' } })
    fireEvent.click(screen.getByText('저장'))
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith('/api/admin/site-info', { 'rental.return_days': 7 }))
  })

  it('detects link list changes deeply', async () => {
    setup()
    await screen.findByLabelText('히어로 제목')
    fireEvent.click(screen.getByLabelText('1번째 링크 삭제'))
    expect(screen.getByText('저장하지 않은 변경 1개')).toBeInTheDocument()
  })

  it('shows in-page error with retry when initial load fails', async () => {
    axios.get.mockImplementation((url) =>
      url === '/api/site-info' ? Promise.reject(new Error('x')) : Promise.resolve({ data: [] })
    )
    setup()
    expect(await screen.findByText('정보를 불러오지 못했습니다.')).toBeInTheDocument()
    expect(window.alert).not.toHaveBeenCalled()
    axios.get.mockImplementation((url) =>
      Promise.resolve({ data: url === '/api/site-info' ? { status: 'success', data: structuredClone(SERVER) } : [] })
    )
    fireEvent.click(screen.getByText('다시 시도'))
    expect(await screen.findByLabelText('히어로 제목')).toBeInTheDocument()
  })

  it('shows server auth message on 401/403 save failure', async () => {
    axios.put.mockRejectedValue({ response: { status: 403, data: { message: '마스터 권한이 필요합니다.' } } })
    setup()
    fireEvent.change(await screen.findByLabelText('히어로 제목'), { target: { value: '바뀜' } })
    fireEvent.click(screen.getByText('저장'))
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('마스터 권한이 필요합니다.'))
  })
})
