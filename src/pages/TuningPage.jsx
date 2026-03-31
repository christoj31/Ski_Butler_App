import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/common/BottomNav'

const MOCK_LEADERBOARD = [
  { name: 'Christo',  weekly: 47 },
  { name: 'Jake',     weekly: 41 },
  { name: 'Maria',    weekly: 38 },
  { name: 'Devon',    weekly: 29 },
  { name: 'Sam',      weekly: 22 },
]

const MEDAL = ['🥇', '🥈', '🥉']

export default function TuningPage() {
  const { currentUser } = useAuth()
  const [inventoryNumber, setInventoryNumber] = useState('')
  const [shiftCount, setShiftCount] = useState(0)
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD)
  const [flash, setFlash] = useState(false)

  function handleSubmit() {
    if (!inventoryNumber.trim()) return
    const username = currentUser?.username || 'Christo'
    setShiftCount(c => c + 1)
    setLeaderboard(prev => {
      const idx = prev.findIndex(e => e.name === username)
      if (idx === -1) return prev
      const updated = prev.map((e, i) => i === idx ? { ...e, weekly: e.weekly + 1 } : e)
      return [...updated].sort((a, b) => b.weekly - a.weekly)
    })
    setInventoryNumber('')
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="page" data-testid="tuning-page">
      <header style={styles.header}>
        <div style={styles.title}>Tuning</div>
      </header>

      {/* Input */}
      <div style={styles.inputSection}>
        <label style={styles.label} htmlFor="tuning-inventory">
          Enter Tuned Ski Inventory Number:
        </label>
        <div style={styles.inputRow}>
          <input
            id="tuning-inventory"
            data-testid="tuning-inventory-input"
            type="text"
            value={inventoryNumber}
            onChange={e => setInventoryNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 26001"
            style={styles.input}
          />
          <button
            onClick={handleSubmit}
            style={{ ...styles.submitBtn, opacity: inventoryNumber.trim() ? 1 : 0.4 }}
            disabled={!inventoryNumber.trim()}
          >
            ✓
          </button>
        </div>
      </div>

      {/* Shift counter */}
      <div style={{ ...styles.shiftCard, borderColor: flash ? '#22c55e' : '#3a4055' }}>
        <div style={styles.shiftLabel}>Skis Tuned This Shift</div>
        <div style={{ ...styles.shiftCount, color: flash ? '#22c55e' : '#FFD700' }}>
          {shiftCount}
        </div>
      </div>

      {/* Leaderboard */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>This Week's Top Tuners</div>
        {leaderboard.map((entry, idx) => {
          const isMe = entry.name === (currentUser?.username || 'Christo')
          return (
            <div key={entry.name} style={{ ...styles.row, backgroundColor: isMe ? '#1f2a1f' : '#2e3448', borderColor: isMe ? '#22c55e' : 'transparent' }}>
              <span style={styles.rank}>
                {idx < 3 ? MEDAL[idx] : <span style={styles.rankNum}>{idx + 1}</span>}
              </span>
              <span style={{ ...styles.entryName, color: isMe ? '#22c55e' : '#fff' }}>
                {entry.name}{isMe ? ' (you)' : ''}
              </span>
              <span style={styles.count}>{entry.weekly}</span>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}

const styles = {
  header: {
    marginBottom: '20px',
    paddingTop: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
  },
  shiftCard: {
    backgroundColor: '#2e3448',
    borderRadius: '14px',
    border: '2px solid',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    transition: 'border-color 0.3s',
  },
  shiftLabel: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  shiftCount: {
    fontSize: '48px',
    fontWeight: '900',
    lineHeight: 1,
    transition: 'color 0.3s',
  },
  section: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '4px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '10px',
    border: '1px solid',
    padding: '12px 14px',
  },
  rank: {
    fontSize: '22px',
    width: '28px',
    textAlign: 'center',
    flexShrink: 0,
  },
  rankNum: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#9aa0b4',
  },
  entryName: {
    flex: 1,
    fontSize: '16px',
    fontWeight: '700',
  },
  count: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#FFD700',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '32px',
  },
  label: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    minHeight: '52px',
    backgroundColor: '#2e3448',
    border: '1px solid #3a4055',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '18px',
    padding: '12px 16px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  submitBtn: {
    minHeight: '52px',
    minWidth: '52px',
    backgroundColor: '#22c55e',
    border: 'none',
    borderRadius: '10px',
    fontSize: '22px',
    color: '#fff',
    fontWeight: '900',
    cursor: 'pointer',
    flexShrink: 0,
  },
}
