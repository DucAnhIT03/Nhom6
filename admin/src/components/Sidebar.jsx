import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const MenuItem = ({ to, children }) => {
  return (
    <NavLink 
      to={to}
      end={to === '/admin'}
      className={({isActive}) => 
        `flex items-center px-4 py-2.5 text-gray-300 transition-colors duration-200 ${
          isActive 
            ? 'bg-gray-700 text-white' 
            : 'hover:bg-gray-700/50 hover:text-white'
        }`
      }
    >
      <span className="font-medium text-sm">{children}</span>
    </NavLink>
  )
}

export default function Sidebar(){
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-gray-900 min-h-screen text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">CAR BOOKING</h1>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-2 overflow-y-auto px-2 py-4">
        {user?.roles?.some(r => r === 'ROLE_ADMIN' || r.roleName === 'ROLE_ADMIN') ? (
          <>
            <MenuItem to="/admin">Dashboard</MenuItem>
            <MenuItem to="/admin/users">Quản lý Người dùng</MenuItem>
            <MenuItem to="/admin/stations">Quản lý Bến xe</MenuItem>
            <MenuItem to="/admin/companies">Quản lý Nhà xe</MenuItem>
            <MenuItem to="/admin/buses">Quản lý Xe</MenuItem>
            <MenuItem to="/admin/bus-station">Quản lý Xe ở bến</MenuItem>
            <MenuItem to="/admin/routes">Quản lý Tuyến đường</MenuItem>
            <MenuItem to="/admin/schedules">Quản lý Lịch trình</MenuItem>
            <MenuItem to="/admin/seats">Quản lý Ghế ngồi</MenuItem>
            <MenuItem to="/admin/seat-status-monitor">Trạng thái ghế (Real-time)</MenuItem>
            <MenuItem to="/admin/seat-type-prices">Giá vé theo loại</MenuItem>
            <MenuItem to="/admin/posts">Quản lý Bài viết</MenuItem>
            <MenuItem to="/admin/banners">Quản lý Banner</MenuItem>
          </>
        ) : user?.roles?.some(r => r === 'ROLE_STAFF' || r.roleName === 'ROLE_STAFF') ? (
          <>
            <MenuItem to="/admin/seat-status-monitor">Trạng thái ghế (Real-time)</MenuItem>
          </>
        ) : null}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
