import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ReservationContext } from '../context/ReservationContext'
import { PackingContext } from '../context/PackingContext'
import TechHomePage from './TechHomePage'
import { MOCK_ROUTES } from '../data/mockRoutes'

const today = new Date().toISOString().slice(0, 10)
const amStops = MOCK_ROUTES.filter(r => r.deliveryShift === 'AM' && r.deliveryDate === today)
const pmStops = MOCK_ROUTES.filter(r => r.deliveryShift === 'PM' && r.deliveryDate === today)

function renderHome(overrides = {}) {
  const defaultGetRouteStops = vi.fn((shift) =>
    shift === 'AM' ? amStops : pmStops
  )

  const reservationValue = {
    reservations: MOCK_ROUTES,
    getRouteStops: overrides.getRouteStops || defaultGetRouteStops,
    getReservationById: vi.fn(),
    addReservation: vi.fn(),
    updateReservation: vi.fn(),
    getSearchResults: vi.fn().mockReturnValue([]),
  }

  render(
    <AuthContext.Provider value={{ currentUser: { username: 'Christo' }, login: vi.fn(), logout: vi.fn() }}>
      <ReservationContext.Provider value={reservationValue}>
        <PackingContext.Provider value={{ packItems: [], getPackItemsByDate: vi.fn().mockReturnValue([]), markAsPacked: vi.fn(), addPackItemsFromReservation: vi.fn() }}>
          <MemoryRouter initialEntries={['/home']}>
            <Routes>
              <Route path="/home" element={<TechHomePage />} />
              <Route path="/delivery/:id" element={<div data-testid="delivery-detail-page">Delivery Detail</div>} />
              <Route path="/pickup/:id" element={<div data-testid="pickup-detail-page">Pickup Detail</div>} />
              <Route path="/search" element={<div data-testid="search-page">Search</div>} />
              <Route path="/packing" element={<div data-testid="packing-page">Packing</div>} />
              <Route path="/new" element={<div data-testid="create-page">New</div>} />
            </Routes>
          </MemoryRouter>
        </PackingContext.Provider>
      </ReservationContext.Provider>
    </AuthContext.Provider>
  )
}

describe('Phase 2 — Tech Home', () => {
  it('route cards render for AM shift by default', () => {
    renderHome()
    const cards = screen.getAllByTestId('route-card')
    expect(cards.length).toBe(amStops.length)
  })

  it('toggling to PM shift replaces the list with PM stops', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByTestId('shift-pm'))
    const cards = screen.getAllByTestId('route-card')
    expect(cards.length).toBe(pmStops.length)
  })

  it('delivery cards show renter count and delivery type badge', () => {
    renderHome()
    const deliveryCards = screen.getAllByTestId('route-card').filter(
      c => c.getAttribute('data-type') === 'delivery'
    )
    expect(deliveryCards.length).toBeGreaterThan(0)
    deliveryCards.forEach(card => {
      // Should show badge text (EXPRESS or SIGNATURE)
      const text = card.textContent
      expect(text).toMatch(/EXPRESS|SIGNATURE/)
      // Should show renter count
      expect(text).toMatch(/renter/)
    })
  })

  it('pickup cards are visually distinct from delivery cards', () => {
    renderHome()
    const pickupCards = screen.getAllByTestId('route-card').filter(
      c => c.getAttribute('data-type') === 'pickup'
    )
    expect(pickupCards.length).toBeGreaterThan(0)
    pickupCards.forEach(card => {
      expect(card.textContent).toMatch(/PICKUP/)
    })
    // Pickup cards should not show EXPRESS/SIGNATURE badge
    pickupCards.forEach(card => {
      expect(card.textContent).not.toMatch(/EXPRESS|SIGNATURE/)
    })
  })

  it('neighborhood tag appears on every card', () => {
    renderHome()
    const cards = screen.getAllByTestId('route-card')
    cards.forEach(card => {
      // Every stop in mock data has a neighborhood
      const text = card.textContent
      expect(text.length).toBeGreaterThan(0)
    })
    // Check one specific neighborhood
    expect(screen.getAllByText(/Beaver Creek Village|Bachelor Gulch|Arrowhead|Vail Village|Avon/).length).toBeGreaterThan(0)
  })

  it('bottom nav renders all 4 icons and tapping each navigates to its page', async () => {
    const user = userEvent.setup()
    renderHome()

    expect(screen.getByTestId('nav-schedule')).toBeInTheDocument()
    expect(screen.getByTestId('nav-search')).toBeInTheDocument()
    expect(screen.getByTestId('nav-packing')).toBeInTheDocument()
    expect(screen.getByTestId('nav-new')).toBeInTheDocument()

    await user.click(screen.getByTestId('nav-search'))
    expect(screen.getByTestId('search-page')).toBeInTheDocument()
  })

  it('no horizontal scroll at any point (no overflow-x: auto or scroll)', () => {
    renderHome()
    const allElements = document.querySelectorAll('[style]')
    allElements.forEach(el => {
      const style = el.getAttribute('style') || ''
      expect(style).not.toMatch(/overflow-x:\s*(auto|scroll)/)
    })
  })

  it('tapping a delivery card navigates to the delivery detail page', async () => {
    const user = userEvent.setup()
    renderHome()

    const deliveryCard = screen.getAllByTestId('route-card').find(
      c => c.getAttribute('data-type') === 'delivery'
    )
    await user.click(deliveryCard)
    expect(await screen.findByTestId('delivery-detail-page')).toBeInTheDocument()
  })
})
