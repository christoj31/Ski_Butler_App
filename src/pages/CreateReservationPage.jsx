import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationContext'
import { usePackItems } from '../context/PackingContext'
import { PACKAGES } from '../data/mockEquipment'
import { matchNeighborhood } from '../utils/neighborhoodMatcher'
import { generateReservationId } from '../utils/formatters'
import { shoeToMondo } from '../utils/mondoSizing'
import { recommendedPoleLength, calculateDIN } from '../utils/dinCalculator'
import BottomNav from '../components/common/BottomNav'

const today = new Date().toISOString().slice(0, 10)

function blankRenter(idx) {
  return {
    name: '', heightFt: '', heightIn: '', weightLbs: '',
    shoeSizeUS: '', ability: '', packageId: '',
    _id: `new-renter-${idx}`,
  }
}

const ABILITY_OPTIONS = ['beginner', 'intermediate', 'advanced', 'expert']

export default function CreateReservationPage() {
  const { addReservation } = useReservations()
  const { addPackItemsFromReservation } = usePackItems()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [renterCount, setRenterCount] = useState(1)
  const [renters, setRenters] = useState([blankRenter(0)])
  const [currentPackageRenter, setCurrentPackageRenter] = useState(0)
  const [errors, setErrors] = useState({})
  const [deliveryDate, setDeliveryDate] = useState(today)
  const [deliveryShift, setDeliveryShift] = useState('AM')
  const [deliveryType, setDeliveryType] = useState('SIGNATURE')
  const [address, setAddress] = useState('')
  const [confirmed, setConfirmed] = useState(null) // reservation object after confirm

  function updateRenter(idx, key, value) {
    setRenters(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r))
  }

  // Step 1: renter count
  function handleCountChange(delta) {
    const newCount = Math.max(1, renterCount + delta)
    setRenterCount(newCount)
    setRenters(prev => {
      if (newCount > prev.length) {
        return [...prev, ...Array.from({ length: newCount - prev.length }, (_, i) => blankRenter(prev.length + i))]
      }
      return prev.slice(0, newCount)
    })
  }

  // Step 2: validate all renter fields
  function validateRenters() {
    const errs = {}
    renters.forEach((r, idx) => {
      if (!r.name.trim()) errs[`name-${idx}`] = 'Required'
      if (!r.heightFt) errs[`heightFt-${idx}`] = 'Required'
      if (r.heightIn === '') errs[`heightIn-${idx}`] = 'Required'
      if (!r.weightLbs) errs[`weight-${idx}`] = 'Required'
      if (!r.shoeSizeUS) errs[`shoe-${idx}`] = 'Required'
      if (!r.ability) errs[`ability-${idx}`] = 'Required'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Step 3: package selection (one renter at a time)
  function selectPackage(packageId) {
    updateRenter(currentPackageRenter, 'packageId', packageId)
  }

  function nextPackageRenter() {
    if (currentPackageRenter < renterCount - 1) {
      setCurrentPackageRenter(c => c + 1)
    } else {
      setStep(4)
    }
  }

  // Step 5: confirm
  function handleConfirm() {
    const neighborhood = matchNeighborhood(address)
    const reservationId = generateReservationId()

    const builtRenters = renters.map((r, idx) => {
      const bootSizes = shoeToMondo(Number(r.shoeSizeUS))
      const poleLength = recommendedPoleLength(Number(r.heightFt), Number(r.heightIn))
      const din = calculateDIN(Number(r.weightLbs), Number(r.heightFt), Number(r.heightIn), r.ability)
      const pkg = PACKAGES.find(p => p.packageId === r.packageId)
      return {
        renterId: `${reservationId}-r${idx}`,
        name: r.name,
        heightFt: Number(r.heightFt),
        heightIn: Number(r.heightIn),
        weightLbs: Number(r.weightLbs),
        shoeSizeUS: Number(r.shoeSizeUS),
        ability: r.ability,
        packageId: r.packageId,
        packageName: pkg?.name || r.packageId,
        addOns: [],
        selectedBootSize: null,
        inventoryNumber: '',
        waiverSigned: false,
        waiverSignedAt: null,
        bootSizes,
        recommendedPoleLength: poleLength,
        dinRange: `${din.min.toFixed(1)}–${din.max.toFixed(1)}`,
      }
    })

    const reservation = {
      reservationId,
      createdAt: new Date().toISOString(),
      deliveryDate,
      deliveryShift,
      deliveryType,
      address,
      neighborhood,
      stopNumber: 99,
      type: 'delivery',
      status: 'upcoming',
      assignedTech: 'Christo',
      totalPrice: builtRenters.reduce((s, r) => {
        const pkg = PACKAGES.find(p => p.packageId === r.packageId)
        return s + (pkg?.pricePerDay || 0)
      }, 0),
      paymentStatus: 'pending',
      tipAmount: 0,
      pickupNote: '',
      pickupLocation: '',
      packed: false,
      renters: builtRenters,
    }

    addReservation(reservation)
    addPackItemsFromReservation(reservation)
    setConfirmed(reservation)
    setStep(6)
  }

  // Confirmed screen
  if (step === 6 && confirmed) {
    return (
      <div className="page" data-testid="confirmation-screen">
        <div style={styles.confirmHeader}>
          <div style={styles.confirmIcon}>🎿</div>
          <h2 style={styles.confirmTitle}>Reservation Confirmed!</h2>
        </div>

        <div style={styles.confirmCard}>
          <div style={styles.confirmRow}>
            <span style={styles.confirmLabel}>Reservation ID</span>
            <span style={styles.confirmId} data-testid="confirmed-reservation-id">{confirmed.reservationId}</span>
          </div>
          <div style={styles.confirmRow}>
            <span style={styles.confirmLabel}>Date</span>
            <span style={styles.confirmValue}>{confirmed.deliveryDate}</span>
          </div>
          <div style={styles.confirmRow}>
            <span style={styles.confirmLabel}>Shift</span>
            <span style={styles.confirmValue}>{confirmed.deliveryShift}</span>
          </div>
          <div style={styles.confirmRow}>
            <span style={styles.confirmLabel}>Neighborhood</span>
            <span style={styles.confirmValue} data-testid="confirmed-neighborhood">{confirmed.neighborhood}</span>
          </div>
          <div style={styles.confirmRow}>
            <span style={styles.confirmLabel}>Address</span>
            <span style={styles.confirmValue}>{confirmed.address}</span>
          </div>
          <div style={styles.confirmRow}>
            <span style={styles.confirmLabel}>Renters</span>
            <span style={styles.confirmValue}>{confirmed.renters.map(r => r.name).join(', ')}</span>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/home')}
          style={{ marginTop: '16px' }}
          data-testid="go-to-home-btn"
        >
          View Route
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/search')}
          style={{ marginTop: '8px' }}
          data-testid="go-to-search-btn"
        >
          Find in Search
        </button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page" data-testid="create-reservation-page">
      {/* Step indicator */}
      <div style={styles.stepRow}>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} style={{
            ...styles.stepDot,
            backgroundColor: step >= n ? '#FFD700' : '#3a4055',
          }} data-testid={`step-dot-${n}`} />
        ))}
      </div>

      {/* Step 1: Renter count */}
      {step === 1 && (
        <div data-testid="step-1">
          <h2 style={styles.stepTitle}>How many renters?</h2>
          <div style={styles.stepper}>
            <button
              onClick={() => handleCountChange(-1)}
              disabled={renterCount <= 1}
              className={`btn ${renterCount <= 1 ? 'btn-disabled' : 'btn-secondary'}`}
              style={styles.stepperBtn}
              data-testid="decrement-count"
            >
              −
            </button>
            <span style={styles.stepperCount} data-testid="renter-count">{renterCount}</span>
            <button
              onClick={() => handleCountChange(1)}
              className="btn btn-secondary"
              style={styles.stepperBtn}
              data-testid="increment-count"
            >
              +
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setStep(2)}
            style={{ marginTop: '32px' }}
            data-testid="step-1-next"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Per-renter forms */}
      {step === 2 && (
        <div data-testid="step-2">
          <h2 style={styles.stepTitle}>Renter Information</h2>
          {renters.map((renter, idx) => (
            <div key={renter._id} style={styles.renterForm} data-testid={`renter-form-${idx}`}>
              <h3 style={styles.renterFormTitle}>Renter {idx + 1}</h3>

              <label style={styles.label}>Name *</label>
              <input
                type="text"
                value={renter.name}
                onChange={e => updateRenter(idx, 'name', e.target.value)}
                placeholder="Full name"
                data-testid={`renter-name-${idx}`}
              />
              {errors[`name-${idx}`] && <span style={styles.fieldError}>Required</span>}

              <label style={styles.label}>Height *</label>
              <div style={styles.heightRow}>
                <select
                  value={renter.heightFt}
                  onChange={e => updateRenter(idx, 'heightFt', e.target.value)}
                  data-testid={`renter-height-ft-${idx}`}
                  style={{ flex: 1 }}
                >
                  <option value="">ft</option>
                  {[3, 4, 5, 6, 7].map(f => <option key={f} value={f}>{f}ft</option>)}
                </select>
                <select
                  value={renter.heightIn}
                  onChange={e => updateRenter(idx, 'heightIn', e.target.value)}
                  data-testid={`renter-height-in-${idx}`}
                  style={{ flex: 1 }}
                >
                  <option value="">in</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <option key={i} value={i}>{i}in</option>)}
                </select>
              </div>

              <label style={styles.label}>Weight (lbs) *</label>
              <input
                type="number"
                value={renter.weightLbs}
                onChange={e => updateRenter(idx, 'weightLbs', e.target.value)}
                placeholder="lbs"
                data-testid={`renter-weight-${idx}`}
              />

              <label style={styles.label}>Shoe Size (US) *</label>
              <select
                value={renter.shoeSizeUS}
                onChange={e => updateRenter(idx, 'shoeSizeUS', e.target.value)}
                data-testid={`renter-shoe-${idx}`}
              >
                <option value="">Select size</option>
                {Array.from({ length: 19 }, (_, i) => 5 + i * 0.5).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <label style={styles.label}>Ability *</label>
              <div style={styles.abilityRow}>
                {ABILITY_OPTIONS.map(a => (
                  <button
                    key={a}
                    onClick={() => updateRenter(idx, 'ability', a)}
                    data-testid={`ability-${a}-${idx}`}
                    data-selected={renter.ability === a}
                    style={{
                      ...styles.abilityBtn,
                      backgroundColor: renter.ability === a ? '#FFD700' : '#2e3448',
                      color: renter.ability === a ? '#000' : '#fff',
                      fontWeight: renter.ability === a ? '800' : '600',
                    }}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
              {errors[`ability-${idx}`] && <span style={styles.fieldError}>Required</span>}
            </div>
          ))}

          <div style={styles.navRow}>
            <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 0, minWidth: '80px' }}>Back</button>
            <button
              className="btn btn-primary"
              onClick={() => { if (validateRenters()) setStep(3) }}
              data-testid="step-2-next"
              style={{ flex: 1 }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Package selection (per renter) */}
      {step === 3 && (
        <div data-testid="step-3">
          <h2 style={styles.stepTitle}>
            Select Package — {renters[currentPackageRenter]?.name || `Renter ${currentPackageRenter + 1}`}
          </h2>
          <p style={styles.stepSubtitle}>{currentPackageRenter + 1} of {renterCount}</p>

          {PACKAGES.map(pkg => (
            <button
              key={pkg.packageId}
              onClick={() => selectPackage(pkg.packageId)}
              data-testid={`package-${pkg.packageId}`}
              data-selected={renters[currentPackageRenter]?.packageId === pkg.packageId}
              style={{
                ...styles.packageCard,
                border: renters[currentPackageRenter]?.packageId === pkg.packageId
                  ? '2px solid #FFD700'
                  : '1px solid #3a4055',
                backgroundColor: renters[currentPackageRenter]?.packageId === pkg.packageId
                  ? '#2a2e1a' : '#242938',
              }}
            >
              <div style={styles.pkgIcon}>{pkg.category === 'ski' ? '⛷️' : '🏂'}</div>
              <div style={styles.pkgInfo}>
                <div style={styles.pkgName}>{pkg.name}</div>
                <div style={styles.pkgDesc}>{pkg.description}</div>
                <div style={styles.pkgPrice}>${pkg.pricePerDay}/day</div>
              </div>
            </button>
          ))}

          <div style={styles.navRow}>
            <button className="btn btn-secondary" onClick={() => {
              if (currentPackageRenter > 0) setCurrentPackageRenter(c => c - 1)
              else setStep(2)
            }} style={{ flex: 0, minWidth: '80px' }}>Back</button>
            <button
              className={`btn ${renters[currentPackageRenter]?.packageId ? 'btn-primary' : 'btn-disabled'}`}
              disabled={!renters[currentPackageRenter]?.packageId}
              onClick={nextPackageRenter}
              data-testid="step-3-next"
              style={{ flex: 1 }}
            >
              {currentPackageRenter < renterCount - 1 ? 'Next Renter' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Delivery details */}
      {step === 4 && (
        <div data-testid="step-4">
          <h2 style={styles.stepTitle}>Delivery Details</h2>

          <label style={styles.label}>Shift</label>
          <div style={styles.toggleRow}>
            {['AM', 'PM'].map(s => (
              <button
                key={s}
                onClick={() => setDeliveryShift(s)}
                data-testid={`shift-${s.toLowerCase()}`}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: deliveryShift === s ? '#FFD700' : '#2e3448',
                  color: deliveryShift === s ? '#000' : '#fff',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <label style={styles.label}>Delivery Date</label>
          <input
            type="date"
            value={deliveryDate}
            onChange={e => setDeliveryDate(e.target.value)}
            data-testid="delivery-date"
            style={{ marginBottom: '12px' }}
          />

          <label style={styles.label}>Address *</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Full delivery address"
            data-testid="delivery-address"
            style={{ marginBottom: '12px' }}
          />

          <label style={styles.label}>Delivery Type</label>
          <div style={styles.toggleRow}>
            {['EXPRESS', 'SIGNATURE'].map(t => (
              <button
                key={t}
                onClick={() => setDeliveryType(t)}
                data-testid={`type-${t.toLowerCase()}`}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: deliveryType === t ? '#FFD700' : '#2e3448',
                  color: deliveryType === t ? '#000' : '#fff',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={styles.navRow}>
            <button className="btn btn-secondary" onClick={() => setStep(3)} style={{ flex: 0, minWidth: '80px' }}>Back</button>
            <button
              className={`btn ${address.trim() ? 'btn-primary' : 'btn-disabled'}`}
              disabled={!address.trim()}
              onClick={() => setStep(5)}
              data-testid="step-4-next"
              style={{ flex: 1 }}
            >
              Review Order
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Summary + Confirm */}
      {step === 5 && (
        <div data-testid="step-5">
          <h2 style={styles.stepTitle}>Order Summary</h2>

          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Date</span>
              <span style={styles.summaryValue}>{deliveryDate}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Shift</span>
              <span style={styles.summaryValue}>{deliveryShift}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Type</span>
              <span style={styles.summaryValue}>{deliveryType}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Address</span>
              <span style={styles.summaryValue}>{address}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Neighborhood</span>
              <span style={{ ...styles.summaryValue, color: '#FFD700' }}>{matchNeighborhood(address)}</span>
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Renters</h3>
          {renters.map((r, idx) => {
            const pkg = PACKAGES.find(p => p.packageId === r.packageId)
            return (
              <div key={r._id} style={styles.renterSummary} data-testid={`summary-renter-${idx}`}>
                <div style={styles.summaryRenterName}>{r.name}</div>
                <div style={{ color: '#FFD700', fontSize: '14px' }}>{pkg?.name || '—'} — ${pkg?.pricePerDay || 0}/day</div>
                <div style={{ color: '#9aa0b4', fontSize: '13px' }}>{r.ability} • Shoe {r.shoeSizeUS}</div>
              </div>
            )
          })}

          <div style={{ ...styles.summaryRow, marginTop: '12px' }}>
            <span style={styles.summaryLabel}>Estimated Total</span>
            <span style={{ ...styles.summaryValue, color: '#FFD700', fontSize: '22px' }}>
              ${renters.reduce((s, r) => s + (PACKAGES.find(p => p.packageId === r.packageId)?.pricePerDay || 0), 0)}/day
            </span>
          </div>

          <div style={styles.navRow}>
            <button className="btn btn-secondary" onClick={() => setStep(4)} style={{ flex: 0, minWidth: '80px' }}>Back</button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              data-testid="confirm-reservation"
              style={{ flex: 1 }}
            >
              Confirm Reservation
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

const styles = {
  stepRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' },
  stepDot: { width: '10px', height: '10px', borderRadius: '50%' },
  stepTitle: { fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' },
  stepSubtitle: { fontSize: '14px', color: '#9aa0b4', marginBottom: '16px' },
  stepper: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '24px' },
  stepperBtn: { width: '64px', height: '64px', fontSize: '28px', borderRadius: '50%', flex: '0 0 64px' },
  stepperCount: { fontSize: '48px', fontWeight: '900', color: '#FFD700', minWidth: '60px', textAlign: 'center' },
  renterForm: { backgroundColor: '#242938', borderRadius: '12px', padding: '16px', marginBottom: '14px', border: '1px solid #3a4055' },
  renterFormTitle: { fontSize: '16px', fontWeight: '700', color: '#FFD700', marginBottom: '12px' },
  label: { fontSize: '12px', color: '#9aa0b4', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px', marginTop: '10px' },
  heightRow: { display: 'flex', gap: '8px' },
  abilityRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' },
  abilityBtn: { flex: '1 1 80px', minHeight: '52px', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  fieldError: { color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '2px' },
  navRow: { display: 'flex', gap: '8px', marginTop: '20px' },
  packageCard: { width: '100%', display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px', textAlign: 'left', minHeight: '80px' },
  pkgIcon: { fontSize: '36px', flexShrink: 0 },
  pkgInfo: { flex: 1 },
  pkgName: { fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '3px' },
  pkgDesc: { fontSize: '13px', color: '#9aa0b4', marginBottom: '4px' },
  pkgPrice: { fontSize: '15px', fontWeight: '700', color: '#FFD700' },
  toggleRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  toggleBtn: { flex: 1, minHeight: '48px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  summaryCard: { backgroundColor: '#242938', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #3a4055' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #2e3448' },
  summaryLabel: { fontSize: '13px', color: '#9aa0b4', fontWeight: '600' },
  summaryValue: { fontSize: '15px', fontWeight: '600', color: '#fff', textAlign: 'right', flex: 1, marginLeft: '12px' },
  sectionTitle: { fontSize: '14px', color: '#9aa0b4', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' },
  renterSummary: { backgroundColor: '#242938', borderRadius: '10px', padding: '14px', marginBottom: '8px', border: '1px solid #3a4055' },
  summaryRenterName: { fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  confirmHeader: { textAlign: 'center', marginBottom: '24px' },
  confirmIcon: { fontSize: '64px', marginBottom: '8px' },
  confirmTitle: { fontSize: '26px', fontWeight: '900', color: '#FFD700' },
  confirmCard: { backgroundColor: '#242938', borderRadius: '12px', padding: '16px', border: '1px solid #3a4055', marginBottom: '16px' },
  confirmRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2e3448' },
  confirmLabel: { fontSize: '13px', color: '#9aa0b4', fontWeight: '600' },
  confirmId: { fontSize: '14px', fontWeight: '700', color: '#FFD700', letterSpacing: '1px' },
  confirmValue: { fontSize: '14px', fontWeight: '600', color: '#fff', textAlign: 'right', maxWidth: '55%' },
}
