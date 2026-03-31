import { useState, useMemo } from 'react'
import { useReservations } from '../context/ReservationContext'
import BottomNav from '../components/common/BottomNav'

const TECHS = ['Christo', 'Jake', 'Maria', 'Devon']
const NEIGHBORHOODS = ['Beaver Creek Village', 'Bachelor Gulch', 'Arrowhead', 'Vail Village', 'Avon / Edwards']
const STATUS_OPTIONS = ['upcoming', 'completed', 'cancelled']

const today = new Date().toISOString().slice(0, 10)

export default function SearchPage() {
  const { getSearchResults } = useReservations()
  const [query, setQuery] = useState('')
  const [expandSearch, setExpandSearch] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: today,
    dateTo: '',
    deliveryType: '',
    priceMin: 0,
    priceMax: 1000,
    assignedTech: '',
    status: '',
    neighborhood: '',
  })

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const results = useMemo(() => {
    const activeFilters = { ...filters, query }
    if (!activeFilters.deliveryType) delete activeFilters.deliveryType
    if (!activeFilters.assignedTech) delete activeFilters.assignedTech
    if (!activeFilters.status) delete activeFilters.status
    if (!activeFilters.neighborhood) delete activeFilters.neighborhood
    if (!activeFilters.dateTo) delete activeFilters.dateTo
    return getSearchResults(activeFilters)
  }, [query, filters, getSearchResults])

  return (
    <div className="page" data-testid="search-page">
      <h2 style={styles.title}>Search</h2>

      {/* Search bar */}
      <input
        type="search"
        placeholder="Search by name or reservation ID…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        data-testid="search-input"
        style={{ marginBottom: '8px' }}
      />

      {/* Expand search toggle */}
      <button
        onClick={() => setExpandSearch(e => !e)}
        style={styles.expandBtn}
        data-testid="expand-search-toggle"
      >
        {expandSearch ? '▲ Collapse Search' : '▼ Expand Search'}
      </button>

      {expandSearch && (
        <div style={styles.dateRange} data-testid="date-range-section">
          <div style={styles.dateRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => updateFilter('dateFrom', e.target.value)}
                data-testid="date-from"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => updateFilter('dateTo', e.target.value)}
                data-testid="date-to"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter panel toggle */}
      <button
        onClick={() => setFiltersOpen(f => !f)}
        style={styles.filterToggle}
        data-testid="filter-panel-toggle"
      >
        🔧 Filters {filtersOpen ? '▲' : '▼'}
      </button>

      {filtersOpen && (
        <div style={styles.filterPanel} data-testid="filter-panel">
          {/* Delivery Type */}
          <div style={styles.filterRow}>
            <label style={styles.label}>Delivery Type</label>
            <div style={styles.filterBtns}>
              {['', 'EXPRESS', 'SIGNATURE'].map(t => (
                <button
                  key={t}
                  onClick={() => updateFilter('deliveryType', t)}
                  data-testid={`filter-type-${t || 'all'}`}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: filters.deliveryType === t ? '#FFD700' : '#2e3448',
                    color: filters.deliveryType === t ? '#000' : '#fff',
                  }}
                >
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={styles.filterRow}>
            <label style={styles.label}>Max Price: ${filters.priceMax}</label>
            <input
              type="range"
              min={0}
              max={1000}
              step={25}
              value={filters.priceMax}
              onChange={e => updateFilter('priceMax', Number(e.target.value))}
              data-testid="price-range-slider"
              style={{ width: '100%' }}
            />
          </div>

          {/* Assigned Tech */}
          <div style={styles.filterRow}>
            <label style={styles.label}>Tech</label>
            <select
              value={filters.assignedTech}
              onChange={e => updateFilter('assignedTech', e.target.value)}
              data-testid="tech-filter"
            >
              <option value="">All Techs</option>
              {TECHS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Status */}
          <div style={styles.filterRow}>
            <label style={styles.label}>Status</label>
            <div style={styles.filterBtns}>
              {['', ...STATUS_OPTIONS].map(s => (
                <button
                  key={s}
                  onClick={() => updateFilter('status', s)}
                  data-testid={`filter-status-${s || 'all'}`}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: filters.status === s ? '#FFD700' : '#2e3448',
                    color: filters.status === s ? '#000' : '#fff',
                  }}
                >
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhood */}
          <div style={styles.filterRow}>
            <label style={styles.label}>Neighborhood</label>
            <select
              value={filters.neighborhood}
              onChange={e => updateFilter('neighborhood', e.target.value)}
              data-testid="neighborhood-filter"
            >
              <option value="">All Neighborhoods</option>
              {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div style={styles.resultsHeader}>
        <span style={styles.resultsCount}>{results.length} result{results.length !== 1 ? 's' : ''}</span>
      </div>

      {results.length === 0 ? (
        <div style={styles.empty} data-testid="empty-state">
          No reservations match your search.
        </div>
      ) : (
        <div data-testid="search-results">
          {results.map(r => (
            <div key={r.reservationId} style={styles.resultCard} data-testid={`result-card-${r.reservationId}`}>
              <div style={styles.resultTop}>
                <span style={styles.resultNames}>
                  {r.renters?.map(renter => renter.name).join(', ')}
                </span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor:
                    r.status === 'completed' ? 'rgba(34,197,94,0.15)' :
                    r.status === 'cancelled' ? 'rgba(239,68,68,0.15)' :
                    'rgba(255,215,0,0.15)',
                  color:
                    r.status === 'completed' ? '#22c55e' :
                    r.status === 'cancelled' ? '#ef4444' :
                    '#FFD700',
                }}>
                  {r.status}
                </span>
              </div>
              <div style={styles.resultMeta}>
                <span>{r.deliveryDate}</span>
                {r.deliveryType && <span style={{ color: '#FFD700' }}>{r.deliveryType}</span>}
                <span style={{ color: '#9aa0b4' }}>{r.assignedTech}</span>
              </div>
              <div style={styles.resultAddress}>{r.address}</div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

const styles = {
  title: { fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '14px' },
  expandBtn: {
    background: 'none',
    border: '1px solid #3a4055',
    color: '#9aa0b4',
    fontSize: '14px',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '12px',
    width: '100%',
    minHeight: '48px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  dateRange: { backgroundColor: '#242938', borderRadius: '10px', padding: '14px', marginBottom: '12px', border: '1px solid #3a4055' },
  dateRow: { display: 'flex', gap: '12px' },
  label: { fontSize: '12px', color: '#9aa0b4', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' },
  filterToggle: {
    background: 'none',
    border: '1px solid #3a4055',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '12px',
    width: '100%',
    minHeight: '48px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  filterPanel: { backgroundColor: '#242938', borderRadius: '12px', padding: '16px', marginBottom: '14px', border: '1px solid #3a4055', display: 'flex', flexDirection: 'column', gap: '14px' },
  filterRow: { display: 'flex', flexDirection: 'column', gap: '6px' },
  filterBtns: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterBtn: { minHeight: '36px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: '600', padding: '0 12px', cursor: 'pointer' },
  resultsHeader: { display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' },
  resultsCount: { fontSize: '13px', color: '#9aa0b4' },
  empty: { textAlign: 'center', color: '#9aa0b4', padding: '40px 0', fontSize: '16px' },
  resultCard: { backgroundColor: '#242938', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #3a4055' },
  resultTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  resultNames: { fontSize: '15px', fontWeight: '700', color: '#fff', flex: 1, marginRight: '8px' },
  statusBadge: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '4px', textTransform: 'capitalize', flexShrink: 0 },
  resultMeta: { display: 'flex', gap: '10px', fontSize: '13px', color: '#9aa0b4', marginBottom: '4px', flexWrap: 'wrap' },
  resultAddress: { fontSize: '13px', color: '#9aa0b4' },
}
