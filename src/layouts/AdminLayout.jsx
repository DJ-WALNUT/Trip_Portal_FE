import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Menu, X, PanelLeftClose, PanelLeftOpen, LogOut, ExternalLink } from 'lucide-react'
import LucianIcon from '@/components/icons/LucianIcon'
import { readBool, writeBool } from '@/lib/safeStorage'
import { ADMIN_NAV, getAdminNav } from './adminNav'
import { AdminProvider, useAdmin } from './AdminContext'
import './AdminLayout.css'

function AdminShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pendingCount, refreshPendingCount } = useAdmin()
  const [collapsed, setCollapsed] = useState(() => readBool('adminSidebarCollapsed', false))
  // 서랍이 열린 경로를 기억해 두면 경로가 바뀔 때 자동으로 닫힌 상태가 된다.
  const [drawerPath, setDrawerPath] = useState(null)
  const drawerOpen = drawerPath === location.pathname
  let adminRole = null
  try {
    adminRole = localStorage.getItem('adminRole')
  } catch {
    adminRole = null
  }
  const nav = getAdminNav(adminRole)

  useEffect(() => {
    refreshPendingCount()
  }, [refreshPendingCount])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerPath(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    writeBool('adminSidebarCollapsed', next)
  }

  const currentItem = ADMIN_NAV.flatMap((g) => g.items).find(
    (i) => location.pathname === i.to || location.pathname.startsWith(`${i.to}/`),
  )
  const title = currentItem ? currentItem.label : '관리자'

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        // 도메인 없이 경로만 적으면 Proxy나 현재 도메인을 따라갑니다.
        await axios.post('/api/admin/logout')
      } catch (error) {
        console.error('로그아웃 요청 실패:', error)
        // 서버 에러가 나더라도 클라이언트단 로그아웃은 진행하도록 함
      }

      // 클라이언트 세션 정리 및 이동
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('adminRole') // 역할 정보 삭제
      alert('로그아웃 되었습니다.')
      navigate('/') // 메인 페이지로 이동
    }
  }

  const tip = (label) => (collapsed ? { title: label, 'aria-label': label } : {})

  return (
    <div className={`admin-layout${collapsed ? ' is-collapsed' : ''}`}>
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-icon-btn"
          aria-label={drawerOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerPath(drawerOpen ? null : location.pathname)}
        >
          {drawerOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="admin-topbar-title">{title}</h1>
      </header>

      <div className="admin-drawer" data-drawer={drawerOpen ? 'open' : 'closed'}>
        <div className="admin-overlay" onClick={() => setDrawerPath(null)} aria-hidden="true" />
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="admin-brand-text">Trip 관리자</span>
            <button
              type="button"
              className="admin-icon-btn admin-collapse-btn"
              aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
              onClick={toggleCollapsed}
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          <nav className="admin-nav" aria-label="관리자 메뉴">
            {nav.map((g) => (
              <div className="admin-nav-group" key={g.group ?? 'root'}>
                {g.group && <div className="admin-nav-group-label">{g.group}</div>}
                {g.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `admin-nav-item${isActive ? ' is-active' : ''}`}
                    {...tip(item.label)}
                  >
                    <LucianIcon
                      name={item.icon}
                      size={22}
                      state={item.badge === 'pending' ? (pendingCount > 0 ? 'unread' : 'idle') : undefined}
                    />
                    <span className="admin-nav-label">{item.label}</span>
                    {item.badge === 'pending' && pendingCount > 0 && (
                      <span className="admin-nav-badge">{pendingCount}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-foot">
            <Link to="/" className="admin-nav-item" {...tip('사용자 홈')}>
              <LucianIcon name="home" size={22} />
              <span className="admin-nav-label">사용자 홈</span>
              <ExternalLink size={14} className="admin-nav-ext" />
            </Link>
            <button type="button" className="admin-nav-item admin-logout" onClick={handleLogout} {...tip('로그아웃')}>
              <LogOut size={20} />
              <span className="admin-nav-label">로그아웃</span>
            </button>
          </div>
        </aside>
      </div>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  )
}
