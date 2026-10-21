import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { DEFAULT_SITE_INFO } from '@/config/siteDefaults'
import { mergeSiteInfo } from '@/lib/siteInfo'

const SiteInfoContext = createContext({ info: DEFAULT_SITE_INFO, refresh: () => Promise.resolve() })

export function SiteInfoProvider({ children }) {
  const [info, setInfo] = useState(DEFAULT_SITE_INFO)

  const refresh = useCallback(async () => {
    try {
      const res = await axios.get('/api/site-info')
      if (res.data && res.data.status === 'success') {
        setInfo(mergeSiteInfo(DEFAULT_SITE_INFO, res.data.data))
      }
    } catch (err) {
      console.error('사이트 정보를 불러오지 못했습니다.', err)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh() }, [refresh])

  const value = useMemo(() => ({ info, refresh }), [info, refresh])
  return <SiteInfoContext.Provider value={value}>{children}</SiteInfoContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteInfo = () => useContext(SiteInfoContext)
