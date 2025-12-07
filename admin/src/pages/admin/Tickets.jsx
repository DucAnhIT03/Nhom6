import React, { useEffect, useState, useMemo } from 'react'
import Table from '../../components/Table'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import { getTickets, getTicket, cancelTicket, deleteTicket } from '../../services/ticketService'
import { getSchedules } from '../../services/scheduleService'
import { getCompanies } from '../../services/busCompanyService'
import { useAuth } from '../../contexts/AuthContext'

export default function Tickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [allTickets, setAllTickets] = useState([])
  const [schedules, setSchedules] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [companyFilter, setCompanyFilter] = useState('')
  const [scheduleFilter, setScheduleFilter] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      // Lấy tất cả vé, bao gồm cả vé quá khứ (không filter theo ngày)
      const params = {
        page: 1,
        limit: 10000 // Tăng limit để lấy nhiều vé hơn, bao gồm cả vé quá khứ
      }
      
      // Nếu là staff, chỉ lấy vé của nhà xe được gán
      if (user?.roles?.includes('ROLE_STAFF') && user?.busCompanyId) {
        // Lấy tất cả vé (bao gồm cả quá khứ), sau đó filter theo company
        const allTicketsData = await getTickets(params)
        // Lấy schedules để filter theo company
        const schedulesData = await getSchedules({ page: 1, limit: 10000 })
        const companySchedules = schedulesData.filter(s => 
          s.bus?.company_id === user.busCompanyId || 
          s.route?.bus_company_id === user.busCompanyId
        )
        const companyScheduleIds = companySchedules.map(s => s.id)
        const filteredTickets = allTicketsData.filter(t => 
          companyScheduleIds.includes(t.scheduleId || t.schedule_id)
        )
        // Sắp xếp theo thời gian khởi hành (mới nhất trước)
        filteredTickets.sort((a, b) => {
          const timeA = new Date(a.departureTime || a.departure_time || a.schedule?.departure_time || 0).getTime()
          const timeB = new Date(b.departureTime || b.departure_time || b.schedule?.departure_time || 0).getTime()
          return timeB - timeA // Mới nhất trước
        })
        setAllTickets(filteredTickets)
        setTickets(filteredTickets)
      } else {
        const data = await getTickets(params)
        // Sắp xếp theo thời gian khởi hành (mới nhất trước)
        data.sort((a, b) => {
          const timeA = new Date(a.departureTime || a.departure_time || a.schedule?.departure_time || 0).getTime()
          const timeB = new Date(b.departureTime || b.departure_time || b.schedule?.departure_time || 0).getTime()
          return timeB - timeA // Mới nhất trước
        })
        setAllTickets(data)
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      alert('Không thể tải danh sách vé')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      // Lấy tất cả lịch trình, bao gồm cả quá khứ (không filter theo ngày)
      const data = await getSchedules({ page: 1, limit: 10000 })
      // Sắp xếp theo thời gian khởi hành (mới nhất trước)
      data.sort((a, b) => {
        const timeA = new Date(a.departure_time || 0).getTime()
        const timeB = new Date(b.departure_time || 0).getTime()
        return timeB - timeA // Mới nhất trước
      })
      setSchedules(data)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  useEffect(() => {
    fetchTickets()
    fetchSchedules()
    if (user?.roles?.includes('ROLE_ADMIN')) {
      fetchCompanies()
    }
  }, [user])

  // Filter tickets (không filter theo ngày - hiển thị tất cả vé kể cả quá khứ)
  useEffect(() => {
    let filtered = [...allTickets]

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => {
        const status = ticket.status || 'PENDING'
        // Map các trạng thái tương đương
        const statusMap = {
          'COMPLETED': ['COMPLETED', 'SUCCESS', 'PAID', 'BOOKED'], // BOOKED = vé tại quầy (đã thanh toán)
          'PENDING': ['PENDING', 'WAITING_PAYMENT', 'ACTIVE'], // BOOKED không còn là pending nữa
          'FAILED': ['FAILED', 'PAYMENT_FAILED', 'CANCELLED']
        }
        
        // Nếu filter là một trong các nhóm, check tất cả trạng thái trong nhóm
        if (statusMap[statusFilter]) {
          return statusMap[statusFilter].includes(status)
        }
        
        return status === statusFilter
      })
    }

    // Filter by company
    if (companyFilter) {
      filtered = filtered.filter(ticket => {
        const schedule = schedules.find(s => 
          s.id === (ticket.scheduleId || ticket.schedule_id)
        )
        const busCompanyId = schedule?.bus?.company_id || schedule?.route?.bus_company_id
        return Number(busCompanyId) === Number(companyFilter)
      })
    }

    // Filter by schedule
    if (scheduleFilter) {
      filtered = filtered.filter(ticket => {
        return (ticket.scheduleId || ticket.schedule_id) === Number(scheduleFilter)
      })
    }

    // Filter by search term (ticket code, customer name, phone)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(ticket => {
        const ticketCode = (ticket.ticketCode || ticket.ticket_code || '').toLowerCase()
        const customerName = `${ticket.user?.first_name || ''} ${ticket.user?.last_name || ''}`.toLowerCase()
        const customerPhone = (ticket.user?.phone || '').toLowerCase()
        const seatNumber = (ticket.seat?.seatNumber || ticket.seat?.seat_number || '').toLowerCase()
        
        return ticketCode.includes(searchLower) || 
               customerName.includes(searchLower) || 
               customerPhone.includes(searchLower) ||
               seatNumber.includes(searchLower)
      })
    }

    // Giữ nguyên thứ tự đã sắp xếp (mới nhất trước)
    setTickets(filtered)
  }, [searchTerm, statusFilter, companyFilter, scheduleFilter, allTickets, schedules])

  const handleViewDetail = async (ticket) => {
    try {
      const detail = await getTicket(ticket.id)
      setSelectedTicket(detail)
      setDetailModalOpen(true)
    } catch (error) {
      console.error('Error fetching ticket detail:', error)
      alert('Không thể tải chi tiết vé')
    }
  }

  const handleCancelTicket = async (ticket) => {
    const failedStatuses = ['FAILED', 'PAYMENT_FAILED', 'CANCELLED']
    if (failedStatuses.includes(ticket.status)) {
      alert('Vé này đã thanh toán thất bại')
      return
    }

    const ticketCode = ticket.ticketCode || ticket.ticket_code || ticket.id
    if (!confirm(`Bạn có chắc chắn muốn hủy vé ${ticketCode}? Vé sẽ được đánh dấu là thanh toán thất bại.`)) {
      return
    }

    setCancelling(true)
    try {
      await cancelTicket(ticket.id)
      alert('Đã đánh dấu vé là thanh toán thất bại')
      fetchTickets()
      if (detailModalOpen && selectedTicket?.id === ticket.id) {
        setDetailModalOpen(false)
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error cancelling ticket:', error)
      const message = error?.response?.data?.message || error?.message || 'Không thể hủy vé'
      alert(message)
    } finally {
      setCancelling(false)
    }
  }

  const handleDeleteTicket = async (ticket) => {
    const ticketCode = ticket.ticketCode || ticket.ticket_code || ticket.id
    if (!confirm(`Bạn có chắc chắn muốn XÓA vé ${ticketCode}?\n\nHành động này không thể hoàn tác. Vé sẽ bị xóa vĩnh viễn khỏi hệ thống.`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteTicket(ticket.id)
      alert('Đã xóa vé thành công')
      fetchTickets()
      if (detailModalOpen && selectedTicket?.id === ticket.id) {
        setDetailModalOpen(false)
        setSelectedTicket(null)
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      const message = error?.response?.data?.message || error?.message || 'Không thể xóa vé'
      alert(message)
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  const formatDateTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status, ticket = null) => {
    // Phân biệt vé tại quầy vs vé online
    // Vé tại quầy có _isCounterTicket flag hoặc được lưu trong localStorage
    let isCounterTicket = ticket?._isCounterTicket || ticket?.isCounterTicket || false
    
    // Nếu không có flag, kiểm tra localStorage
    if (!isCounterTicket && ticket?.id) {
      try {
        const counterTicketIds = JSON.parse(localStorage.getItem('counter_ticket_ids') || '[]')
        isCounterTicket = counterTicketIds.includes(ticket.id)
      } catch (e) {
        // Ignore
      }
    }
    
    // Nếu chưa xác định được, thử các cách khác để nhận diện vé tại quầy:
    // 1. Vé có status BOOKED và có vẻ như được tạo tại quầy (có thể dựa vào một số tiêu chí)
    // 2. Hoặc vé có status BOOKED và không có thông tin khách hàng đầy đủ (vé tại quầy thường có thông tin đầy đủ)
    // 3. Hoặc vé có status BOOKED và được tạo bởi staff/admin
    if (!isCounterTicket && status === 'BOOKED' && ticket) {
      // Kiểm tra xem vé có được tạo từ endpoint admin/counter không
      // (có thể dựa vào một số đặc điểm khác nếu backend không trả về field rõ ràng)
      
      // Nếu vé có status BOOKED và không có trong localStorage, 
      // nhưng có vẻ như được tạo tại quầy (ví dụ: có thông tin khách hàng đầy đủ),
      // hoặc đơn giản: nếu vé có status BOOKED và không phải là vé online đang đợi thanh toán,
      // có thể coi là vé tại quầy (vì vé online thường có status khác khi chưa thanh toán)
      
      // Tạm thời: Nếu vé có status BOOKED, coi là vé tại quầy (đã thanh toán)
      // Vì vé online chưa thanh toán thường có status PENDING, WAITING_PAYMENT, hoặc ACTIVE
      // Chỉ có vé tại quầy mới có status BOOKED ngay từ đầu (đã thanh toán tại quầy)
      isCounterTicket = true
    }
    
    // Nếu là vé tại quầy và status là BOOKED, hiển thị là "Thanh toán thành công"
    if (isCounterTicket && (status === 'BOOKED' || !status)) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          Thanh toán thành công
        </span>
      )
    }
    
    const statuses = {
      // Thanh toán thành công
      'COMPLETED': { label: 'Thanh toán thành công', color: 'bg-green-100 text-green-800' },
      'SUCCESS': { label: 'Thanh toán thành công', color: 'bg-green-100 text-green-800' },
      'PAID': { label: 'Thanh toán thành công', color: 'bg-green-100 text-green-800' },
      // Đang đợi thanh toán
      'PENDING': { label: 'Đang đợi thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      'WAITING_PAYMENT': { label: 'Đang đợi thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      'ACTIVE': { label: 'Đang đợi thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      'BOOKED': { label: 'Đang đợi thanh toán', color: 'bg-yellow-100 text-yellow-800' }, // Vé đã đặt nhưng chưa thanh toán (vé online)
      // Thanh toán thất bại
      'FAILED': { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
      'PAYMENT_FAILED': { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
      'CANCELLED': { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
      // Trạng thái cũ (backward compatibility)
      'USED': { label: 'Đã sử dụng', color: 'bg-gray-100 text-gray-800' }
    }
    const statusInfo = statuses[status] || { label: status || 'N/A', color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getSeatTypeLabel = (seatType) => {
    const types = {
      'STANDARD': 'Thường',
      'VIP': 'VIP',
      'DOUBLE': 'Đôi',
      'LUXURY': 'Luxury'
    }
    return types[seatType] || seatType || 'Thường'
  }

  const columns = [
    {
      key: 'ticket_code',
      title: 'Mã vé',
      dataIndex: 'ticketCode',
      render: (value, record) => value || record.ticket_code || `#${record.id}`
    },
    {
      key: 'customer',
      title: 'Khách hàng',
      render: (value, record) => {
        const user = record.user || {}
        return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'
      }
    },
    {
      key: 'phone',
      title: 'SĐT',
      render: (value, record) => {
        const user = record.user || {}
        return user.phone || 'N/A'
      }
    },
    {
      key: 'route',
      title: 'Tuyến',
      render: (value, record) => {
        const schedule = record.schedule || {}
        const route = schedule.route || {}
        if (route.departure_station && route.arrival_station) {
          return `${route.departure_station} → ${route.arrival_station}`
        }
        return 'N/A'
      }
    },
    {
      key: 'departure_time',
      title: 'Khởi hành',
      render: (value, record) => {
        const time = record.departureTime || record.departure_time || record.schedule?.departure_time
        return formatDateTime(time)
      }
    },
    {
      key: 'seat',
      title: 'Ghế',
      render: (value, record) => {
        const seat = record.seat || {}
        const seatNumber = seat.seatNumber || seat.seat_number || 'N/A'
        const seatType = getSeatTypeLabel(seat.seatType || seat.seat_type)
        return `${seatNumber} (${seatType})`
      }
    },
    {
      key: 'price',
      title: 'Giá vé',
      dataIndex: 'price',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'status',
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value, record) => getStatusBadge(value || 'ACTIVE', record)
    },
    {
      key: 'created_at',
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      render: (value, record) => formatDateTime(value || record.created_at)
    }
  ]

  return (
    <div className="p-6">
      <Header 
        title="Quản lý vé đã đặt" 
        onRefresh={fetchTickets}
      />

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <FormInput
              type="text"
              label="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mã vé, tên KH, SĐT, số ghế..."
            />
          </div>
          <div>
            <FormInput
              type="select"
              label="Trạng thái"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tất cả' },
                { value: 'COMPLETED', label: 'Thanh toán thành công' },
                { value: 'PENDING', label: 'Đang đợi thanh toán' },
                { value: 'FAILED', label: 'Thanh toán thất bại' }
              ]}
            />
          </div>
          {user?.roles?.includes('ROLE_ADMIN') && (
            <div>
              <FormInput
                type="select"
                label="Nhà xe"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                options={[
                  { value: '', label: 'Tất cả nhà xe' },
                  ...companies.map(company => ({
                    value: company.id,
                    label: company.company_name
                  }))
                ]}
              />
            </div>
          )}
          <div>
            <FormInput
              type="select"
              label="Lịch trình"
              value={scheduleFilter}
              onChange={(e) => setScheduleFilter(e.target.value)}
              options={[
                { value: '', label: 'Tất cả lịch trình' },
                ...schedules.map(schedule => {
                  const route = schedule.route || {}
                  const routeInfo = route.departure_station && route.arrival_station
                    ? `${route.departure_station} → ${route.arrival_station}`
                    : 'N/A'
                  const time = schedule.departure_time
                    ? new Date(schedule.departure_time).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'
                  return {
                    value: schedule.id,
                    label: `${routeInfo} - ${time}`
                  }
                })
              ]}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng vé</div>
          <div className="text-2xl font-bold text-gray-900">{allTickets.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Thanh toán thành công</div>
          <div className="text-2xl font-bold text-green-600">
            {allTickets.filter(t => {
              const status = t.status || ''
              // Vé tại quầy có status BOOKED được coi là thanh toán thành công
              // Vé online đã thanh toán có status COMPLETED, SUCCESS, PAID
              return ['COMPLETED', 'SUCCESS', 'PAID', 'BOOKED'].includes(status)
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Đang đợi thanh toán</div>
          <div className="text-2xl font-bold text-yellow-600">
            {allTickets.filter(t => {
              const status = t.status || ''
              // BOOKED không còn là "đang đợi thanh toán" nữa (vé tại quầy đã thanh toán)
              return ['PENDING', 'WAITING_PAYMENT', 'ACTIVE'].includes(status)
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Thanh toán thất bại</div>
          <div className="text-2xl font-bold text-red-600">
            {allTickets.filter(t => ['FAILED', 'PAYMENT_FAILED', 'CANCELLED'].includes(t.status || '')).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <p className="text-gray-600 text-lg font-medium mb-2">Không có dữ liệu</p>
            <p className="text-gray-400 text-sm">Không tìm thấy vé nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th 
                      key={col.key} 
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {col.title}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket, index) => (
                  <tr 
                    key={ticket.id || index} 
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => handleViewDetail(ticket)}
                  >
                    {columns.map((col) => {
                      let cellContent = ticket[col.dataIndex]
                      
                      if (col.render && typeof col.render === 'function') {
                        cellContent = col.render(cellContent, ticket)
                      }
                      
                      return (
                        <td 
                          key={col.key} 
                          className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                        >
                          {cellContent}
                        </td>
                      )
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetail(ticket)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Chi tiết
                        </Button>
                        {!['FAILED', 'PAYMENT_FAILED', 'CANCELLED', 'COMPLETED', 'SUCCESS', 'PAID'].includes(ticket.status || '') && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancelTicket(ticket)}
                            disabled={cancelling || deleting}
                          >
                            Hủy vé
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteTicket(ticket)}
                          disabled={deleting || cancelling}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedTicket(null)
        }}
        title="Chi tiết vé"
        size="large"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã vé</label>
                <p className="text-gray-900 font-semibold">
                  {selectedTicket.ticketCode || selectedTicket.ticket_code || `#${selectedTicket.id}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <div>{getStatusBadge(selectedTicket.status || 'ACTIVE', selectedTicket)}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin khách hàng</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <p className="text-gray-900">
                    {selectedTicket.user?.first_name || ''} {selectedTicket.user?.last_name || ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <p className="text-gray-900">{selectedTicket.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedTicket.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin chuyến đi</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tuyến</label>
                  <p className="text-gray-900">
                    {selectedTicket.schedule?.route?.departure_station || 'N/A'} → {selectedTicket.schedule?.route?.arrival_station || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xe</label>
                  <p className="text-gray-900">
                    {selectedTicket.schedule?.bus?.name || 'N/A'} ({selectedTicket.schedule?.bus?.license_plate || 'N/A'})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghế</label>
                  <p className="text-gray-900">
                    {selectedTicket.seat?.seatNumber || selectedTicket.seat?.seat_number || 'N/A'} 
                    ({getSeatTypeLabel(selectedTicket.seat?.seatType || selectedTicket.seat?.seat_type)})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại ghế</label>
                  <p className="text-gray-900">
                    {getSeatTypeLabel(selectedTicket.seatType || selectedTicket.seat_type)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khởi hành</label>
                  <p className="text-gray-900">
                    {formatDateTime(selectedTicket.departureTime || selectedTicket.departure_time || selectedTicket.schedule?.departure_time)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến nơi</label>
                  <p className="text-gray-900">
                    {formatDateTime(selectedTicket.arrivalTime || selectedTicket.arrival_time || selectedTicket.schedule?.arrival_time)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin thanh toán</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé</label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {formatCurrency(selectedTicket.price)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt</label>
                  <p className="text-gray-900">
                    {formatDateTime(selectedTicket.createdAt || selectedTicket.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              {!['FAILED', 'PAYMENT_FAILED', 'CANCELLED', 'COMPLETED', 'SUCCESS', 'PAID'].includes(selectedTicket.status) && (
                <Button
                  onClick={() => handleCancelTicket(selectedTicket)}
                  disabled={cancelling}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {cancelling ? 'Đang hủy...' : 'Hủy vé'}
                </Button>
              )}
              <Button
                onClick={() => {
                  setDetailModalOpen(false)
                  setSelectedTicket(null)
                }}
                variant="outline"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

