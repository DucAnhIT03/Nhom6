import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { getDashboardStats } from '../../services/dashboardService'

const StatCard = ({ title, value, iconColor, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <span className="mr-1">{trend > 0 ? '↑' : '↓'}</span>
              {Math.abs(trend)}% so với tháng trước
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStations: 0,
    totalCompanies: 0,
    totalBuses: 0,
    totalRoutes: 0,
    totalPosts: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getDashboardStats()
      setStats(data)
    }
    fetchStats()
  }, [])

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Tổng người dùng" 
          value={stats.totalUsers.toLocaleString()} 
          iconColor="bg-red-100"
          trend={12}
        />
        <StatCard 
          title="Tổng bến xe" 
          value={stats.totalStations} 
          iconColor="bg-blue-100"
          trend={5}
        />
        <StatCard 
          title="Tổng nhà xe" 
          value={stats.totalCompanies} 
          iconColor="bg-orange-100"
          trend={2}
        />
        <StatCard 
          title="Tổng xe" 
          value={stats.totalBuses} 
          iconColor="bg-teal-100"
          trend={8}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          title="Tổng tuyến đường" 
          value={stats.totalRoutes} 
          iconColor="bg-purple-100"
          trend={3}
        />
        <StatCard 
          title="Tổng bài viết" 
          value={stats.totalPosts} 
          iconColor="bg-pink-100"
          trend={-2}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Người dùng mới đăng ký</p>
              <p className="text-sm text-gray-500">2 giờ trước</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Thêm xe mới</p>
              <p className="text-sm text-gray-500">5 giờ trước</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Cập nhật tuyến đường</p>
              <p className="text-sm text-gray-500">1 ngày trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
