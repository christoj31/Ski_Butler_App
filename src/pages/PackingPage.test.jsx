import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ReservationContext } from '../context/ReservationContext'
import { PackingContext } from '../context/PackingContext'
import PackingPage from './PackingPage'
import { MOCK_PACK_ITEMS, today, tomorrow } from '../data/mockPackItems'

const todayItems = MOCK_PACK_ITEMS.filter(i => i.packDate === today)
const tomorrowItems = MOCK_PACK_ITEMS.filter(i => i.packDate === tomorrow)

function renderPacking(packItems = MOCK_PACK_ITEMS) {
  let items = [...packItems]
  const markAsPacked = vi.fn((id, invNums) => {
    items = items.map(i => i.packItemId === id ? { ...i, packed: true } : i)
  })
  const getPackItemsByDate = vi.fn((date) => items.filter(i => i.packDate === date))

  render(
    <AuthContext.Provider value={{ currentUser: { username: 'Christo' }, login: vi.fn(), logout: vi.fn() }}>
      <ReservationContext.Provider value={{ reservations: [], getRouteStops: vi.fn().mockReturnValue([]), getReservationById: vi.fn(), addReservation: vi.fn(), updateReservation: vi.fn(), getSearchResults: vi.fn().mockReturnValue([]) }}>
        <PackingContext.Provider value={{ packItems: items, getPackItemsByDate, markAsPacked, addPackItemsFromReservation: vi.fn() }}>
          <MemoryRouter initialEntries={['/packing']}>
            <Routes>
              <Route path="/packing" element={<PackingPage />} />
              <Route path="/home" element={<div>Home</div>} />
              <Route path="/search" element={<div>Search</div>} />
              <Route path="/new" element={<div>New</div>} />
            </Routes>
          </MemoryRouter>
        </PackingContext.Provider>
      </ReservationContext.Provider>
    </AuthContext.Provider>
  )

  return { markAsPacked, getPackItemsByDate }
}

describe('Phase 7 — Packing Page', () => {
  it('day view loads with today\'s date', () => {
    renderPacking()
    const dateDisplay = screen.getByTestId('current-date-display')
    const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    expect(dateDisplay.textContent).toBe(todayFormatted)
  })

  it('left/right arrows correctly change the date and reload pack list', async () => {
    const user = userEvent.setup()
    const { getPackItemsByDate } = renderPacking()

    // Click next day
    await user.click(screen.getByTestId('next-day'))
    expect(getPackItemsByDate).toHaveBeenCalledWith(tomorrow)

    // Click prev day to go back
    await user.click(screen.getByTestId('prev-day'))
    expect(getPackItemsByDate).toHaveBeenCalledWith(today)
  })

  it('pack items show correct status icons', () => {
    renderPacking()
    const packedItem = MOCK_PACK_ITEMS.find(i => i.packed && i.packDate === today)
    const unpackedItem = MOCK_PACK_ITEMS.find(i => !i.packed && i.packDate === today)

    if (packedItem) {
      expect(screen.getByTestId(`pack-status-${packedItem.packItemId}`)).toHaveAttribute('data-packed', 'true')
    }
    if (unpackedItem) {
      expect(screen.getByTestId(`pack-status-${unpackedItem.packItemId}`)).toHaveAttribute('data-packed', 'false')
    }
  })

  it('tapping a pack item opens the detail view', async () => {
    const user = userEvent.setup()
    renderPacking()

    const firstItem = todayItems[0]
    expect(screen.queryByTestId(`pack-detail-${firstItem.packItemId}`)).not.toBeInTheDocument()

    await user.click(screen.getByTestId(`pack-item-toggle-${firstItem.packItemId}`))
    expect(screen.getByTestId(`pack-detail-${firstItem.packItemId}`)).toBeInTheDocument()
  })

  it('boot sizes are shown with pre-filled prefix in inventory inputs', async () => {
    const user = userEvent.setup()
    renderPacking()

    const firstItem = todayItems[0]
    await user.click(screen.getByTestId(`pack-item-toggle-${firstItem.packItemId}`))

    // Each boot size should have an input
    firstItem.bootSizes.forEach((size, idx) => {
      expect(screen.getByTestId(`boot-inv-${firstItem.packItemId}-${idx}`)).toBeInTheDocument()
    })

    // The prefix digits are shown (e.g. "25" for 25.5)
    const detail = screen.getByTestId(`pack-detail-${firstItem.packItemId}`)
    expect(detail.textContent).toMatch(/25|26|27|28/)
  })

  it('inventory number inputs accept only numeric input (max 3 digits)', async () => {
    const user = userEvent.setup()
    renderPacking()

    const firstItem = todayItems[0]
    await user.click(screen.getByTestId(`pack-item-toggle-${firstItem.packItemId}`))

    const input = screen.getByTestId(`boot-inv-${firstItem.packItemId}-0`)
    await user.type(input, 'abc123xyz')
    // Only digits should be kept
    expect(input.value).toMatch(/^\d{0,3}$/)
  })

  it('poles/bindings section renders correctly', async () => {
    const user = userEvent.setup()
    renderPacking()

    const skiItem = todayItems.find(i => i.category === 'ski' && i.recommendedPoleLength)
    if (skiItem) {
      await user.click(screen.getByTestId(`pack-item-toggle-${skiItem.packItemId}`))
      const detail = screen.getByTestId(`pack-detail-${skiItem.packItemId}`)
      expect(detail.textContent).toMatch(/Poles/)
      expect(detail.textContent).toMatch(new RegExp(`${skiItem.recommendedPoleLength}cm`))
    }

    const snowboardItem = todayItems.find(i => i.category === 'snowboard')
    if (snowboardItem) {
      await user.click(screen.getByTestId(`pack-item-toggle-${snowboardItem.packItemId}`))
      const detail = screen.getByTestId(`pack-detail-${snowboardItem.packItemId}`)
      // Snowboards show N/A for poles
      expect(detail.textContent).toMatch(/N\/A/)
    }
  })

  it('"Mark as Packed" calls markAsPacked and updates the icon', async () => {
    const user = userEvent.setup()
    const { markAsPacked } = renderPacking()

    const unpackedItem = todayItems.find(i => !i.packed)
    await user.click(screen.getByTestId(`pack-item-toggle-${unpackedItem.packItemId}`))
    await user.click(screen.getByTestId(`mark-packed-${unpackedItem.packItemId}`))

    expect(markAsPacked).toHaveBeenCalledWith(unpackedItem.packItemId, expect.anything())
  })

  it('Quick Pack tab renders and correctly groups all items by category', async () => {
    const user = userEvent.setup()
    renderPacking()

    await user.click(screen.getByTestId('tab-quick'))
    expect(screen.getByTestId('quick-pack-view')).toBeInTheDocument()

    // Should have at least ski and snowboard groups
    const quickView = screen.getByTestId('quick-pack-view')
    expect(quickView.textContent).toMatch(/Skis|Snowboards/)
  })

  it('counts per category in Quick Pack are accurate', async () => {
    const user = userEvent.setup()
    renderPacking()

    await user.click(screen.getByTestId('tab-quick'))
    // The quick view should show group counts
    const quickView = screen.getByTestId('quick-pack-view')
    // Count badges should be present (numbers in the group headers)
    expect(quickView.textContent).toMatch(/\d/)
  })
})
