import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import Stations from './pages/admin/Stations'
import BusCompanies from './pages/admin/BusCompanies'
import Buses from './pages/admin/Buses'
import BusStation from './pages/admin/BusStation'
import RoutesPage from './pages/admin/Routes'
import Posts from './pages/admin/Posts'
import Seats from './pages/admin/Seats'
import Schedules from './pages/admin/Schedules'
import SeatTypePrices from './pages/admin/SeatTypePrices'

function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<Dashboard/>} />
            <Route path="/admin/users" element={<Users/>} />
            <Route path="/admin/stations" element={<Stations/>} />
            <Route path="/admin/companies" element={<BusCompanies/>} />
            <Route path="/admin/buses" element={<Buses/>} />
            <Route path="/admin/bus-station" element={<BusStation/>} />
            <Route path="/admin/routes" element={<RoutesPage/>} />
            <Route path="/admin/seats" element={<Seats/>} />
            <Route path="/admin/seat-type-prices" element={<SeatTypePrices/>} />
            <Route path="/admin/schedules" element={<Schedules/>} />
            <Route path="/admin/posts" element={<Posts/>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      } />
    </Routes>
  )
}
