import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import axios from 'axios'

const AdminContext = createContext({ pendingCount: 0, refreshPendingCount: async () => {} })

export function AdminProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0)

  const refreshPendingCount = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/requests')
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        setPendingCount(res.data.data.length)
      }
    } catch {
      // 조용히 실패하고 이전 값을 유지한다
    }
  }, [])

  const value = useMemo(() => ({ pendingCount, refreshPendingCount }), [pendingCount, refreshPendingCount])
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  return useContext(AdminContext)
}
