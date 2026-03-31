import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ReservationProvider } from './context/ReservationContext'
import { PackingProvider } from './context/PackingContext'
import { MOCK_ROUTES } from './data/mockRoutes'
import { MOCK_RESERVATIONS } from './data/mockReservations'
import { MOCK_PACK_ITEMS } from './data/mockPackItems'
import LoginPage from './pages/LoginPage'
import TechHomePage from './pages/TechHomePage'
import SearchPage from './pages/SearchPage'
import PackingPage from './pages/PackingPage'
import { usePackItems } from './context/PackingContext'
import CreateReservationPage from './pages/CreateReservationPage'
import DeliveryDetailPage from './pages/DeliveryDetailPage'
import PayBillPage from './pages/PayBillPage'
import PickupDetailPage from './pages/PickupDetailPage'
import TuningPage from './pages/TuningPage'
import ManagerViewPage from './pages/ManagerViewPage'

const ALL_RESERVATIONS = [...MOCK_ROUTES, ...MOCK_RESERVATIONS]

export default function App() {
  return (
    <AuthProvider>
      <ReservationProvider initialReservations={ALL_RESERVATIONS}>
        <PackingProvider initialPackItems={MOCK_PACK_ITEMS}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<TechHomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/packing" element={<PackingPage />} />
              <Route path="/new" element={<CreateReservationPage />} />
              <Route path="/delivery/:reservationId" element={<DeliveryDetailPage />} />
              <Route path="/delivery/:reservationId/pay" element={<PayBillPage />} />
              <Route path="/pickup/:reservationId" element={<PickupDetailPage />} />
              <Route path="/tuning" element={<TuningPage />} />
              <Route path="/manager" element={<ManagerViewPage />} />
            </Routes>
          </HashRouter>
        </PackingProvider>
      </ReservationProvider>
    </AuthProvider>
  )
}
