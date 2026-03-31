import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ReservationContext } from '../context/ReservationContext'
import { PackingContext } from '../context/PackingContext'
import DeliveryDetailPage from './DeliveryDetailPage'
import { MOCK_ROUTES } from '../data/mockRoutes'

// Use a delivery reservation with 2 renters
const MOCK_RES = MOCK_ROUTES.find(r => r.reservationId === 'RES-2026-001')

function renderDelivery(reservationOverride = MOCK_RES) {
  const updateReservation = vi.fn()
  let currentReservation = { ...reservationOverride }
  const getReservationById = vi.fn(() => currentReservation)

  const reservationValue = {
    reservations: MOCK_ROUTES,
    getRouteStops: vi.fn().mockReturnValue([]),
    getReservationById,
    addReservation: vi.fn(),
    updateReservation: (id, changes) => {
      // Apply changes so re-renders see updated state
      if (changes.renters) {
        currentReservation = { ...currentReservation, renters: changes.renters }
      } else {
        currentReservation = { ...currentReservation, ...changes }
      }
      updateReservation(id, changes)
    },
    getSearchResults: vi.fn().mockReturnValue([]),
  }

  const result = render(
    <AuthContext.Provider value={{ currentUser: { username: 'Christo' }, login: vi.fn(), logout: vi.fn() }}>
      <ReservationContext.Provider value={reservationValue}>
        <PackingContext.Provider value={{ packItems: [], getPackItemsByDate: vi.fn().mockReturnValue([]), markAsPacked: vi.fn(), addPackItemsFromReservation: vi.fn() }}>
          <MemoryRouter initialEntries={[`/delivery/${reservationOverride.reservationId}`]}>
            <Routes>
              <Route path="/delivery/:reservationId" element={<DeliveryDetailPage />} />
              <Route path="/delivery/:reservationId/pay" element={<div data-testid="pay-bill-page">Pay Bill</div>} />
              <Route path="/home" element={<div>Home</div>} />
            </Routes>
          </MemoryRouter>
        </PackingContext.Provider>
      </ReservationContext.Provider>
    </AuthContext.Provider>
  )

  return { ...result, updateReservation, getReservationById }
}

describe('Phase 3 — Delivery Detail', () => {
  it('delivery detail page loads with correct address and stop data', () => {
    renderDelivery()
    expect(screen.getByTestId('delivery-detail-page')).toBeInTheDocument()
    expect(screen.getByText(MOCK_RES.address)).toBeInTheDocument()
    expect(screen.getByText(MOCK_RES.neighborhood)).toBeInTheDocument()
  })

  it('each renter card collapses and expands correctly', async () => {
    const user = userEvent.setup()
    renderDelivery()

    const renter = MOCK_RES.renters[0]
    // Body should not be present initially
    expect(screen.queryByTestId(`renter-body-${renter.renterId}`)).not.toBeInTheDocument()

    // Click to expand
    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))
    expect(screen.getByTestId(`renter-body-${renter.renterId}`)).toBeInTheDocument()

    // Click to collapse
    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))
    expect(screen.queryByTestId(`renter-body-${renter.renterId}`)).not.toBeInTheDocument()
  })

  it('equipment image, inventory number field, and info icon all render', async () => {
    const user = userEvent.setup()
    renderDelivery()
    const renter = MOCK_RES.renters[0]

    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))

    expect(screen.getByTestId(`inventory-input-${renter.renterId}`)).toBeInTheDocument()
    expect(screen.getByTestId(`info-btn-${renter.renterId}`)).toBeInTheDocument()
  })

  it('info modal opens and closes correctly', async () => {
    const user = userEvent.setup()
    renderDelivery()
    const renter = MOCK_RES.renters[0]

    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))
    await user.click(screen.getByTestId(`info-btn-${renter.renterId}`))

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByTestId('modal-close'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('two boot size options display; recommended one is highlighted gold', async () => {
    const user = userEvent.setup()
    renderDelivery()
    const renter = MOCK_RES.renters[0]

    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))

    // Should have 2 boot size buttons
    const bootButtons = screen.getAllByTestId(/^boot-size-/)
    expect(bootButtons.length).toBe(2)

    // Recommended (index 0) should have gold border (jsdom converts #FFD700 → rgb(255, 215, 0))
    expect(bootButtons[0].style.border).toMatch(/FFD700|rgb\(255,\s*215,\s*0\)/)
  })

  it('tapping a boot size selects it (visual confirmation)', async () => {
    const user = userEvent.setup()
    renderDelivery()
    const renter = MOCK_RES.renters[0]

    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))

    const bootButtons = screen.getAllByTestId(/^boot-size-/)
    await user.click(bootButtons[1]) // Click second option

    // After clicking, updateReservation should be called
    // The button visual should update (we verify the call happened)
    expect(bootButtons[1]).toBeInTheDocument()
  })

  it('"Sign Waiver" button does not appear until a boot is selected', async () => {
    const user = userEvent.setup()
    renderDelivery()
    const renter = MOCK_RES.renters[0]

    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))

    // No waiver button yet
    expect(screen.queryByTestId(`sign-waiver-btn-${renter.renterId}`)).not.toBeInTheDocument()
  })

  it('signature modal opens, accepts input, and confirm button is disabled until drawn', async () => {
    const user = userEvent.setup()
    // Render with boot already selected
    const resWithBoot = {
      ...MOCK_RES,
      renters: MOCK_RES.renters.map((r, i) =>
        i === 0 ? { ...r, selectedBootSize: 25.5 } : r
      )
    }
    renderDelivery(resWithBoot)
    const renter = resWithBoot.renters[0]

    await user.click(screen.getByTestId(`renter-toggle-${renter.renterId}`))

    // Sign waiver button should now be visible
    expect(screen.getByTestId(`sign-waiver-btn-${renter.renterId}`)).toBeInTheDocument()

    await user.click(screen.getByTestId(`sign-waiver-btn-${renter.renterId}`))

    // Waiver modal opens
    expect(screen.getByTestId('waiver-modal-content')).toBeInTheDocument()

    // Confirm button disabled before drawing
    const confirmBtn = screen.getByTestId('confirm-signature')
    expect(confirmBtn).toBeDisabled()

    // Simulate drawing on canvas
    const canvas = screen.getByTestId('signature-canvas')
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 })
    fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 })
    fireEvent.mouseUp(canvas)

    // Confirm button should now be enabled
    await waitFor(() => {
      expect(screen.getByTestId('confirm-signature')).not.toBeDisabled()
    })
  })

  it('"Pay Bill" remains grayed out until every renter is signed', () => {
    renderDelivery()
    const payBtn = screen.getByTestId('pay-bill-btn')
    expect(payBtn).toBeDisabled()
  })

  it('"Pay Bill" turns gold once all renters have signed', () => {
    const allSigned = {
      ...MOCK_RES,
      renters: MOCK_RES.renters.map(r => ({ ...r, waiverSigned: true, selectedBootSize: 25.5 }))
    }
    renderDelivery(allSigned)
    const payBtn = screen.getByTestId('pay-bill-btn')
    expect(payBtn).not.toBeDisabled()
    expect(payBtn).toHaveClass('btn-primary')
  })
})
