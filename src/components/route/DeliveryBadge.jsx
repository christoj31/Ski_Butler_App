export default function DeliveryBadge({ type }) {
  const isExpress = type === 'EXPRESS'
  return (
    <span style={{
      ...styles.badge,
      backgroundColor: isExpress ? '#2e3448' : '#1a2e1a',
      color: isExpress ? '#FFD700' : '#22c55e',
      border: `1px solid ${isExpress ? '#FFD700' : '#22c55e'}`,
    }}>
      {type}
    </span>
  )
}

const styles = {
  badge: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
}
