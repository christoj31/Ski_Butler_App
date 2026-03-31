import { formatBootSize } from '../../utils/mondoSizing'

export default function BootSelector({ bootSizes, recommendedIndex, selectedSize, onSelect }) {
  return (
    <div style={styles.container}>
      <p style={styles.label}>Select Boot Size</p>
      <div style={styles.options}>
        {bootSizes.map((size, idx) => {
          const isSelected = selectedSize === size
          const isRecommended = idx === recommendedIndex
          return (
            <button
              key={size}
              onClick={() => onSelect(size)}
              data-testid={`boot-size-${size}`}
              data-selected={isSelected}
              style={{
                ...styles.option,
                backgroundColor: isSelected ? '#FFD700' : (isRecommended ? '#2a2e1a' : '#2e3448'),
                color: isSelected ? '#000' : '#fff',
                border: isRecommended && !isSelected ? '2px solid #FFD700' : '2px solid transparent',
              }}
            >
              <span style={styles.size}>{formatBootSize(size)}</span>
              {isRecommended && (
                <span style={{ ...styles.rec, color: isSelected ? '#333' : '#FFD700' }}>
                  Recommended
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    margin: '12px 0',
  },
  label: {
    fontSize: '13px',
    color: '#9aa0b4',
    marginBottom: '8px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  options: {
    display: 'flex',
    gap: '10px',
  },
  option: {
    flex: 1,
    minHeight: '64px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px',
  },
  size: {
    fontSize: '22px',
    fontWeight: '800',
  },
  rec: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
}
