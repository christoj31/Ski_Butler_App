import { useState } from 'react'
import Modal from '../common/Modal'
import { ADD_ONS } from '../../data/mockEquipment'

export default function AddEquipmentModal({ isOpen, onClose, reservation, onConfirm, onRemove }) {
  const [step, setStep] = useState(1)
  const [selectedRenterId, setSelectedRenterId] = useState(null)
  const [mode, setMode] = useState(null) // 'add' | 'remove'
  const [selectedAddOns, setSelectedAddOns] = useState({})
  const [selectedToRemove, setSelectedToRemove] = useState(new Set())

  function reset() {
    setStep(1)
    setSelectedRenterId(null)
    setMode(null)
    setSelectedAddOns({})
    setSelectedToRemove(new Set())
  }

  function handleClose() {
    reset()
    onClose()
  }

  function chooseMode(m) {
    setMode(m)
    setStep(3)
  }

  function toggleAddOn(addOnId) {
    setSelectedAddOns(prev => {
      if (prev[addOnId]) {
        const next = { ...prev }
        delete next[addOnId]
        return next
      }
      return { ...prev, [addOnId]: { addOnId, size: null } }
    })
  }

  function setHelmetSize(size) {
    setSelectedAddOns(prev => ({
      ...prev,
      helmet: { ...(prev.helmet || { addOnId: 'helmet' }), size },
    }))
  }

  function toggleRemove(addOnId) {
    setSelectedToRemove(prev => {
      const next = new Set(prev)
      next.has(addOnId) ? next.delete(addOnId) : next.add(addOnId)
      return next
    })
  }

  function computeAddedCost() {
    return Object.keys(selectedAddOns).reduce((sum, id) => {
      const addOn = ADD_ONS.find(a => a.addOnId === id)
      return sum + (addOn ? addOn.pricePerDay : 0)
    }, 0)
  }

  function computeRemovedCost() {
    return [...selectedToRemove].reduce((sum, id) => {
      const ao = currentAddOns.find(a => a.addOnId === id)
      return sum + (ao?.pricePerDay || 0)
    }, 0)
  }

  function handleConfirm() {
    if (!selectedRenterId) return
    if (mode === 'add') {
      const addOnsToAdd = Object.values(selectedAddOns).map(ao => {
        const addOn = ADD_ONS.find(a => a.addOnId === ao.addOnId)
        return { ...ao, pricePerDay: addOn?.pricePerDay || 0 }
      })
      onConfirm(selectedRenterId, addOnsToAdd)
    } else {
      onRemove?.(selectedRenterId, [...selectedToRemove])
    }
    handleClose()
  }

  if (!reservation) return null

  const selectedRenter = reservation.renters.find(r => r.renterId === selectedRenterId)
  const currentAddOns = selectedRenter?.addOns || []
  const totalSteps = 4

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add / Remove Equipment">
      {/* Step dots */}
      <div style={styles.stepRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            ...styles.stepDot,
            backgroundColor: step > i ? '#FFD700' : '#3a4055',
          }} />
        ))}
      </div>

      {/* Step 1: Select renter */}
      {step === 1 && (
        <div data-testid="add-equipment-step-1">
          <p style={styles.stepLabel}>Select a renter</p>
          {reservation.renters.map(renter => (
            <button
              key={renter.renterId}
              onClick={() => { setSelectedRenterId(renter.renterId); setStep(2) }}
              data-testid={`select-renter-${renter.renterId}`}
              style={{
                ...styles.renterBtn,
                border: selectedRenterId === renter.renterId ? '2px solid #FFD700' : '1px solid #3a4055',
              }}
            >
              {renter.name}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Add or Remove */}
      {step === 2 && (
        <div data-testid="add-equipment-step-2">
          <p style={styles.stepLabel}>What would you like to do for <strong>{selectedRenter?.name}</strong>?</p>
          <div style={styles.modeRow}>
            <button
              onClick={() => chooseMode('add')}
              style={styles.modeBtn}
              data-testid="mode-add"
            >
              <span style={styles.modeIcon}>➕</span>
              <span style={styles.modeName}>Add Gear</span>
              <span style={styles.modeDesc}>Add a helmet, goggles, or upgrade</span>
            </button>
            <button
              onClick={() => chooseMode('remove')}
              style={{
                ...styles.modeBtn,
                opacity: currentAddOns.length === 0 ? 0.4 : 1,
                cursor: currentAddOns.length === 0 ? 'not-allowed' : 'pointer',
              }}
              disabled={currentAddOns.length === 0}
              data-testid="mode-remove"
            >
              <span style={styles.modeIcon}>➖</span>
              <span style={styles.modeName}>Remove Gear</span>
              <span style={styles.modeDesc}>
                {currentAddOns.length === 0 ? 'No extra gear on this order' : `${currentAddOns.length} item${currentAddOns.length !== 1 ? 's' : ''} on order`}
              </span>
            </button>
          </div>
          <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ marginTop: '16px', width: '100%' }}>
            Back
          </button>
        </div>
      )}

      {/* Step 3a: Add equipment */}
      {step === 3 && mode === 'add' && (
        <div data-testid="add-equipment-step-3-add">
          <p style={styles.stepLabel}>Add equipment for <strong>{selectedRenter?.name}</strong></p>
          {ADD_ONS.map(addOn => {
            const checked = !!selectedAddOns[addOn.addOnId]
            return (
              <div key={addOn.addOnId} style={styles.addOnItem}>
                <button
                  onClick={() => toggleAddOn(addOn.addOnId)}
                  data-testid={`addon-toggle-${addOn.addOnId}`}
                  style={{
                    ...styles.addOnBtn,
                    backgroundColor: checked ? '#2a2e1a' : '#242938',
                    border: checked ? '2px solid #FFD700' : '1px solid #3a4055',
                  }}
                >
                  <div style={styles.addOnLeft}>
                    <div style={styles.addOnCheck}>{checked ? '✓' : '○'}</div>
                    <div>
                      <div style={styles.addOnName}>{addOn.name}</div>
                      <div style={styles.addOnPrice}>${addOn.pricePerDay}/day</div>
                    </div>
                  </div>
                </button>
                {addOn.addOnId === 'helmet' && checked && (
                  <div style={styles.sizeRow} data-testid="helmet-size-selector">
                    {addOn.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setHelmetSize(size)}
                        data-testid={`helmet-size-${size}`}
                        style={{
                          ...styles.sizeBtn,
                          backgroundColor: selectedAddOns.helmet?.size === size ? '#FFD700' : '#2e3448',
                          color: selectedAddOns.helmet?.size === size ? '#000' : '#fff',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div style={styles.stepActions}>
            <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 0, minWidth: '80px' }}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(4)} style={{ flex: 1 }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3b: Remove equipment */}
      {step === 3 && mode === 'remove' && (
        <div data-testid="add-equipment-step-3-remove">
          <p style={styles.stepLabel}>Select gear to remove for <strong>{selectedRenter?.name}</strong></p>
          {currentAddOns.map(ao => {
            const addOnMeta = ADD_ONS.find(a => a.addOnId === ao.addOnId)
            const checked = selectedToRemove.has(ao.addOnId)
            return (
              <button
                key={ao.addOnId}
                onClick={() => toggleRemove(ao.addOnId)}
                data-testid={`remove-toggle-${ao.addOnId}`}
                style={{
                  ...styles.addOnBtn,
                  width: '100%',
                  marginBottom: '10px',
                  backgroundColor: checked ? '#2e1a1a' : '#242938',
                  border: checked ? '2px solid #ef4444' : '1px solid #3a4055',
                }}
              >
                <div style={styles.addOnLeft}>
                  <div style={{ ...styles.addOnCheck, color: checked ? '#ef4444' : '#9aa0b4' }}>
                    {checked ? '✕' : '○'}
                  </div>
                  <div>
                    <div style={styles.addOnName}>
                      {addOnMeta?.name || ao.addOnId}{ao.size ? ` — Size ${ao.size}` : ''}
                    </div>
                    <div style={styles.addOnPrice}>${ao.pricePerDay}/day</div>
                  </div>
                </div>
              </button>
            )
          })}
          <div style={styles.stepActions}>
            <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 0, minWidth: '80px' }}>Back</button>
            <button
              className="btn btn-primary"
              onClick={() => setStep(4)}
              disabled={selectedToRemove.size === 0}
              style={{ flex: 1, opacity: selectedToRemove.size === 0 ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div data-testid="add-equipment-step-4">
          <p style={styles.stepLabel}>Confirm changes for <strong>{selectedRenter?.name}</strong></p>

          {mode === 'add' && (
            <>
              {Object.keys(selectedAddOns).length === 0 ? (
                <p style={{ color: '#9aa0b4' }}>No add-ons selected.</p>
              ) : (
                Object.values(selectedAddOns).map(ao => {
                  const addOn = ADD_ONS.find(a => a.addOnId === ao.addOnId)
                  return (
                    <div key={ao.addOnId} style={styles.summaryRow}>
                      <span style={{ color: '#fff' }}>{addOn?.name}{ao.size ? ` (${ao.size})` : ''}</span>
                      <span style={{ color: '#22c55e' }}>+${addOn?.pricePerDay}/day</span>
                    </div>
                  )
                })
              )}
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Added cost</span>
                <span style={{ ...styles.totalValue, color: '#22c55e' }}>+${computeAddedCost()}/day</span>
              </div>
            </>
          )}

          {mode === 'remove' && (
            <>
              {[...selectedToRemove].map(id => {
                const ao = currentAddOns.find(a => a.addOnId === id)
                const addOnMeta = ADD_ONS.find(a => a.addOnId === id)
                return (
                  <div key={id} style={styles.summaryRow}>
                    <span style={{ color: '#fff' }}>{addOnMeta?.name || id}{ao?.size ? ` (${ao.size})` : ''}</span>
                    <span style={{ color: '#ef4444' }}>−${ao?.pricePerDay}/day</span>
                  </div>
                )
              })}
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Removed cost</span>
                <span style={{ ...styles.totalValue, color: '#ef4444' }}>−${computeRemovedCost()}/day</span>
              </div>
            </>
          )}

          <div style={styles.stepActions}>
            <button className="btn btn-secondary" onClick={() => setStep(3)} style={{ flex: 0, minWidth: '80px' }}>Back</button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              data-testid="confirm-add-equipment"
              style={{ flex: 1 }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

const styles = {
  stepRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  stepDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  stepLabel: {
    fontSize: '16px',
    color: '#fff',
    marginBottom: '14px',
  },
  renterBtn: {
    width: '100%',
    backgroundColor: '#242938',
    color: '#fff',
    fontSize: '17px',
    fontWeight: '600',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '8px',
    minHeight: '56px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  modeRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  modeBtn: {
    width: '100%',
    backgroundColor: '#242938',
    border: '1px solid #3a4055',
    borderRadius: '12px',
    padding: '18px 16px',
    minHeight: '80px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: 'pointer',
  },
  modeIcon: {
    fontSize: '22px',
  },
  modeName: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#fff',
  },
  modeDesc: {
    fontSize: '13px',
    color: '#9aa0b4',
  },
  addOnItem: {
    marginBottom: '10px',
  },
  addOnBtn: {
    width: '100%',
    borderRadius: '10px',
    padding: '14px 16px',
    cursor: 'pointer',
    minHeight: '56px',
    textAlign: 'left',
  },
  addOnLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  addOnCheck: {
    fontSize: '20px',
    color: '#FFD700',
    minWidth: '24px',
  },
  addOnName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
  },
  addOnPrice: {
    fontSize: '13px',
    color: '#9aa0b4',
  },
  sizeRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  sizeBtn: {
    minHeight: '40px',
    minWidth: '44px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '0 10px',
  },
  stepActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #3a4055',
    fontSize: '15px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px 0',
    marginTop: '4px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '900',
  },
}
