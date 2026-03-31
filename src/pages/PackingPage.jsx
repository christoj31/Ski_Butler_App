import { useState, useMemo } from 'react'
import { usePackItems } from '../context/PackingContext'
import BottomNav from '../components/common/BottomNav'

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function displayDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function PackingPage() {
  const { getPackItemsByDate, markAsPacked } = usePackItems()
  const [activeTab, setActiveTab] = useState('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expandedItemId, setExpandedItemId] = useState(null)
  const [inventoryInputs, setInventoryInputs] = useState({})

  const dateStr = formatDate(currentDate)
  const items = getPackItemsByDate(dateStr)

  function prevDay() {
    setCurrentDate(d => new Date(d.getTime() - 86400000))
  }

  function nextDay() {
    setCurrentDate(d => new Date(d.getTime() + 86400000))
  }

  function handleMarkPacked(item) {
    const invNums = inventoryInputs[item.packItemId] || {}
    markAsPacked(item.packItemId, invNums)
    setExpandedItemId(null)
  }

  function setInvInput(packItemId, key, value) {
    setInventoryInputs(prev => ({
      ...prev,
      [packItemId]: { ...(prev[packItemId] || {}), [key]: value },
    }))
  }

  // Quick Pack: group all today's items by category
  const quickPackGroups = useMemo(() => {
    const groups = {}
    items.forEach(item => {
      const cat = item.category === 'snowboard' ? 'Snowboards' : 'Skis'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)

      // Boots grouped by first boot size
      const bootKey = `Boots (${item.bootSizes[0]})`
      if (!groups[bootKey]) groups[bootKey] = []
      groups[bootKey].push(item)

      // Poles
      if (item.recommendedPoleLength) {
        const poleKey = `Poles (${item.recommendedPoleLength}cm)`
        if (!groups[poleKey]) groups[poleKey] = []
        groups[poleKey].push(item)
      }
    })
    return groups
  }, [items])

  return (
    <div className="page" data-testid="packing-page">
      {/* Tabs */}
      <div style={styles.tabs}>
        {['day', 'quick'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`tab-${tab}`}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === tab ? '#FFD700' : '#2e3448',
              color: activeTab === tab ? '#000' : '#9aa0b4',
              fontWeight: activeTab === tab ? '800' : '600',
            }}
          >
            {tab === 'day' ? 'Day View' : 'Quick Pack'}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      <div style={styles.dateNav}>
        <button onClick={prevDay} style={styles.arrowBtn} aria-label="Previous day" data-testid="prev-day">
          ‹
        </button>
        <span style={styles.dateLabel} data-testid="current-date-display">
          {displayDate(currentDate)}
        </span>
        <button onClick={nextDay} style={styles.arrowBtn} aria-label="Next day" data-testid="next-day">
          ›
        </button>
      </div>

      {activeTab === 'day' && (
        <div data-testid="day-view">
          {items.length === 0 ? (
            <div style={styles.empty}>No items to pack for this day.</div>
          ) : (
            items.map(item => (
              <div key={item.packItemId} style={styles.itemRow} data-testid={`pack-item-${item.packItemId}`}>
                {/* Row header */}
                <button
                  onClick={() => setExpandedItemId(expandedItemId === item.packItemId ? null : item.packItemId)}
                  style={styles.itemHeader}
                  data-testid={`pack-item-toggle-${item.packItemId}`}
                >
                  <span
                    style={styles.statusIcon}
                    data-testid={`pack-status-${item.packItemId}`}
                    data-packed={item.packed}
                  >
                    {item.packed ? '✅' : '⬜'}
                  </span>
                  <div style={styles.itemInfo}>
                    <div style={styles.itemName}>{item.renterName}</div>
                    <div style={styles.itemPkg}>{item.packageName}</div>
                  </div>
                  <span style={styles.chevron}>
                    {expandedItemId === item.packItemId ? '▲' : '▼'}
                  </span>
                </button>

                {/* Expanded detail */}
                {expandedItemId === item.packItemId && (
                  <div style={styles.itemDetail} data-testid={`pack-detail-${item.packItemId}`}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Package</span>
                      <span style={styles.detailValue}>{item.packageName}</span>
                    </div>

                    {/* Boot sizes */}
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Boot Sizes</div>
                      {item.bootSizes.map((size, idx) => {
                        const prefix = String(size).replace('.', '').slice(0, 2)
                        const inputKey = `boot-${idx}`
                        return (
                          <div key={size} style={styles.inventoryInputRow}>
                            <span style={styles.sizePrefix}>
                              {idx === item.recommendedBootIndex ? '⭐' : '○'} {size}
                            </span>
                            <div style={styles.inventoryField}>
                              <span style={styles.prefixDigits}>{prefix}</span>
                              <input
                                type="text"
                                maxLength={3}
                                placeholder="___"
                                value={(inventoryInputs[item.packItemId]?.[inputKey]) || ''}
                                onChange={e => setInvInput(item.packItemId, inputKey, e.target.value.replace(/\D/g, ''))}
                                style={styles.inventoryInput3}
                                data-testid={`boot-inv-${item.packItemId}-${idx}`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Poles */}
                    {item.recommendedPoleLength ? (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Poles</span>
                        <span style={styles.detailValue}>{item.recommendedPoleLength}cm</span>
                      </div>
                    ) : (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Poles</span>
                        <span style={{ ...styles.detailValue, color: '#9aa0b4' }}>N/A</span>
                      </div>
                    )}

                    {/* Bindings */}
                    {item.dinRange ? (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Bindings DIN</span>
                        <span style={styles.detailValue}>{item.dinRange}</span>
                      </div>
                    ) : (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Bindings</span>
                        <span style={{ ...styles.detailValue, color: '#9aa0b4' }}>N/A</span>
                      </div>
                    )}

                    {!item.packed && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleMarkPacked(item)}
                        data-testid={`mark-packed-${item.packItemId}`}
                        style={{ marginTop: '14px' }}
                      >
                        ✓ Mark as Packed
                      </button>
                    )}
                    {item.packed && (
                      <div style={styles.packedBanner}>✅ Packed</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'quick' && (
        <div data-testid="quick-pack-view">
          {Object.entries(quickPackGroups).map(([group, groupItems]) => (
            <div key={group} style={styles.quickGroup}>
              <div style={styles.quickGroupHeader}>
                <span style={styles.quickGroupName}>{group}</span>
                <span style={styles.quickGroupCount}>{groupItems.length}</span>
              </div>
              {groupItems.map(item => (
                <div key={`${group}-${item.packItemId}`} style={styles.quickItem}>
                  <span style={{ color: item.packed ? '#22c55e' : '#9aa0b4' }}>
                    {item.packed ? '✅' : '⬜'}
                  </span>
                  <span style={{ color: '#fff', fontSize: '14px' }}>{item.renterName}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

const styles = {
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tab: { flex: 1, minHeight: '44px', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', padding: '0 16px' },
  dateNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', backgroundColor: '#242938', borderRadius: '10px', padding: '8px 4px', border: '1px solid #3a4055' },
  arrowBtn: { background: 'none', border: 'none', color: '#FFD700', fontSize: '32px', minHeight: '48px', minWidth: '48px', cursor: 'pointer', fontWeight: '300' },
  dateLabel: { fontSize: '15px', fontWeight: '700', color: '#fff', textAlign: 'center', flex: 1 },
  empty: { textAlign: 'center', color: '#9aa0b4', padding: '40px 0', fontSize: '16px' },
  itemRow: { backgroundColor: '#242938', borderRadius: '10px', border: '1px solid #3a4055', marginBottom: '8px', overflow: 'hidden' },
  itemHeader: { width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', minHeight: '64px', textAlign: 'left' },
  statusIcon: { fontSize: '24px', flexShrink: 0 },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  itemName: { fontSize: '16px', fontWeight: '700', color: '#fff' },
  itemPkg: { fontSize: '13px', color: '#9aa0b4' },
  chevron: { fontSize: '14px', color: '#9aa0b4' },
  itemDetail: { padding: '0 16px 16px', borderTop: '1px solid #3a4055' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2e3448' },
  detailSection: { padding: '10px 0', borderBottom: '1px solid #2e3448' },
  detailLabel: { fontSize: '12px', color: '#9aa0b4', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: '16px', fontWeight: '700', color: '#fff' },
  inventoryInputRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  sizePrefix: { fontSize: '14px', color: '#FFD700', fontWeight: '700' },
  inventoryField: { display: 'flex', alignItems: 'center', gap: '2px' },
  prefixDigits: { fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '2px' },
  inventoryInput3: { width: '64px', minHeight: '40px', textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: '800' },
  packedBanner: { marginTop: '12px', backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '10px', color: '#22c55e', fontWeight: '700', textAlign: 'center' },
  quickGroup: { backgroundColor: '#242938', borderRadius: '10px', border: '1px solid #3a4055', marginBottom: '10px', overflow: 'hidden' },
  quickGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #3a4055' },
  quickGroupName: { fontSize: '15px', fontWeight: '700', color: '#FFD700' },
  quickGroupCount: { fontSize: '18px', fontWeight: '900', color: '#fff', backgroundColor: '#3a4055', borderRadius: '20px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' },
  quickItem: { display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #2e3448' },
}
