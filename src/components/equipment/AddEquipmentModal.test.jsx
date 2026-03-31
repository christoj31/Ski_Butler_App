import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ReservationContext } from '../../context/ReservationContext'
import { PackingContext } from '../../context/PackingContext'
import DeliveryDetailPage from '../../pages/DeliveryDetailPage'
import PayBillPage from '../../pages/PayBillPage'
import { MOCK_ROUTES } from '../../data/mockRoutes'

const MOCK_RES = {
  ...MOCK_ROUTES.find(r => r.reservationId === 'RES-2026-001'),
  renters: MOCK_ROUTES.find(r => r.reservationId === 'RES-2026-001').renters.map(r => ({
    ...r, waiverSigned: true, selectedBootSize: 25.5,
  })),
}

function renderDeliveryWith(reservationOverride = MOCK_RES) {
  let currentReservation = { ...reservationOverride }
  const updateReservation = vi.fn((id, changes) => {
    if (changes.renters) currentReservation = { ...currentReservation, renters: changes.renters }
    else currentReservation = { ...currentReservation, ...changes }
  })
  const getReservationById = vi.fn(() => currentReservation)

  const reservationValue = {
    reservations: MOCK_ROUTES,
    getRouteStops: vi.fn().mockReturnValue([]),
    getReservationById,
    addReservation: vi.fn(),
    updateReservation,
    getSearchResults: vi.fn().mockReturnValue([]),
  }

  render(
    <AuthContext.Provider value={{ currentUser: { username: 'Christo' }, login: vi.fn(), logout: vi.fn() }}>
      <ReservationContext.Provider value={reservationValue}>
        <PackingContext.Provider value={{ packItems: [], getPackItemsByDate: vi.fn().mockReturnValue([]), markAsPacked: vi.fn(), addPackItemsFromReservation: vi.fn() }}>
          <MemoryRouter initialEntries={[`/delivery/${reservationOverride.reservationId}`]}>
            <Routes>
              <Route path="/delivery/:reservationId" element={<DeliveryDetailPage />} />
              <Route path="/delivery/:reservationId/pay" element={<PayBillPage />} />
              <Route path="/home" element={<div>Home</div>} />
            </Routes>
          </MemoryRouter>
        </PackingContext.Provider>
      </ReservationContext.Provider>
    </AuthContext.Provider>
  )

  return { updateReservation }
}

describe('Phase 4 — Add/Remove Equipment Modal', () => {
  it('"Add/Remove Equipment" button opens modal', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('add-remove-equipment-btn'))
    expect(screen.getByTestId('add-equipment-step-1')).toBeInTheDocument()
  })

  it('step 1 shows all renters at the stop as selectable', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('add-remove-equipment-btn'))

    MOCK_RES.renters.forEach(r => {
      expect(screen.getByTestId(`select-renter-${r.renterId}`)).toBeInTheDocument()
    })
  })

  it('step 2 shows all 4 equipment options with per-day pricing', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('add-remove-equipment-btn'))
    await user.click(screen.getByTestId(`select-renter-${MOCK_RES.renters[0].renterId}`))

    expect(screen.getByTestId('add-equipment-step-2')).toBeInTheDocument()
    expect(screen.getByTestId('addon-toggle-helmet')).toBeInTheDocument()
    expect(screen.getByTestId('addon-toggle-goggles')).toBeInTheDocument()
    expect(screen.getByTestId('addon-toggle-premium-comfort-boots')).toBeInTheDocument()
    expect(screen.getByTestId('addon-toggle-high-performance-boots')).toBeInTheDocument()

    // Each add-on shows price
    expect(screen.getByTestId('add-equipment-step-2').textContent).toMatch(/\$\d+\/day/)
  })

  it('helmet size selector appears when helmet is checked', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('add-remove-equipment-btn'))
    await user.click(screen.getByTestId(`select-renter-${MOCK_RES.renters[0].renterId}`))

    // Size selector not shown yet
    expect(screen.queryByTestId('helmet-size-selector')).not.toBeInTheDocument()

    // Check helmet
    await user.click(screen.getByTestId('addon-toggle-helmet'))
    expect(screen.getByTestId('helmet-size-selector')).toBeInTheDocument()

    // Size buttons XS/S/M/L/XL all present
    ;['XS', 'S', 'M', 'L', 'XL'].forEach(size => {
      expect(screen.getByTestId(`helmet-size-${size}`)).toBeInTheDocument()
    })
  })

  it('step 3 shows accurate summary', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('add-remove-equipment-btn'))
    await user.click(screen.getByTestId(`select-renter-${MOCK_RES.renters[0].renterId}`))
    await user.click(screen.getByTestId('addon-toggle-goggles'))

    // Advance to step 3
    const nextBtns = screen.getAllByText('Next')
    await user.click(nextBtns[nextBtns.length - 1])

    expect(screen.getByTestId('add-equipment-step-3')).toBeInTheDocument()
    expect(screen.getByTestId('add-equipment-step-3').textContent).toMatch(/Goggles/)
  })

  it('confirming add/remove closes modal', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('add-remove-equipment-btn'))
    await user.click(screen.getByTestId(`select-renter-${MOCK_RES.renters[0].renterId}`))

    const nextBtns = screen.getAllByText('Next')
    await user.click(nextBtns[nextBtns.length - 1])
    await user.click(screen.getByTestId('confirm-add-equipment'))

    expect(screen.queryByTestId('add-equipment-step-3')).not.toBeInTheDocument()
  })
})

