import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Schedule', icon: '📅', path: '/home', testId: 'nav-schedule' },
  { label: 'Search', icon: '🔍', path: '/search', testId: 'nav-search' },
  { label: 'Packing', icon: '📦', path: '/packing', testId: 'nav-packing' },
  { label: 'New', icon: '➕', path: '/new', testId: 'nav-new' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={styles.nav} aria-label="Bottom navigation" data-testid="bottom-nav">
      {NAV_ITEMS.map(item => {
        const active = pathname === item.path || (item.path === '/home' && pathname === '/')
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            data-testid={item.testId}
            style={{
              ...styles.item,
              color: active ? '#FFD700' : '#9aa0b4',
            }}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={{ ...styles.label, color: active ? '#FFD700' : '#9aa0b4' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '768px',
    height: '64px',
    backgroundColor: '#1a1f2e',
    borderTop: '1px solid #3a4055',
    display: 'flex',
    alignItems: 'stretch',
    zIndex: 100,
  },
  item: {
    flex: 1,
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    cursor: 'pointer',
    minHeight: '48px',
    padding: '4px 0',
  },
  icon: {
    fontSize: '20px',
    lineHeight: 1,
  },
  label: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
}
