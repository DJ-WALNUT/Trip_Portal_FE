import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'

vi.mock('axios', () => ({ default: { get: vi.fn() } }))
import axios from 'axios'
import { SiteInfoProvider, useSiteInfo } from './SiteInfoContext'
import { DEFAULT_SITE_INFO } from '@/config/siteDefaults'

function Probe() {
  const api = useSiteInfo()
  return <><p data-testid="t">{api.info['home.hero_title']}</p><button onClick={api.refresh}>r</button></>
}

describe('SiteInfoProvider', () => {
  beforeEach(() => { axios.get.mockReset() })

  it('starts with defaults then applies server values', async () => {
    axios.get.mockResolvedValue({ data: { status: 'success', data: { 'home.hero_title': 'X' } } })
    render(<SiteInfoProvider><Probe /></SiteInfoProvider>)
    expect(screen.getByTestId('t').textContent).toBe(DEFAULT_SITE_INFO['home.hero_title'])
    await waitFor(() => expect(screen.getByTestId('t').textContent).toBe('X'))
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get.mock.calls[0][0]).toBe('/api/site-info')
  })

  it('keeps defaults when the request fails', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    axios.get.mockRejectedValue(new Error('down'))
    render(<SiteInfoProvider><Probe /></SiteInfoProvider>)
    await waitFor(() => expect(err).toHaveBeenCalled())
    expect(screen.getByTestId('t').textContent).toBe(DEFAULT_SITE_INFO['home.hero_title'])
    err.mockRestore()
  })

  it('refresh requests again', async () => {
    axios.get.mockResolvedValue({ data: { status: 'success', data: {} } })
    render(<SiteInfoProvider><Probe /></SiteInfoProvider>)
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1))
    await act(async () => { fireEvent.click(screen.getByText('r')) })
    expect(axios.get).toHaveBeenCalledTimes(2)
  })
})