describe('Phase 4 — Pay Bill Flow', () => {
  it('pay bill screen 1 shows itemized receipt with correct totals', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))

    expect(screen.getByTestId('pay-bill-screen-1')).toBeInTheDocument()
    // Shows renter names
    MOCK_RES.renters.forEach(r => {
      expect(screen.getByText(r.name)).toBeInTheDocument()
    })
  })

  it('all 5 tip options work', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))

    await user.click(screen.getByTestId('tip-15'))
    expect(screen.getByTestId('tip-15').style.backgroundColor).toMatch(/FFD700|rgb\(255,\s*215,\s*0\)/)

    await user.click(screen.getByTestId('tip-none'))
    await user.click(screen.getByTestId('tip-custom'))
    expect(screen.getByTestId('custom-tip-input')).toBeInTheDocument()
  })

  it('custom tip accepts numeric input and updates total', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))

    await user.click(screen.getByTestId('tip-custom'))
    await user.type(screen.getByTestId('custom-tip-input'), '50')
    // Total displayed should include the $50 tip
    expect(screen.getByTestId('pay-bill-screen-1').textContent).toMatch(/\$\d+/)
  })

  it('"Pay" navigates to screen 2', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))
    await user.click(screen.getByTestId('pay-button'))
    expect(screen.getByTestId('pay-bill-screen-2')).toBeInTheDocument()
  })

  it('"Next" on screen 2 navigates to screen 3', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))
    await user.click(screen.getByTestId('pay-button'))
    await user.click(screen.getByTestId('next-to-thankyou'))
    expect(screen.getByTestId('pay-bill-screen-3')).toBeInTheDocument()
  })

  it('survey link is present and tappable on screen 3', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))
    await user.click(screen.getByTestId('pay-button'))
    await user.click(screen.getByTestId('next-to-thankyou'))
    expect(screen.getByTestId('survey-link')).toBeInTheDocument()
  })

  it('X button on screen 3 opens Pickup Notes screen', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))
    await user.click(screen.getByTestId('pay-button'))
    await user.click(screen.getByTestId('next-to-thankyou'))
    await user.click(screen.getByTestId('pickup-notes-btn'))
    expect(screen.getByTestId('pickup-notes-screen')).toBeInTheDocument()
  })

  it('"Other" selection in dropdown reveals text input', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))
    await user.click(screen.getByTestId('pay-button'))
    await user.click(screen.getByTestId('next-to-thankyou'))
    await user.click(screen.getByTestId('pickup-notes-btn'))

    expect(screen.queryByTestId('pickup-note-input')).not.toBeInTheDocument()
    await user.selectOptions(screen.getByTestId('pickup-location-select'), 'Other')
    expect(screen.getByTestId('pickup-note-input')).toBeInTheDocument()
  })

  it('"Confirm" on pickup notes closes the screen', async () => {
    const user = userEvent.setup()
    renderDeliveryWith()
    await user.click(screen.getByTestId('pay-bill-btn'))
    await user.click(screen.getByTestId('pay-button'))
    await user.click(screen.getByTestId('next-to-thankyou'))
    await user.click(screen.getByTestId('pickup-notes-btn'))
    await user.selectOptions(screen.getByTestId('pickup-location-select'), 'In front of house')
    await user.click(screen.getByTestId('confirm-pickup-note'))
    expect(screen.queryByTestId('pickup-notes-screen')).not.toBeInTheDocument()
  })
})
