import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ReservationContext } from '../context/ReservationContext'
import { PackingContext } from '../context/PackingContext'
import CreateReservationPage from './CreateReservationPage'
import SearchPage from './SearchPage'
import TechHomePage from './TechHomePage'
import { matchNeighborhood } from '../utils/neighborhoodMatcher'
import { MOCK_ROUTES } from '../data/mockRoutes'
import { MOCK_RESERVATIONS } from '../data/mockReservations'

const ALL_RES = [...MOCK_ROUTES, ...MOCK_RESERVATIONS]

function renderCreate() {
  let reservations = [...ALL_RES]
  const addReservation = vi.fn((r) => { reservations = [...reservations, r] })
  const addPackItemsFromReservation = vi.fn()

  function getSearchResults(filters = {}) {
    let results = [...reservations]
    if (filters.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(r =>
        r.renters?.some(renter => renter.name.toLowerCase().includes(q)) ||
        r.reservationId?.toLowerCase().includes(q)
      )
    }
    return results
  }

  function getRouteStops(shift, date) {
    return reservations.filter(r => r.deliveryShift === shift && r.deliveryDate === date && r.status !== 'cancelled')
  }

  render(
    <AuthContext.Provider value={{ currentUser: { username: 'Christo' }, login: vi.fn(), logout: vi.fn() }}>
      <ReservationContext.Provider value={{
        reservations,
        getRouteStops,
        getReservationById: vi.fn(),
        addReservation,
        updateReservation: vi.fn(),
        getSearchResults,
      }}>
        <PackingContext.Provider value={{
          packItems: [],
          getPackItemsByDate: vi.fn().mockReturnValue([]),
          markAsPacked: vi.fn(),
          addPackItemsFromReservation,
        }}>
          <MemoryRouter initialEntries={['/new']}>
            <Routes>
              <Route path="/new" element={<CreateReservationPage />} />
              <Route path="/home" element={<TechHomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/packing" element={<div>Packing</div>} />
              <Route path="/delivery/:id" element={<div>Delivery</div>} />
              <Route path="/pickup/:id" element={<div>Pickup</div>} />
            </Routes>
          </MemoryRouter>
        </PackingContext.Provider>
      </ReservationContext.Provider>
    </AuthContext.Provider>
  )

  return { addReservation, addPackItemsFromReservation }
}

async function fillStep1(user, count = 2) {
  for (let i = 1; i < count; i++) {
    await user.click(screen.getByTestId('increment-count'))
  }
  expect(screen.getByTestId('renter-count').textContent).toBe(String(count))
  await user.click(screen.getByTestId('step-1-next'))
}

async function fillStep2(user, renters = [
  { name: 'Test User', ft: '5', in: '8', weight: '150', shoe: '9', ability: 'intermediate' }
]) {
  for (let i = 0; i < renters.length; i++) {
    const r = renters[i]
    await user.type(screen.getByTestId(`renter-name-${i}`), r.name)
    await user.selectOptions(screen.getByTestId(`renter-height-ft-${i}`), r.ft)
    await user.selectOptions(screen.getByTestId(`renter-height-in-${i}`), r.in)
    await user.clear(screen.getByTestId(`renter-weight-${i}`))
    await user.type(screen.getByTestId(`renter-weight-${i}`), r.weight)
    await user.selectOptions(screen.getByTestId(`renter-shoe-${i}`), r.shoe)
    await user.click(screen.getByTestId(`ability-${r.ability}-${i}`))
  }
  await user.click(screen.getByTestId('step-2-next'))
}

describe('Phase 8 — Create Reservation', () => {
  it('step 1 stepper correctly sets renter count (minimum 1)', async () => {
    const user = userEvent.setup()
    renderCreate()

    expect(screen.getByTestId('renter-count').textContent).toBe('1')

    // Can't decrement below 1
    expect(screen.getByTestId('decrement-count')).toBeDisabled()

    await user.click(screen.getByTestId('increment-count'))
    expect(screen.getByTestId('renter-count').textContent).toBe('2')

    await user.click(screen.getByTestId('decrement-count'))
    expect(screen.getByTestId('renter-count').textContent).toBe('1')
    expect(screen.getByTestId('decrement-count')).toBeDisabled()
  })

  it('step 2 generates the correct number of renter forms', async () => {
    const user = userEvent.setup()
    renderCreate()

    await fillStep1(user, 3)

    expect(screen.getByTestId('step-2')).toBeInTheDocument()
    expect(screen.getByTestId('renter-form-0')).toBeInTheDocument()
    expect(screen.getByTestId('renter-form-1')).toBeInTheDocument()
    expect(screen.getByTestId('renter-form-2')).toBeInTheDocument()
  })

  it('all renter fields validate — cannot submit with empty fields', async () => {
    const user = userEvent.setup()
    renderCreate()

    await fillStep1(user, 1)

    // Try to proceed without filling fields
    await user.click(screen.getByTestId('step-2-next'))
    // Should still be on step 2 (validation failed)
    expect(screen.getByTestId('step-2')).toBeInTheDocument()
    // Error messages should appear
    expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
  })

  it('ability selector highlights the selected option', async () => {
    const user = userEvent.setup()
    renderCreate()
    await fillStep1(user, 1)

    const advancedBtn = screen.getByTestId('ability-advanced-0')
    await user.click(advancedBtn)

    expect(advancedBtn).toHaveAttribute('data-selected', 'true')
    // Other abilities should not be selected
    expect(screen.getByTestId('ability-beginner-0')).toHaveAttribute('data-selected', 'false')
  })

  it('step 3 shows one package selection screen per renter (sequential)', async () => {
    const user = userEvent.setup()
    renderCreate()

    await fillStep1(user, 2)
    await fillStep2(user, [
      { name: 'Alice', ft: '5', in: '6', weight: '130', shoe: '7', ability: 'intermediate' },
      { name: 'Bob', ft: '6', in: '0', weight: '180', shoe: '10', ability: 'advanced' },
    ])

    expect(screen.getByTestId('step-3')).toBeInTheDocument()
    // Should show first renter's name
    expect(screen.getByText(/Alice/)).toBeInTheDocument()

    // Select a package for first renter
    await user.click(screen.getByTestId('package-basic-ski'))
    expect(screen.getByTestId('package-basic-ski')).toHaveAttribute('data-selected', 'true')

    // Next renter
    await user.click(screen.getByTestId('step-3-next'))
    expect(screen.getByText(/Bob/)).toBeInTheDocument()
  })

  it('selecting a package highlights it and enables Next', async () => {
    const user = userEvent.setup()
    renderCreate()
    await fillStep1(user, 1)
    await fillStep2(user)

    // Next should be disabled initially
    expect(screen.getByTestId('step-3-next')).toBeDisabled()

    await user.click(screen.getByTestId('package-signature-ski'))
    expect(screen.getByTestId('step-3-next')).not.toBeDisabled()
  })

  it('step 4 delivery window toggle, address field, and delivery type all work', async () => {
    const user = userEvent.setup()
    renderCreate()
    await fillStep1(user, 1)
    await fillStep2(user)

    await user.click(screen.getByTestId('package-basic-ski'))
    await user.click(screen.getByTestId('step-3-next'))

    expect(screen.getByTestId('step-4')).toBeInTheDocument()

    // Toggle PM
    await user.click(screen.getByTestId('shift-pm'))
    // Toggle Express
    await user.click(screen.getByTestId('type-express'))
    // Type address
    await user.type(screen.getByTestId('delivery-address'), '45 Beaver Creek Blvd, Beaver Creek, CO')

    // Next should be enabled
    expect(screen.getByTestId('step-4-next')).not.toBeDisabled()
  })

  it('step 5 summary shows all renters, packages, delivery details', async () => {
    const user = userEvent.setup()
    renderCreate()
    await fillStep1(user, 1)
    await fillStep2(user, [{ name: 'Jane Doe', ft: '5', in: '5', weight: '125', shoe: '7', ability: 'beginner' }])
    await user.click(screen.getByTestId('package-basic-ski'))
    await user.click(screen.getByTestId('step-3-next'))
    await user.type(screen.getByTestId('delivery-address'), '45 Beaver Creek Blvd, Beaver Creek, CO')
    await user.click(screen.getByTestId('step-4-next'))

    expect(screen.getByTestId('step-5')).toBeInTheDocument()
    expect(screen.getByTestId('summary-renter-0').textContent).toMatch(/Jane Doe/)
    expect(screen.getByTestId('step-5').textContent).toMatch(/Beaver Creek/)
  })

  it('confirming generates a unique reservation ID', async () => {
    const user = userEvent.setup()
    const { addReservation } = renderCreate()
    await fillStep1(user, 1)
    await fillStep2(user, [{ name: 'John Smith', ft: '6', in: '0', weight: '180', shoe: '10', ability: 'advanced' }])
    await user.click(screen.getByTestId('package-performance-ski'))
    await user.click(screen.getByTestId('step-3-next'))
    await user.type(screen.getByTestId('delivery-address'), '100 Main St, Vail, CO')
    await user.click(screen.getByTestId('step-4-next'))
    await user.click(screen.getByTestId('confirm-reservation'))

    expect(addReservation).toHaveBeenCalledOnce()
    const calledWith = addReservation.mock.calls[0][0]
    expect(calledWith.reservationId).toMatch(/^RES-\d{4}-N\d+$/)
  })

  it('neighborhood tag is correctly auto-assigned based on address', () => {
    expect(matchNeighborhood('45 Beaver Creek Blvd')).toBe('Beaver Creek Village')
    expect(matchNeighborhood('10 Bachelor Gulch Way')).toBe('Bachelor Gulch')
    expect(matchNeighborhood('5 Arrowhead Dr')).toBe('Arrowhead')
    expect(matchNeighborhood('99 Vail Valley Dr')).toBe('Vail Village')
    expect(matchNeighborhood('8 Avon Rd')).toBe('Avon / Edwards')
    expect(matchNeighborhood('Unknown Street')).toBe('Avon / Edwards')
  })

  it('new reservation appears on confirmation screen with neighborhood', async () => {
    const user = userEvent.setup()
    renderCreate()
    await fillStep1(user, 1)
    await fillStep2(user, [{ name: 'Max Power', ft: '5', in: '10', weight: '160', shoe: '9', ability: 'intermediate' }])
    await user.click(screen.getByTestId('package-basic-ski'))
    await user.click(screen.getByTestId('step-3-next'))
    await user.type(screen.getByTestId('delivery-address'), '50 Arrowhead Dr, Edwards, CO')
    await user.click(screen.getByTestId('step-4-next'))
    await user.click(screen.getByTestId('confirm-reservation'))

    expect(screen.getByTestId('confirmation-screen')).toBeInTheDocument()
    expect(screen.getByTestId('confirmed-neighborhood').textContent).toBe('Arrowhead')
    expect(screen.getByTestId('confirmed-reservation-id').textContent).toMatch(/RES-/)
  })
})
