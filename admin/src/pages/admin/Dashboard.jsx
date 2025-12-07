import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { getDashboardStats, getRevenueData } from '../../services/dashboardService'
import { getCompanies } from '../../services/busCompanyService'
import { getSchedules } from '../../services/scheduleService'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'

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
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStations: 0,
    totalCompanies: 0,
    totalBuses: 0,
    totalRoutes: 0,
    totalPosts: 0,
  })
  const [revenueData, setRevenueData] = useState([])
  const [revenuePeriod, setRevenuePeriod] = useState('day') // 'day', 'month', 'year'
  const [companyFilter, setCompanyFilter] = useState('') // Filter theo nhà xe
  const [companies, setCompanies] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loadingRevenue, setLoadingRevenue] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getDashboardStats()
      setStats(data)
    }
    fetchStats()
    
    // Fetch companies và schedules để filter
    const fetchData = async () => {
      try {
        if (user?.roles?.includes('ROLE_ADMIN')) {
          const companiesData = await getCompanies({ page: 1, limit: 1000 })
          console.log('Companies fetched:', companiesData)
          setCompanies(companiesData || [])
        }
        const schedulesData = await getSchedules({ page: 1, limit: 10000 })
        console.log('Schedules fetched:', schedulesData?.length || 0)
        setSchedules(schedulesData || [])
      } catch (error) {
        console.error('Error fetching companies/schedules:', error)
      }
    }
    fetchData()
  }, [user])

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoadingRevenue(true)
      try {
        // Tính toán khoảng thời gian dựa trên period
        const endDate = new Date()
        let startDate = new Date()
        
        if (revenuePeriod === 'day') {
          // 30 ngày gần nhất
          startDate.setDate(endDate.getDate() - 30)
        } else if (revenuePeriod === 'month') {
          // 12 tháng gần nhất
          startDate.setMonth(endDate.getMonth() - 12)
        } else if (revenuePeriod === 'year') {
          // 5 năm gần nhất
          startDate.setFullYear(endDate.getFullYear() - 5)
        }
        
        // Set time về đầu ngày để so sánh chính xác
        startDate.setHours(0, 0, 0, 0)
        // endDate nên là cuối ngày hôm nay
        endDate.setHours(23, 59, 59, 999)
        
        console.log('Fetching revenue data:', {
          period: revenuePeriod,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        
        const data = await getRevenueData(revenuePeriod, startDate, endDate, companyFilter, schedules)
        console.log('Revenue data received:', data)
        setRevenueData(data)
      } catch (error) {
        console.error('Error fetching revenue:', error)
        setRevenueData([])
      } finally {
        setLoadingRevenue(false)
      }
    }
    
    fetchRevenue()
  }, [revenuePeriod, companyFilter, schedules])

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

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Biểu đồ doanh thu</h2>
          <div className="flex items-center gap-4">
            {/* Filter theo nhà xe */}
            {user?.roles?.includes('ROLE_ADMIN') && (
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Tất cả nhà xe</option>
                {companies.length > 0 ? (
                  companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.company_name || company.name || company.companyName || `Nhà xe ${company.id}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải...</option>
                )}
              </select>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setRevenuePeriod('day')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  revenuePeriod === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Theo ngày
              </button>
              <button
                onClick={() => setRevenuePeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  revenuePeriod === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Theo tháng
              </button>
              <button
                onClick={() => setRevenuePeriod('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  revenuePeriod === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Theo năm
              </button>
            </div>
          </div>
        </div>
        
        {loadingRevenue ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>Không có dữ liệu doanh thu</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M VND`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K VND`;
                  return `${value} VND`;
                }}
                label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue' || name === 'Doanh thu') {
                    const formattedValue = new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value);
                    return [formattedValue, 'Doanh thu'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  if (revenuePeriod === 'day') {
                    return `Ngày: ${label}`;
                  } else if (revenuePeriod === 'month') {
                    return `Tháng: ${label}`;
                  } else {
                    return `Năm: ${label}`;
                  }
                }}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#3B82F6" 
                name="Doanh thu"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {/* Summary Stats */}
        {revenueData.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
              <p className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng số vé</p>
              <p className="text-xl font-bold text-gray-900">
                {revenueData.reduce((sum, item) => sum + (item.count || 0), 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Trung bình mỗi {revenuePeriod === 'day' ? 'ngày' : revenuePeriod === 'month' ? 'tháng' : 'năm'}</p>
              <p className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  revenueData.length > 0 
                    ? revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0) / revenueData.length
                    : 0
                )}
              </p>
            </div>
          </div>
        )}
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
