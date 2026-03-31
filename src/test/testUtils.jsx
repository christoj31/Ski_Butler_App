import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ReservationContext } from '../context/ReservationContext'
import { PackingContext } from '../context/PackingContext'

const defaultAuthValue = {
  currentUser: { username: 'Christo' },
  login: vi.fn(),
  logout: vi.fn(),
}

const defaultReservationValue = {
  reservations: [],
  getRouteStops: vi.fn().mockReturnValue([]),
  getReservationById: vi.fn().mockReturnValue(null),
  addReservation: vi.fn(),
  updateReservation: vi.fn(),
  getSearchResults: vi.fn().mockReturnValue([]),
}

const defaultPackingValue = {
  packItems: [],
  getPackItemsByDate: vi.fn().mockReturnValue([]),
  markAsPacked: vi.fn(),
  addPackItemsFromReservation: vi.fn(),
}

export function renderWithProviders(ui, {
  initialRoute = '/',
  authValue = defaultAuthValue,
  reservationValue = defaultReservationValue,
  packingValue = defaultPackingValue,
  ...options
} = {}) {
  return render(
    <AuthContext.Provider value={authValue}>
      <ReservationContext.Provider value={reservationValue}>
        <PackingContext.Provider value={packingValue}>
          <MemoryRouter initialEntries={[initialRoute]}>
            {ui}
          </MemoryRouter>
        </PackingContext.Provider>
      </ReservationContext.Provider>
    </AuthContext.Provider>,
    options
  )
}
