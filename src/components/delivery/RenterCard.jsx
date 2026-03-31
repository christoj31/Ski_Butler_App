import { useState } from 'react'
import BootSelector from './BootSelector'
import WaiverModal from './WaiverModal'
import EquipmentInfoModal from './EquipmentInfoModal'
import { shoeToMondo } from '../../utils/mondoSizing'
import { calculateDIN, recommendedPoleLength } from '../../utils/dinCalculator'

export default function RenterCard({ renter, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [waiverOpen, setWaiverOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const bootSizes = renter.bootSizes || shoeToMondo(renter.shoeSizeUS || 9)
  const poleLength = recommendedPoleLength(renter.heightFt || 5, renter.heightIn || 8)
  const din = calculateDIN(
    renter.weightLbs || 150,
    renter.heightFt || 5,
    renter.heightIn || 8,
    renter.ability || 'intermediate'
  )
  const isSnowboard = renter.packageId?.includes('snowboard')

  function handleSignWaiver() {
    onUpdate(renter.renterId, {
      waiverSigned: true,
      waiverSignedAt: new Date().toISOString(),
    })
    setWaiverOpen(false)
  }

  function handleInventoryChange(e) {
    onUpdate(renter.renterId, { inventoryNumber: e.target.value })
  }

  return (
    <div style={styles.card} data-testid={`renter-card-${renter.renterId}`}>
      {/* Header */}
      <button
        style={styles.header}
        onClick={() => setExpanded(e => !e)}
        data-testid={`renter-toggle-${renter.renterId}`}
        aria-expanded={expanded}
      >
        <span style={styles.name}>{renter.name}</span>
        <div style={styles.headerRight}>
          {renter.waiverSigned && (
            <span style={styles.check} data-testid={`waiver-signed-${renter.renterId}`}>✓</span>
          )}
          <span style={{ ...styles.chevron, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={styles.body} data-testid={`renter-body-${renter.renterId}`}>
          {/* Equipment row */}
          <div style={styles.equipRow}>
            <div style={styles.imgPlaceholder}>🎿</div>
            <div style={styles.equipInfo}>
              <div style={styles.packageName}>{renter.packageName || renter.packageId}</div>
              <div style={styles.inventoryRow}>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="Inventory #"
                  value={renter.inventoryNumber || ''}
                  onChange={handleInventoryChange}
                  style={styles.inventoryInput}
                  data-testid={`inventory-input-${renter.renterId}`}
                />
                <button
                  onClick={() => setInfoOpen(true)}
                  style={styles.infoBtn}
                  aria-label="More info"
                  data-testid={`info-btn-${renter.renterId}`}
                >
                  ⓘ
                </button>
              </div>
            </div>
          </div>

          {/* Boot selector */}
          <BootSelector
            bootSizes={bootSizes}
            recommendedIndex={0}
            selectedSize={renter.selectedBootSize}
            onSelect={size => onUpdate(renter.renterId, { selectedBootSize: size })}
          />

          {/* Poles / Bindings */}
          {!isSnowboard && (
            <div style={styles.specRow}>
              <span style={styles.specLabel}>Poles</span>
              <span style={styles.specValue}>{poleLength}cm</span>
            </div>
          )}
          {isSnowboard ? (
            <div style={styles.specRow}>
              <span style={styles.specLabel}>Bindings DIN</span>
              <span style={styles.specValue}>{din.min}–{din.max}</span>
            </div>
          ) : (
            <div style={styles.specRow}>
              <span style={styles.specLabel}>Binding DIN</span>
              <span style={styles.specValue}>{din.recommended.toFixed(1)} (rec)</span>
            </div>
          )}

          {/* Sign Waiver button — only after boot selected */}
          {renter.selectedBootSize && !renter.waiverSigned && (
            <button
              className="btn btn-primary"
              onClick={() => setWaiverOpen(true)}
              data-testid={`sign-waiver-btn-${renter.renterId}`}
              style={{ marginTop: '12px' }}
            >
              Sign Waiver
            </button>
          )}

          {renter.waiverSigned && (
            <div style={styles.signedBanner} data-testid={`signed-banner-${renter.renterId}`}>
              ✓ Waiver Signed
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <WaiverModal
        isOpen={waiverOpen}
        onClose={() => setWaiverOpen(false)}
        onSign={handleSignWaiver}
        renterName={renter.name}
      />
      <EquipmentInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        packageId={renter.packageId}
        inventoryNumber={renter.inventoryNumber}
      />
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#1a1f2e',
    borderRadius: '10px',
    border: '1px solid #3a4055',
    marginBottom: '10px',
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    background: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    minHeight: '60px',
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  name: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
  },
  check: {
    color: '#22c55e',
    fontSize: '20px',
    fontWeight: '900',
  },
  chevron: {
    fontSize: '24px',
    color: '#9aa0b4',
    transition: 'transform 0.2s',
    display: 'inline-block',
  },
  body: {
    padding: '0 16px 16px',
    borderTop: '1px solid #3a4055',
  },
  equipRow: {
    display: 'flex',
    gap: '12px',
    paddingTop: '14px',
    alignItems: 'flex-start',
  },
  imgPlaceholder: {
    fontSize: '36px',
    width: '60px',
    height: '60px',
    backgroundColor: '#2e3448',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  equipInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  packageName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
  },
  inventoryRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  inventoryInput: {
    flex: 1,
    minHeight: '40px',
    fontSize: '16px',
    letterSpacing: '3px',
  },
  infoBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    color: '#FFD700',
    minHeight: '40px',
    minWidth: '40px',
    cursor: 'pointer',
    padding: '0',
    flexShrink: 0,
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #2e3448',
  },
  specLabel: {
    fontSize: '13px',
    color: '#9aa0b4',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  specValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
  },
  signedBanner: {
    marginTop: '12px',
    backgroundColor: 'rgba(34,197,94,0.15)',
    border: '1px solid #22c55e',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#22c55e',
    fontWeight: '700',
    fontSize: '15px',
    textAlign: 'center',
  },
}
