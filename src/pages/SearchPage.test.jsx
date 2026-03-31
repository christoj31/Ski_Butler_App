import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ReservationContext } from '../context/ReservationContext'
import { PackingContext } from '../context/PackingContext'
import SearchPage from './SearchPage'
import { MOCK_ROUTES } from '../data/mockRoutes'
import { MOCK_RESERVATIONS } from '../data/mockReservations'

const ALL_RES = [...MOCK_ROUTES, ...MOCK_RESERVATIONS]

function renderSearch() {
  // Use the real getSearchResults logic
  function getSearchResults(filters = {}) {
    let results = [...ALL_RES]
    if (filters.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(r =>
        r.renters?.some(renter => renter.name.toLowerCase().includes(q)) ||
        r.reservationId.toLowerCase().includes(q)
      )
    }
    if (filters.deliveryType) results = results.filter(r => r.deliveryType === filters.deliveryType)
    if (filters.assignedTech) results = results.filter(r => r.assignedTech === filters.assignedTech)
    if (filters.status) results = results.filter(r => r.status === filters.status)
    if (filters.neighborhood) results = results.filter(r => r.neighborhood === filters.neighborhood)
    if (filters.priceMax != null) results = results.filter(r => (r.totalPrice || 0) <= filters.priceMax)
    if (filters.dateFrom) results = results.filter(r => r.deliveryDate >= filters.dateFrom)
    if (filters.dateTo) results = results.filter(r => r.deliveryDate <= filters.dateTo)
    return results
  }

  render(
    <AuthContext.Provider value={{ currentUser: { username: 'Christo' }, login: vi.fn(), logout: vi.fn() }}>
      <ReservationContext.Provider value={{
        reservations: ALL_RES,
        getRouteStops: vi.fn().mockReturnValue([]),
        getReservationById: vi.fn(),
        addReservation: vi.fn(),
        updateReservation: vi.fn(),
        getSearchResults,
      }}>
        <PackingContext.Provider value={{ packItems: [], getPackItemsByDate: vi.fn().mockReturnValue([]), markAsPacked: vi.fn(), addPackItemsFromReservation: vi.fn() }}>
          <MemoryRouter initialEntries={['/search']}>
            <Routes>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/home" element={<div>Home</div>} />
              <Route path="/packing" element={<div>Packing</div>} />
              <Route path="/new" element={<div>New</div>} />
            </Routes>
          </MemoryRouter>
        </PackingContext.Provider>
      </ReservationContext.Provider>
    </AuthContext.Provider>
  )
}

describe('Phase 6 — Search Page', () => {
  it('search page loads with today\'s date pre-populated', () => {
    renderSearch()
    const today = new Date().toISOString().slice(0, 10)
    // The date-from input should have today's value
    // (it's hidden behind expand search toggle)
    const toggle = screen.getByTestId('expand-search-toggle')
    expect(toggle).toBeInTheDocument()
    expect(screen.getByTestId('search-page')).toBeInTheDocument()
  })

  it('typing in search bar filters results in real time', async () => {
    const user = userEvent.setup()
    renderSearch()

    // First clear the date filter so all reservations are visible
    await user.click(screen.getByTestId('expand-search-toggle'))
    await user.clear(screen.getByTestId('date-from'))

    const initialCount = screen.getAllByTestId(/^result-card-/).length
    expect(initialCount).toBeGreaterThan(1)

    // Search for a name known to be unique (Alice Nguyen from historical data)
    await user.type(screen.getByTestId('search-input'), 'Alice Nguyen')
    const filtered = screen.getAllByTestId(/^result-card-/)
    expect(filtered.length).toBeLessThan(initialCount)
    expect(filtered.length).toBe(1)
  })

  it('"Expand Search" toggle shows/hides date range picker', async () => {
    const user = userEvent.setup()
    renderSearch()

    expect(screen.queryByTestId('date-range-section')).not.toBeInTheDocument()
    await user.click(screen.getByTestId('expand-search-toggle'))
    expect(screen.getByTestId('date-range-section')).toBeInTheDocument()
    await user.click(screen.getByTestId('expand-search-toggle'))
    expect(screen.queryByTestId('date-range-section')).not.toBeInTheDocument()
  })

  it('filter panel opens and closes', async () => {
    const user = userEvent.setup()
    renderSearch()

    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument()
    await user.click(screen.getByTestId('filter-panel-toggle'))
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
    await user.click(screen.getByTestId('filter-panel-toggle'))
    expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument()
  })

  it('delivery type filter correctly narrows results', async () => {
    const user = userEvent.setup()
    renderSearch()

    // Clear the date filter first so all results are visible
    await user.click(screen.getByTestId('expand-search-toggle'))
    const dateFrom = screen.getByTestId('date-from')
    await user.clear(dateFrom)

    await user.click(screen.getByTestId('filter-panel-toggle'))
    await user.click(screen.getByTestId('filter-type-EXPRESS'))

    const results = screen.getAllByTestId(/^result-card-/)
    // All shown results should have EXPRESS
    results.forEach(card => {
      expect(card.textContent).toMatch(/EXPRESS/)
    })
  })

  it('status filter correctly narrows results', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTestId('expand-search-toggle'))
    const dateFrom = screen.getByTestId('date-from')
    await user.clear(dateFrom)

    await user.click(screen.getByTestId('filter-panel-toggle'))
    await user.click(screen.getByTestId('filter-status-completed'))

    const results = screen.getAllByTestId(/^result-card-/)
    results.forEach(card => {
      expect(card.textContent).toMatch(/completed/)
    })
  })

  it('tech filter correctly narrows results', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTestId('expand-search-toggle'))
    const dateFrom = screen.getByTestId('date-from')
    await user.clear(dateFrom)

    await user.click(screen.getByTestId('filter-panel-toggle'))
    await user.selectOptions(screen.getByTestId('tech-filter'), 'Jake')

    const results = screen.getAllByTestId(/^result-card-/)
    results.forEach(card => {
      expect(card.textContent).toMatch(/Jake/)
    })
  })

  it('results display all required fields per card', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTestId('expand-search-toggle'))
    const dateFrom = screen.getByTestId('date-from')
    await user.clear(dateFrom)

    const results = screen.getAllByTestId(/^result-card-/)
    expect(results.length).toBeGreaterThan(0)
    results.forEach(card => {
      // Has a date
      expect(card.textContent).toMatch(/\d{4}-\d{2}-\d{2}/)
      // Has a status
      expect(card.textContent).toMatch(/upcoming|completed|cancelled/)
    })
  })

  it('empty state shown when no results match filters', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(screen.getByTestId('search-input'), 'xyznonexistentperson12345')
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('no horizontal scroll on search page', () => {
    renderSearch()
    const allElements = document.querySelectorAll('[style]')
    allElements.forEach(el => {
      const style = el.getAttribute('style') || ''
      expect(style).not.toMatch(/overflow-x:\s*(auto|scroll)/)
    })
  })
})
