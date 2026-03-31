export default function ShiftToggle({ shift, onChange, activeShift }) {
  return (
    <div style={styles.container} role="group" aria-label="Shift selector">
      {['AM', 'PM'].map(s => {
        const isSelected = shift === s
        const isActive = !activeShift || s === activeShift
        return (
          <button
            key={s}
            onClick={() => isActive && onChange(s)}
            disabled={!isActive}
            aria-pressed={isSelected}
            data-testid={`shift-${s.toLowerCase()}`}
            style={{
              ...styles.btn,
              backgroundColor: isSelected ? '#FFD700' : '#2e3448',
              color: isSelected ? '#000' : isActive ? '#9aa0b4' : '#3a4055',
              fontWeight: isSelected ? '800' : '600',
              opacity: isActive ? 1 : 0.4,
              cursor: isActive ? 'pointer' : 'not-allowed',
            }}
          >
            {s}
            <span style={styles.time}>
              {s === 'AM' ? '7AM–2PM' : '2PM–10PM'}
            </span>
          </button>
        )
      })}
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
