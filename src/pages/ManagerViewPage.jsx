import { useState } from 'react'
import { MOCK_EMPLOYEES } from '../data/mockEmployees'
import { MOCK_FEEDBACK } from '../data/mockFeedback'
import { MOCK_FINANCIALS } from '../data/mockFinancials'
import BottomNav from '../components/common/BottomNav'

const PERIODS = [
  { key: 'today',  label: 'Today' },
  { key: 'week',   label: 'This Week' },
  { key: 'month',  label: 'This Month' },
  { key: 'season', label: 'Season' },
]

const SORT_OPTIONS = [
  { key: 'tips', label: 'Tips' },
  { key: 'skis', label: 'Skis Tuned' },
  { key: 'name', label: 'Name' },
]

const ROLE_COLORS = {
  TL:   { bg: 'rgba(255,215,0,0.12)', border: '#FFD700', text: '#FFD700' },
  Tech: { bg: 'rgba(148,163,184,0.1)', border: '#3a4055', text: '#9aa0b4' },
}

export default function ManagerViewPage() {
  const [period, setPeriod] = useState('week')
  const [sortBy, setSortBy] = useState('tips')
  const [filterRole, setFilterRole] = useState('All')
  const [showAllFeedback, setShowAllFeedback] = useState(false)

  const getStats = emp => emp.stats[period]

  const filtered = MOCK_EMPLOYEES.filter(e => filterRole === 'All' || e.role === filterRole)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'tips') return getStats(b).tips - getStats(a).tips
    if (sortBy === 'skis') return getStats(b).skisTuned - getStats(a).skisTuned
    return a.name.localeCompare(b.name)
  })

  const totalTips = filtered.reduce((s, e) => s + getStats(e).tips, 0)
  const totalSkis = filtered.reduce((s, e) => s + getStats(e).skisTuned, 0)
  const totalDeliveries = filtered.reduce((s, e) => s + getStats(e).deliveries, 0)

  return (
    <div className="page" data-testid="manager-view-page">
      <header style={styles.header}>
        <div style={styles.title}>Manager View</div>
      </header>

      {/* Period selector */}
      <div style={styles.periodRow}>
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              ...styles.periodBtn,
              backgroundColor: period === p.key ? '#FFD700' : '#2e3448',
              color: period === p.key ? '#000' : '#9aa0b4',
              fontWeight: period === p.key ? '800' : '600',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary strip */}
      <div style={styles.summaryStrip}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryValue}>${totalTips.toLocaleString()}</span>
          <span style={styles.summaryLabel}>Tips</span>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <span style={styles.summaryValue}>{totalSkis}</span>
          <span style={styles.summaryLabel}>Skis Tuned</span>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <span style={styles.summaryValue}>{totalDeliveries}</span>
          <span style={styles.summaryLabel}>Deliveries</span>
        </div>
      </div>

      {/* Filters + Sort */}
      <div style={styles.controls}>
        <div style={styles.roleToggle}>
          {['All', 'TL', 'Tech'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              style={{
                ...styles.roleBtn,
                backgroundColor: filterRole === r ? '#3a4055' : 'transparent',
                color: filterRole === r ? '#fff' : '#9aa0b4',
                fontWeight: filterRole === r ? '800' : '600',
                borderColor: filterRole === r ? '#9aa0b4' : '#3a4055',
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              style={{
                ...styles.sortBtn,
                borderColor: sortBy === opt.key ? '#FFD700' : '#3a4055',
                color: sortBy === opt.key ? '#FFD700' : '#9aa0b4',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Employee list */}
      <div style={styles.list}>
        {sorted.map((emp, idx) => {
          const s = getStats(emp)
          const roleStyle = ROLE_COLORS[emp.role] || ROLE_COLORS.Tech
          return (
            <div key={emp.employeeId} style={styles.card} data-testid={`employee-card-${emp.employeeId}`}>
              <div style={styles.rankCol}>
                <span style={styles.rank}>#{idx + 1}</span>
                <div style={styles.avatar}>{emp.avatarInitials}</div>
              </div>

              <div style={styles.info}>
                <div style={styles.empName}>{emp.name}</div>
                <span style={{
                  ...styles.roleBadge,
                  backgroundColor: roleStyle.bg,
                  borderColor: roleStyle.border,
                  color: roleStyle.text,
                }}>
                  {emp.role}
                </span>
              </div>

              <div style={styles.stats}>
                <div style={styles.statItem}>
                  <span style={styles.statValue}>${s.tips.toLocaleString()}</span>
                  <span style={styles.statLabel}>Tips</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statItem}>
                  <span style={styles.statValue}>{s.skisTuned}</span>
                  <span style={styles.statLabel}>Tuned</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Financials */}
      {(() => {
        const fin = MOCK_FINANCIALS[period]
        const maxVal = Math.max(...fin.chartData.map(d => d.value), 1)
        return (
          <div style={styles.financialsSection}>
            <div style={styles.sectionTitle}>Financials</div>

            {/* Stat row */}
            <div style={styles.finStatRow}>
              <div style={styles.finStatCard}>
                <span style={styles.finStatValue}>{fin.deliveries}</span>
                <span style={styles.finStatLabel}>Deliveries</span>
              </div>
              <div style={styles.finStatCard}>
                <span style={styles.finStatValue}>{fin.renters.toLocaleString()}</span>
                <span style={styles.finStatLabel}>Renters</span>
              </div>
              <div style={styles.finStatCard}>
                <span style={{ ...styles.finStatValue, color: '#22c55e' }}>
                  ${fin.actualRevenue.toLocaleString()}
                </span>
                <span style={styles.finStatLabel}>Revenue</span>
              </div>
              <div style={styles.finStatCard}>
                <span style={{ ...styles.finStatValue, color: '#9aa0b4' }}>
                  ${fin.projectedRevenue.toLocaleString()}
                </span>
                <span style={styles.finStatLabel}>Projected</span>
              </div>
            </div>

            {/* Bar chart */}
            <div style={styles.chartCard}>
              <div style={styles.chartLabel}>{fin.chartLabel}</div>
              <div style={styles.chartBars}>
                {fin.chartData.map(d => (
                  <div key={d.label} style={styles.barCol}>
                    <span style={styles.barValue}>
                      {d.value >= 1000 ? `$${(d.value / 1000).toFixed(1)}k` : d.value > 0 ? `$${d.value}` : '—'}
                    </span>
                    <div style={styles.barTrack}>
                      <div style={{
                        ...styles.barFill,
                        height: `${Math.round((d.value / maxVal) * 100)}%`,
                        backgroundColor: d.value === Math.max(...fin.chartData.map(x => x.value)) ? '#FFD700' : '#3a6bff',
                      }} />
                    </div>
                    <span style={styles.barLabel}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Feedback */}
      <div style={styles.feedbackSection}>
        <div style={styles.sectionTitle}>Employee Feedback</div>

        {(showAllFeedback ? MOCK_FEEDBACK : MOCK_FEEDBACK.slice(0, 3)).map(fb => (
          <div key={fb.feedbackId} style={styles.feedbackCard}>
            <div style={styles.feedbackHeader}>
              <div style={{
                ...styles.feedbackAvatar,
                backgroundColor: fb.anonymous ? '#2e3448' : '#3a4055',
              }}>
                {fb.anonymous ? '?' : fb.authorInitials}
              </div>
              <div style={styles.feedbackMeta}>
                <span style={styles.feedbackAuthor}>
                  {fb.anonymous ? 'Anonymous' : fb.authorName}
                </span>
                <span style={styles.feedbackDate}>
                  {new Date(fb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div style={styles.feedbackSubject}>{fb.subject}</div>
            <p style={{ ...styles.feedbackMessage, whiteSpace: 'pre-line' }}>{fb.message}</p>
          </div>
        ))}

        <button
          onClick={() => setShowAllFeedback(v => !v)}
          style={styles.showMoreBtn}
        >
          <span>{showAllFeedback ? 'Show Less' : `Show More (${MOCK_FEEDBACK.length - 3} more)`}</span>
          <span style={{
            ...styles.showMoreChevron,
            transform: showAllFeedback ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>▼</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

const styles = {
  header: {
    marginBottom: '14px',
    paddingTop: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
  },
  periodRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '14px',
  },
  periodBtn: {
    flex: 1,
    minHeight: '40px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  summaryStrip: {
    backgroundColor: '#242938',
    borderRadius: '12px',
    border: '1px solid #3a4055',
    display: 'flex',
    alignItems: 'center',
    padding: '14px 0',
    marginBottom: '14px',
  },
  summaryItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#FFD700',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryDivider: {
    width: '1px',
    height: '36px',
    backgroundColor: '#3a4055',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px',
  },
  roleToggle: {
    display: 'flex',
    gap: '8px',
  },
  roleBtn: {
    flex: 1,
    minHeight: '38px',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'none',
  },
  sortRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sortLabel: {
    fontSize: '12px',
    color: '#9aa0b4',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginRight: '2px',
  },
  sortBtn: {
    background: 'none',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    padding: '5px 10px',
    cursor: 'pointer',
    minHeight: '32px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#242938',
    borderRadius: '12px',
    border: '1px solid #3a4055',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    minHeight: '72px',
  },
  rankCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
    width: '36px',
  },
  rank: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9aa0b4',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3a4055',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  empName: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#fff',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1px',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid',
    textTransform: 'uppercase',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  statDivider: {
    width: '1px',
    height: '28px',
    backgroundColor: '#3a4055',
  },
  financialsSection: {
    marginBottom: '28px',
  },
  finStatRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  },
  finStatCard: {
    backgroundColor: '#242938',
    borderRadius: '10px',
    border: '1px solid #3a4055',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
  },
  finStatValue: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#FFD700',
  },
  finStatLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#242938',
    borderRadius: '12px',
    border: '1px solid #3a4055',
    padding: '16px',
  },
  chartLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    height: '120px',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    gap: '4px',
  },
  barValue: {
    fontSize: '9px',
    color: '#9aa0b4',
    fontWeight: '600',
    height: '14px',
    lineHeight: '14px',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1a1f2e',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: '4px 4px 0 0',
    minHeight: '2px',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    fontSize: '10px',
    color: '#9aa0b4',
    fontWeight: '600',
    height: '14px',
    lineHeight: '14px',
  },
  feedbackSection: {
    marginTop: '8px',
    paddingBottom: '88px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '12px',
  },
  feedbackCard: {
    backgroundColor: '#242938',
    borderRadius: '12px',
    border: '1px solid #3a4055',
    padding: '14px 16px',
    marginBottom: '10px',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  feedbackAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#3a4055',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feedbackMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  feedbackAuthor: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#fff',
  },
  feedbackDate: {
    fontSize: '12px',
    color: '#9aa0b4',
  },
  feedbackSubject: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '6px',
  },
  feedbackMessage: {
    fontSize: '14px',
    color: '#c8cdd8',
    lineHeight: '1.5',
    margin: 0,
  },
  showMoreBtn: {
    width: '100%',
    minHeight: '48px',
    backgroundColor: '#242938',
    border: '1px solid #3a4055',
    borderRadius: '10px',
    color: '#9aa0b4',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  showMoreChevron: {
    fontSize: '12px',
    transition: 'transform 0.2s',
    display: 'inline-block',
  },
}
