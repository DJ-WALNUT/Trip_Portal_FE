export const ADMIN_NAV = [
  {
    group: null,
    items: [{ to: '/admin/dashboard', label: '대시보드', icon: 'chart' }],
  },
  {
    group: '콘텐츠',
    items: [
      { to: '/admin/site-info', label: '정보 관리', icon: 'settings', masterOnly: true },
      { to: '/admin/notices', label: '공지사항', icon: 'megaphone' },
      { to: '/admin/instagram', label: '인스타 관리', icon: 'camera', masterOnly: true },
      { to: '/admin/teaser', label: '티저 이벤트', icon: 'sparkle', masterOnly: true },
    ],
  },
  {
    group: '대여 사업',
    items: [
      { to: '/admin/borrow/approve', label: '대여 승인', icon: 'bell', badge: 'pending' },
      { to: '/admin/borrow/return', label: '반납 관리', icon: 'archive' },
      { to: '/admin/borrow/stock', label: '재고 관리', icon: 'box' },
      { to: '/admin/borrow/log', label: '전체 기록', icon: 'history' },
    ],
  },
]

export function getAdminNav(role) {
  return ADMIN_NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.masterOnly || role === 'master'),
  })).filter((g) => g.items.length > 0)
}
