import Modal from '../common/Modal'

const EQUIPMENT_INFO = {
  'basic-ski': {
    name: 'Basic Ski Package',
    specs: 'All-mountain recreational ski | 150–170cm',
    description: 'Great for beginners and casual skiers. Includes skis, boots, and poles.',
  },
  'signature-ski': {
    name: 'Signature Ski Package',
    specs: 'Mid-performance all-mountain ski | 155–175cm',
    description: 'Ideal for intermediate skiers looking for improved control and responsiveness.',
  },
  'performance-ski': {
    name: 'Performance Ski Package',
    specs: 'High-performance carving ski | 160–185cm',
    description: 'Built for advanced and expert skiers. Maximum edge grip and precision.',
  },
  'basic-snowboard': {
    name: 'Basic Snowboard Package',
    specs: 'All-mountain snowboard | 148–158cm',
    description: 'Perfect for all levels. Includes board and boots.',
  },
  'signature-snowboard': {
    name: 'Signature Snowboard Package',
    specs: 'Mid-performance all-mountain board | 150–160cm',
    description: 'Enhanced flex and pop for intermediate to advanced riders.',
  },
}

export default function EquipmentInfoModal({ isOpen, onClose, packageId, inventoryNumber }) {
  const info = EQUIPMENT_INFO[packageId] || {
    name: 'Equipment',
    specs: '—',
    description: 'No details available.',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Equipment Info">
      <div style={styles.container}>
        <div style={styles.inventoryRow}>
          <span style={styles.label}>Inventory #</span>
          <span style={styles.invNum}>{inventoryNumber || '—'}</span>
        </div>
        <h3 style={styles.equipName}>{info.name}</h3>
        <p style={styles.specs}>{info.specs}</p>
        <p style={styles.description}>{info.description}</p>
      </div>
    </Modal>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inventoryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#9aa0b4', fontSize: '13px' },
  invNum: { fontSize: '18px', fontWeight: '700', color: '#FFD700', letterSpacing: '2px' },
  equipName: { fontSize: '18px', fontWeight: '700', color: '#fff' },
  specs: { fontSize: '14px', color: '#FFD700' },
  description: { fontSize: '14px', color: '#9aa0b4', lineHeight: 1.6 },
}
