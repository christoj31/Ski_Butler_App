import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationContext'
import { getPackageById, getAddOnById } from '../data/mockEquipment'

const RENTAL_DAYS = 1

function computeRenterTotal(renter) {
  const pkg = getPackageById(renter.packageId)
  const pkgCost = pkg ? pkg.pricePerDay * RENTAL_DAYS : 0
  const addOnCost = (renter.addOns || []).reduce((sum, ao) => {
    const addOn = getAddOnById(ao.addOnId)
    return sum + (addOn ? addOn.pricePerDay * RENTAL_DAYS : 0)
  }, 0)
  return pkgCost + addOnCost
}

export default function PayBillPage() {
  const { reservationId } = useParams()
  const { getReservationById, updateReservation } = useReservations()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [tipType, setTipType] = useState(null)
  const [customTip, setCustomTip] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [pickupNote, setPickupNote] = useState('')
  const [showPickupNotes, setShowPickupNotes] = useState(false)

  const reservation = getReservationById(reservationId)
  if (!reservation) return <div style={{ color: '#fff', padding: 24 }}>Not found</div>

  const subtotal = reservation.renters.reduce((s, r) => s + computeRenterTotal(r), 0)

  function getTipAmount() {
    if (tipType === '15') return Math.round(subtotal * 0.15)
    if (tipType === '20') return Math.round(subtotal * 0.20)
    if (tipType === '25') return Math.round(subtotal * 0.25)
    if (tipType === 'custom') return Number(customTip) || 0
    return 0
  }

  const tipAmount = getTipAmount()
  const total = subtotal + tipAmount

  function handlePay() {
    updateReservation(reservationId, {
      paymentStatus: 'paid',
      tipAmount,
      status: 'completed',
    })
    setStep(2)
  }

  function handlePickupConfirm() {
    updateReservation(reservationId, {
      pickupLocation,
      pickupNote: pickupLocation === 'Other' ? pickupNote : pickupLocation,
    })
    setShowPickupNotes(false)
    navigate('/home')
  }

  // Pickup Notes overlay
  if (showPickupNotes) {
    return (
      <div className="page-no-nav" data-testid="pickup-notes-screen">
        <h2 style={styles.title}>Pickup Notes</h2>
        <label style={styles.label}>Pickup Location</label>
        <select
          value={pickupLocation}
          onChange={e => setPickupLocation(e.target.value)}
          style={{ marginBottom: '12px' }}
          data-testid="pickup-location-select"
        >
          <option value="">Select location…</option>
          <option value="In front of house">In front of house</option>
          <option value="From Ski Valet">From Ski Valet</option>
          <option value="Slope Side Lounge">Slope Side Lounge</option>
          <option value="Other">Other</option>
        </select>

        {pickupLocation === 'Other' && (
          <textarea
            placeholder="Describe the pickup location…"
            value={pickupNote}
            onChange={e => setPickupNote(e.target.value)}
            data-testid="pickup-note-input"
            style={{ minHeight: '80px', marginBottom: '12px' }}
          />
        )}

        <button
          className="btn btn-primary"
          onClick={handlePickupConfirm}
          data-testid="confirm-pickup-note"
          disabled={!pickupLocation}
        >
          Confirm
        </button>
      </div>
    )
  }

  // Screen 1: Itemized receipt + tip
  if (step === 1) {
    return (
      <div className="page-no-nav" data-testid="pay-bill-screen-1">
        <h2 style={styles.title}>Pay Bill</h2>

        {/* Itemized receipt */}
        <div style={styles.receipt}>
          {reservation.renters.map(renter => {
            const pkg = getPackageById(renter.packageId)
            const renterTotal = computeRenterTotal(renter)
            return (
              <div key={renter.renterId} style={styles.receiptSection}>
                <div style={styles.receiptName}>{renter.name}</div>
                <div style={styles.receiptLine}>
                  <span>{pkg?.name || renter.packageId}</span>
                  <span>${pkg?.pricePerDay || 0}</span>
                </div>
                {(renter.addOns || []).map(ao => {
                  const addOn = getAddOnById(ao.addOnId)
                  return (
                    <div key={ao.addOnId} style={styles.receiptLine}>
                      <span>{addOn?.name}{ao.size ? ` (${ao.size})` : ''}</span>
                      <span>${addOn?.pricePerDay || 0}</span>
                    </div>
                  )
                })}
                <div style={{ ...styles.receiptLine, fontWeight: '700', borderTop: '1px solid #3a4055', paddingTop: '6px' }}>
                  <span>Subtotal</span>
                  <span>${renterTotal}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tip */}
        <p style={styles.label}>Add a Tip</p>
        <div style={styles.tipRow}>
          {['15', '20', '25'].map(pct => (
            <button
              key={pct}
              onClick={() => setTipType(pct)}
              data-testid={`tip-${pct}`}
              style={{
                ...styles.tipBtn,
                backgroundColor: tipType === pct ? '#FFD700' : '#2e3448',
                color: tipType === pct ? '#000' : '#fff',
              }}
            >
              {pct}%
              <span style={styles.tipAmt}>${Math.round(subtotal * Number(pct) / 100)}</span>
            </button>
          ))}
          <button
            onClick={() => setTipType('custom')}
            data-testid="tip-custom"
            style={{
              ...styles.tipBtn,
              backgroundColor: tipType === 'custom' ? '#FFD700' : '#2e3448',
              color: tipType === 'custom' ? '#000' : '#fff',
            }}
          >
            Custom
          </button>
          <button
            onClick={() => setTipType('none')}
            data-testid="tip-none"
            style={{
              ...styles.tipBtn,
              backgroundColor: tipType === 'none' ? '#3a4055' : '#2e3448',
              color: '#9aa0b4',
            }}
          >
            No Tip
          </button>
        </div>

        {tipType === 'custom' && (
          <input
            type="number"
            placeholder="Enter tip amount ($)"
            value={customTip}
            onChange={e => setCustomTip(e.target.value)}
            data-testid="custom-tip-input"
            style={{ marginBottom: '12px' }}
          />
        )}

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total</span>
          <span style={styles.totalValue}>${total}</span>
        </div>

        <button
          className="btn btn-primary"
          onClick={handlePay}
          data-testid="pay-button"
          style={{ marginTop: '16px' }}
        >
          Pay ${total}
        </button>
      </div>
    )
  }

  // Screen 2: Shop contact + equipment pickup instructions
  if (step === 2) {
    return (
      <div className="page-no-nav" data-testid="pay-bill-screen-2">
        <h2 style={styles.title}>Thank You!</h2>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Ski Butlers</h3>
          <p style={styles.infoText}>📞 (970) 949-7275</p>
          <p style={styles.infoText}>📧 info@skibutlers.com</p>
        </div>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Equipment Pickup</h3>
          <p style={styles.infoText}>Our team will pick up your equipment on your last day. Please have all items (skis, boots, poles, helmets) ready by 10AM.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setStep(3)}
          data-testid="next-to-thankyou"
          style={{ marginTop: '16px' }}
        >
          Next
        </button>
      </div>
    )
  }

  // Screen 3: Full-screen thank you
  return (
    <div className="page-no-nav" data-testid="pay-bill-screen-3" style={styles.thankYou}>
      <div style={styles.thankYouContent}>
        <div style={styles.thankYouIcon}>⛷️</div>
        <h1 style={styles.thankYouTitle}>Thank you for renting with us!</h1>
        <p style={styles.thankYouSub}>We hope you have an incredible time on the mountain.</p>
        <a
          href="https://skibutlers.com/survey"
          style={styles.surveyLink}
          data-testid="survey-link"
        >
          🎁 Leave a review — get 5% off your next rental
        </a>

        {/* X button → Pickup Notes */}
        <button
          onClick={() => setShowPickupNotes(true)}
          style={styles.xBtn}
          aria-label="Pickup notes"
          data-testid="pickup-notes-btn"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

const styles = {
  title: { fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '16px' },
  label: { fontSize: '13px', color: '#9aa0b4', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  receipt: { backgroundColor: '#242938', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  receiptSection: { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #3a4055' },
  receiptName: { fontSize: '15px', fontWeight: '700', color: '#FFD700', marginBottom: '8px' },
  receiptLine: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#fff', padding: '3px 0' },
  tipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
  tipBtn: { flex: '1 1 80px', minHeight: '56px', borderRadius: '10px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' },
  tipAmt: { fontSize: '11px', fontWeight: '400', opacity: 0.8 },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: '#242938', borderRadius: '10px', marginTop: '8px' },
  totalLabel: { fontSize: '18px', fontWeight: '700', color: '#fff' },
  totalValue: { fontSize: '28px', fontWeight: '900', color: '#FFD700' },
  infoCard: { backgroundColor: '#242938', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #3a4055' },
  infoTitle: { fontSize: '16px', fontWeight: '700', color: '#FFD700', marginBottom: '10px' },
  infoText: { fontSize: '14px', color: '#fff', marginBottom: '6px' },
  thankYou: { display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '100vh' },
  thankYouContent: { padding: '32px', position: 'relative' },
  thankYouIcon: { fontSize: '64px', marginBottom: '16px' },
  thankYouTitle: { fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '12px', lineHeight: 1.3 },
  thankYouSub: { fontSize: '16px', color: '#9aa0b4', marginBottom: '24px' },
  surveyLink: { display: 'block', color: '#FFD700', fontSize: '16px', fontWeight: '700', padding: '16px', backgroundColor: '#242938', borderRadius: '12px', textDecoration: 'none', marginBottom: '24px' },
  xBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9aa0b4', fontSize: '20px', minHeight: '48px', minWidth: '48px', cursor: 'pointer' },
}
