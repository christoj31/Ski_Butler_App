export default function ShiftToggle({ shift, onChange }) {
  return (
    <div style={styles.container} role="group" aria-label="Shift selector">
      {['AM', 'PM'].map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          aria-pressed={shift === s}
          data-testid={`shift-${s.toLowerCase()}`}
          style={{
            ...styles.btn,
            backgroundColor: shift === s ? '#FFD700' : '#2e3448',
            color: shift === s ? '#000' : '#9aa0b4',
            fontWeight: shift === s ? '800' : '600',
          }}
        >
          {s}
          <span style={styles.time}>
            {s === 'AM' ? '7AM–2PM' : '2PM–10PM'}
          </span>
        </button>
      ))}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  btn: {
    flex: 1,
    minHeight: '48px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    cursor: 'pointer',
    padding: '8px',
  },
  time: {
    fontSize: '11px',
    fontWeight: '400',
    opacity: 0.8,
  },
}
