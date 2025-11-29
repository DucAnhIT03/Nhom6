import React, { useEffect, useState, useRef } from 'react'
import Header from '../../components/Header'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import SeatMap from '../../components/SeatMap'
import Modal from '../../components/Modal'
import { getSchedules, getSchedule } from '../../services/scheduleService'
import { getSeatMap } from '../../services/seatService'
import { getCompanies } from '../../services/busCompanyService'
import { getBuses } from '../../services/busService'
import { getSeatTypePrices } from '../../services/seatTypePriceService'
import { createTicketAtCounter } from '../../services/ticketService'
import axiosClient from '../../services/axiosClient'
import { useAuth } from '../../contexts/AuthContext'

export default function SeatStatusMonitor() {
  const { user, refreshProfile } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [companies, setCompanies] = useState([])
  const [buses, setBuses] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [seatMapData, setSeatMapData] = useState({ busId: null, busName: '', seats: [], seatMap: {} })
  const [loading, setLoading] = useState(false)
  const [seatMapLoading, setSeatMapLoading] = useState(false)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [layoutConfig, setLayoutConfig] = useState(null)
  const intervalRef = useRef(null)
  const [selectedSeatIds, setSelectedSeatIds] = useState([])
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  })
  const [creating, setCreating] = useState(false)
  const [createdTickets, setCreatedTickets] = useState([])
  const [seatTypePrices, setSeatTypePrices] = useState([])
  const [scheduleDetail, setScheduleDetail] = useState(null)

  const selectedSchedule = schedules.find(s => s.id === Number(selectedScheduleId))
  const selectedBus = buses.find(b => b.id === Number(selectedSchedule?.bus_id))

  // Fetch initial data and refresh profile for staff
  useEffect(() => {
    const loadData = async () => {
      // Refresh profile first for staff to get latest busCompanyId
      if (user?.roles?.includes('ROLE_STAFF') && refreshProfile) {
        await refreshProfile()
      }
      await fetchInitialData()
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter schedules when company changes
  useEffect(() => {
    if (selectedCompanyId && buses.length > 0) {
      fetchSchedules()
    } else if (!selectedCompanyId) {
      setSchedules([])
      setSelectedScheduleId('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId, buses])

  // Auto-select company for staff on mount or when user data changes
  useEffect(() => {
    const isStaff = user?.roles?.includes('ROLE_STAFF')
    const userBusCompanyId = user?.busCompanyId
    if (isStaff && userBusCompanyId && !selectedCompanyId) {
      setSelectedCompanyId(String(userBusCompanyId))
    }
  }, [user, selectedCompanyId])

  // Refresh profile when window gains focus (for staff to get updated busCompanyId)
  useEffect(() => {
    const handleFocus = async () => {
      const isStaff = user?.roles?.includes('ROLE_STAFF')
      if (isStaff && refreshProfile) {
        const updatedUser = await refreshProfile()
        // If busCompanyId changed, update selectedCompanyId and refetch data
        if (updatedUser?.busCompanyId && updatedUser.busCompanyId !== Number(selectedCompanyId)) {
          setSelectedCompanyId(String(updatedUser.busCompanyId))
          fetchInitialData()
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshProfile, selectedCompanyId])

  // Fetch seat map when schedule changes
  useEffect(() => {
    if (selectedScheduleId && selectedSchedule) {
      fetchSeatStatus()
      fetchScheduleDetail()
      fetchSeatTypePrices()
    } else {
      setSeatMapData({ busId: null, busName: '', seats: [], seatMap: {} })
      setLayoutConfig(null)
      setLastUpdate(null)
      setScheduleDetail(null)
      setSeatTypePrices([])
      setSelectedSeatIds([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScheduleId, selectedSchedule])

  const fetchScheduleDetail = async () => {
    if (!selectedScheduleId) return
    try {
      const detail = await getSchedule(selectedScheduleId)
      if (detail) {
        setScheduleDetail(detail)
      }
    } catch (error) {
      console.error('Error fetching schedule detail:', error)
    }
  }

  const fetchSeatTypePrices = async () => {
    if (!selectedSchedule?.route_id) return
    try {
      const prices = await getSeatTypePrices({
        routeId: selectedSchedule.route_id
      })
      setSeatTypePrices(prices || [])
    } catch (error) {
      console.error('Error fetching seat type prices:', error)
      setSeatTypePrices([])
    }
  }

  // Real-time polling
  useEffect(() => {
    if (isRealTimeEnabled && selectedScheduleId && selectedSchedule) {
      // Start polling every 3 seconds
      intervalRef.current = setInterval(() => {
        fetchSeatStatus(true)
      }, 3000)
    } else {
      // Clear interval when disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealTimeEnabled, selectedScheduleId, selectedSchedule])

  const fetchInitialData = async () => {
    try {
      const [companiesData, busesData] = await Promise.all([
        getCompanies(),
        getBuses()
      ])
      
      // Set buses first so fetchSchedules can use them
      setBuses(busesData)
      
      // If user is staff and has busCompanyId, filter companies
      const isStaff = user?.roles?.includes('ROLE_STAFF')
      const userBusCompanyId = user?.busCompanyId
      
      if (isStaff && userBusCompanyId) {
        // Staff can only see their assigned company
        const filteredCompanies = companiesData.filter(c => c.id === userBusCompanyId)
        setCompanies(filteredCompanies)
        // Auto-select the company - fetchSchedules will be triggered by useEffect
        if (filteredCompanies.length > 0) {
          setSelectedCompanyId(String(userBusCompanyId))
        }
      } else {
        // Admin can see all companies
        setCompanies(companiesData)
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      alert('Không thể tải dữ liệu')
    }
  }

  const fetchSchedules = async () => {
    if (!selectedCompanyId) return
    if (buses.length === 0) {
      // Wait for buses to be loaded
      console.log('Waiting for buses to be loaded...')
      return
    }
    setLoading(true)
    try {
      const schedulesData = await getSchedules({
        page: 1,
        limit: 1000,
      })
      // Filter schedules by company through bus
      const filtered = schedulesData.filter(schedule => {
        const bus = buses.find(b => b.id === Number(schedule.bus_id))
        return bus && Number(bus.company_id) === Number(selectedCompanyId)
      })
      // Sort by departure time (upcoming first)
      filtered.sort((a, b) => {
        const timeA = a.departure_time ? new Date(a.departure_time).getTime() : 0
        const timeB = b.departure_time ? new Date(b.departure_time).getTime() : 0
        return timeA - timeB
      })
      setSchedules(filtered)
      console.log('Fetched schedules:', filtered.length, 'for company:', selectedCompanyId)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      alert('Không thể tải danh sách lịch trình')
    } finally {
      setLoading(false)
    }
  }

  const fetchSeatStatus = async (silent = false) => {
    if (!selectedScheduleId || !selectedSchedule) return

    if (!silent) {
      setSeatMapLoading(true)
    }

    try {
      const busId = selectedSchedule.bus_id
      
      // Get seat map for the bus
      const seatMapResponse = await getSeatMap(busId)
      console.log('SeatMap response for bus', busId, ':', {
        hasLayoutConfig: !!seatMapResponse.layoutConfig,
        layoutConfig: seatMapResponse.layoutConfig,
        seatsCount: seatMapResponse.seats?.length || 0
      })
      
      // Get booked seats for this schedule
      let bookedSeatIds = []
      try {
        const ticketsResponse = await axiosClient.get('/tickets', {
          params: {
            scheduleId: selectedScheduleId,
            page: 1,
            limit: 1000
          }
        })

        if (ticketsResponse?.success && ticketsResponse?.data) {
          const tickets = ticketsResponse.data.items || ticketsResponse.data || []
          tickets.forEach(ticket => {
            if (ticket.seatId && ticket.status !== 'CANCELLED') {
              bookedSeatIds.push(ticket.seatId)
            }
          })
        }
      } catch (ticketError) {
        console.warn('Could not fetch tickets, showing all seats as available:', ticketError)
        // Continue with empty bookedSeatIds
      }

      // Update seat status based on bookings
      const updatedSeats = seatMapResponse.seats.map(seat => {
        const isBooked = bookedSeatIds.includes(seat.id)
        return {
          ...seat,
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
          // Add booking info if booked
          bookingInfo: isBooked ? {
            scheduleId: selectedScheduleId,
            scheduleTime: selectedSchedule.departure_time
          } : null
        }
      })

      // Update seat map colors
      const updatedSeatMap = {}
      updatedSeats.forEach(seat => {
        const seatNumber = seat.seatNumber || seat.seat_number
        const status = seat.status
        const seatType = seat.seatType || seat.seat_type || 'STANDARD'
        const isHidden = seat.isHidden || seat.is_hidden || false

        // Determine color based on status
        let color = '#bfdbfe' // Default: available
        if (isHidden) {
          color = '#e5e7eb'
        } else if (status === 'BOOKED') {
          color = '#ef4444' // Red for booked
        } else {
          switch (seatType) {
            case 'VIP':
              color = '#fef08a'
              break
            case 'DOUBLE':
            case 'LUXURY':
              color = '#fbcfe8'
              break
            default:
              color = '#bfdbfe'
          }
        }

        updatedSeatMap[seatNumber] = {
          seat: seat,
          color: color
        }
      })

      setSeatMapData({
        busId: seatMapResponse.busId,
        busName: seatMapResponse.busName,
        seats: updatedSeats,
        seatMap: updatedSeatMap
      })

      // Load layout config if available
      let configToSet = null
      if (seatMapResponse.layoutConfig) {
        // Parse if it's a string
        if (typeof seatMapResponse.layoutConfig === 'string') {
          try {
            configToSet = JSON.parse(seatMapResponse.layoutConfig)
          } catch (e) {
            console.warn('Error parsing layoutConfig from string:', e)
            configToSet = seatMapResponse.layoutConfig
          }
        } else {
          configToSet = seatMapResponse.layoutConfig
        }
      } else if (selectedBus?.seatLayoutConfig) {
        // Parse if it's a string
        if (typeof selectedBus.seatLayoutConfig === 'string') {
          try {
            configToSet = JSON.parse(selectedBus.seatLayoutConfig)
          } catch (e) {
            console.warn('Error parsing seatLayoutConfig from bus:', e)
            configToSet = selectedBus.seatLayoutConfig
          }
        } else {
          configToSet = selectedBus.seatLayoutConfig
        }
      } else {
        // Try to load from localStorage
        try {
          const storedLayouts = JSON.parse(localStorage.getItem('seat_layout_configs') || '{}')
          const busLayout = storedLayouts[busId]
          if (busLayout) {
            configToSet = busLayout
          }
        } catch (e) {
          console.warn('Could not load layout from localStorage', e)
        }
      }
      
      if (configToSet) {
        console.log('Setting layoutConfig for bus', busId, ':', configToSet)
        setLayoutConfig(configToSet)
      } else {
        console.warn('No layoutConfig found for bus:', busId, {
          seatMapResponseLayoutConfig: seatMapResponse.layoutConfig,
          selectedBusSeatLayoutConfig: selectedBus?.seatLayoutConfig,
          selectedBus: selectedBus
        })
        setLayoutConfig(null)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching seat status:', error)
      if (!silent) {
        alert('Không thể tải trạng thái ghế')
      }
    } finally {
      if (!silent) {
        setSeatMapLoading(false)
      }
    }
  }

  const toggleRealTime = () => {
    setIsRealTimeEnabled(prev => !prev)
  }

  const formatDateTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusStats = () => {
    if (!seatMapData.seats.length) return { total: 0, booked: 0, available: 0, hidden: 0 }
    
    const stats = {
      total: seatMapData.seats.length,
      booked: 0,
      available: 0,
      hidden: 0
    }

    seatMapData.seats.forEach(seat => {
      if (seat.isHidden || seat.is_hidden) {
        stats.hidden++
      } else if (seat.status === 'BOOKED') {
        stats.booked++
      } else {
        stats.available++
      }
    })

    return stats
  }

  const stats = getStatusStats()
  const selectedSeats = seatMapData.seats.filter(s => selectedSeatIds.includes(s.id))

  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED' || seat.isHidden || seat.is_hidden) {
      return // Không cho chọn ghế đã đặt hoặc đã ẩn
    }
    
    // Toggle selection
    setSelectedSeatIds(prev => {
      if (prev.includes(seat.id)) {
        return prev.filter(id => id !== seat.id)
      } else {
        return [...prev, seat.id]
      }
    })
  }

  const handleOpenTicketModal = () => {
    if (selectedSeatIds.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế')
      return
    }
    setTicketModalOpen(true)
  }

  const calculatePrice = (seat) => {
    if (!selectedSchedule || !seat) return 0
    
    // Get base price from route
    let basePrice = 0
    const routeId = scheduleDetail?.route_id || selectedSchedule.route_id || scheduleDetail?.route?.id || selectedSchedule.route?.id
    
    if (scheduleDetail?.route?.price) {
      basePrice = Number(scheduleDetail.route.price) || 0
    } else if (selectedSchedule.route?.price) {
      basePrice = Number(selectedSchedule.route.price) || 0
    }
    
    // Get seat type price
    let seatTypePrice = 0
    const seatType = seat.seatType || seat.seat_type || 'STANDARD'
    
    // First try to get from seat type prices table
    if (routeId) {
      const seatTypePriceData = seatTypePrices.find(
        stp => (Number(stp.routeId) === Number(routeId) || Number(stp.route_id) === Number(routeId)) && 
               (stp.seatType === seatType || stp.seat_type === seatType)
      )
      if (seatTypePriceData) {
        seatTypePrice = Number(seatTypePriceData.price) || 0
      }
    }
    
    // Fallback to seat's own price
    if (seatTypePrice === 0) {
      seatTypePrice = Number(seat.priceForSeatType || seat.price_for_seat_type || 0)
    }
    
    const total = basePrice + seatTypePrice
    
    // Debug log (remove in production)
    if (total === 0) {
      console.log('Price calculation debug:', {
        basePrice,
        seatTypePrice,
        routeId,
        seatType,
        scheduleDetail,
        selectedSchedule,
        seatTypePrices,
        seat
      })
    }
    
    return total
  }

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + calculatePrice(seat), 0)
  }

  const handleCreateTickets = async () => {
    if (!customerForm.firstName || !customerForm.lastName) {
      return alert('Vui lòng nhập đầy đủ họ tên khách hàng')
    }
    if (!selectedScheduleId || selectedSeatIds.length === 0) {
      return alert('Vui lòng chọn lịch trình và ít nhất một ghế')
    }

    setCreating(true)
    try {
      // Find or create user
      let userId
      try {
        const usersResponse = await axiosClient.get('/admin/auth/users')
        let existingUser = null
        
        if (usersResponse?.success && usersResponse?.data) {
          // Tìm user theo số điện thoại hoặc email (chỉ tìm theo phone nếu có giá trị hợp lệ)
          if (customerForm.phone && customerForm.phone.trim()) {
            existingUser = usersResponse.data.find(u => u.phone === customerForm.phone.trim())
          }
          if (!existingUser && customerForm.email && customerForm.email.trim()) {
            existingUser = usersResponse.data.find(u => u.email === customerForm.email.trim())
          }
        } else if (Array.isArray(usersResponse?.data)) {
          if (customerForm.phone && customerForm.phone.trim()) {
            existingUser = usersResponse.data.find(u => u.phone === customerForm.phone.trim())
          }
          if (!existingUser && customerForm.email && customerForm.email.trim()) {
            existingUser = usersResponse.data.find(u => u.email === customerForm.email.trim())
          }
        }
        
        if (existingUser) {
          userId = existingUser.id
        } else {
          // Tạo user mới nếu không tìm thấy (sử dụng API admin)
          const tempEmail = customerForm.email || `counter_${Date.now()}@temp.com`
          // Chỉ gửi phone nếu có giá trị hợp lệ (không rỗng)
          const userData = {
            firstName: customerForm.firstName,
            lastName: customerForm.lastName,
            email: tempEmail,
            password: `Temp@${Date.now()}`
          }
          // Chỉ thêm phone nếu có giá trị và không rỗng
          if (customerForm.phone && customerForm.phone.trim()) {
            userData.phone = customerForm.phone.trim()
          }
          
          try {
            const createUserResponse = await axiosClient.post('/admin/auth/create-user', userData)
            
            if (createUserResponse?.success && createUserResponse.data?.id) {
              userId = createUserResponse.data.id
            } else {
              alert('Vui lòng yêu cầu khách hàng đăng ký tài khoản trước, sau đó thử lại.')
              setCreating(false)
              return
            }
          } catch (createUserError) {
            console.error('Error creating user:', createUserError)
            const errorMessage = createUserError?.response?.data?.message || createUserError?.message || 'Không thể tạo tài khoản tự động'
            alert(`${errorMessage}. Vui lòng thử lại.`)
            setCreating(false)
            return
          }
        }
      } catch (userError) {
        console.error('Error finding user:', userError)
        alert('Không thể tìm tài khoản khách hàng. Vui lòng thử lại.')
        setCreating(false)
        return
      }

      // Create tickets for all selected seats
      const ticketsToCreate = selectedSeats.map(seat => ({
        userId: userId,
        scheduleId: selectedScheduleId,
        seatId: seat.id,
        departureTime: selectedSchedule.departure_time,
        arrivalTime: selectedSchedule.arrival_time,
        seatType: seat.seatType || seat.seat_type || 'STANDARD',
        price: calculatePrice(seat)
      }))

      // Create all tickets using admin counter API
      const ticketPromises = ticketsToCreate.map(ticketData => createTicketAtCounter(ticketData))
      const responses = await Promise.all(ticketPromises)
      
      const successfulTickets = []
      responses.forEach((response, index) => {
        if (response?.success && response?.data) {
          successfulTickets.push({
            ...response.data,
            customer: {
              firstName: customerForm.firstName,
              lastName: customerForm.lastName,
              phone: customerForm.phone,
              email: customerForm.email
            },
            schedule: selectedSchedule,
            seat: selectedSeats[index],
            bus: selectedBus
          })
        }
      })
      
      if (successfulTickets.length > 0) {
        setCreatedTickets(successfulTickets)
        
        // Reset form
        setCustomerForm({
          firstName: '',
          lastName: '',
          phone: '',
          email: ''
        })
        setSelectedSeatIds([])
        
        // Refresh seat map
        await fetchSeatStatus()
        
        // Show success message
        alert(`Đã xuất thành công ${successfulTickets.length} vé!`)
      } else {
        alert('Không thể tạo vé. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error creating tickets:', error)
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo vé')
    } finally {
      setCreating(false)
      setTicketModalOpen(false)
    }
  }

  const handlePrintTicket = () => {
    window.print()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className="p-6">
      <Header 
        title="Quản lý trạng thái ghế theo thời gian thực" 
        onRefresh={() => fetchSeatStatus()}
      />

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Only show company selector for admin or staff without assigned company */}
          {(!user?.roles?.includes('ROLE_STAFF') || !user?.busCompanyId) ? (
            <div>
              <FormInput
                type="select"
                label="Chọn nhà xe"
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value)
                  setSelectedScheduleId('')
                }}
                options={[
                  { value: '', label: '-- Chọn nhà xe --' },
                  ...companies.map(company => ({ 
                    value: company.id, 
                    label: company.company_name 
                  }))
                ]}
              />
            </div>
          ) : (
            // Show assigned company as read-only for staff
            <div>
              <FormInput
                label="Nhà xe được gán"
                value={companies.find(c => c.id === Number(selectedCompanyId))?.company_name || 'Chưa gán nhà xe'}
                disabled={true}
              />
            </div>
          )}
          <div>
            <FormInput
              type="select"
              label="Chọn lịch trình"
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              disabled={!selectedCompanyId || loading}
              options={[
                { value: '', label: selectedCompanyId ? '-- Chọn lịch trình --' : 'Chọn nhà xe trước' },
                ...schedules.map(schedule => {
                  const routeInfo = schedule.route 
                    ? `${schedule.route.departure_station} → ${schedule.route.arrival_station}`
                    : 'N/A'
                  const time = schedule.departure_time 
                    ? new Date(schedule.departure_time).toLocaleString('vi-VN')
                    : 'N/A'
                  return {
                    value: schedule.id,
                    label: `${routeInfo} - ${time}`
                  }
                })
              ]}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={toggleRealTime}
              className={`w-full ${
                isRealTimeEnabled 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
              disabled={!selectedScheduleId}
            >
              {isRealTimeEnabled ? '⏸️ Tắt cập nhật tự động' : '▶️ Bật cập nhật tự động'}
            </Button>
          </div>
        </div>

        {/* Schedule Info */}
        {selectedSchedule && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Tuyến: </span>
                <span className="text-gray-600">
                  {selectedSchedule.route?.departure_station || 'N/A'} → {selectedSchedule.route?.arrival_station || 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Xe: </span>
                <span className="text-gray-600">
                  {selectedSchedule.bus?.name || 'N/A'} ({selectedSchedule.bus?.license_plate || 'N/A'})
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Khởi hành: </span>
                <span className="text-gray-600">
                  {selectedSchedule.departure_time 
                    ? new Date(selectedSchedule.departure_time).toLocaleString('vi-VN')
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Ghế trống: </span>
                <span className="text-gray-600">
                  {selectedSchedule.available_seat || 0} / {selectedSchedule.total_seats || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {selectedScheduleId && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Tổng ghế</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Đã đặt</div>
            <div className="text-2xl font-bold text-red-600">{stats.booked}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Còn trống</div>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Đã ẩn</div>
            <div className="text-2xl font-bold text-gray-500">{stats.hidden}</div>
          </div>
        </div>
      )}

      {/* Seat Map */}
      {selectedScheduleId ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Sơ đồ ghế - {seatMapData.busName || selectedBus?.name || 'Đang tải...'}
              </h2>
              {selectedSchedule?.departure_time && (
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  🚌 Ngày khởi hành: {new Date(selectedSchedule.departure_time).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Cập nhật lần cuối: {formatDateTime(lastUpdate)}
                  {isRealTimeEnabled && (
                    <span className="ml-2 inline-flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                      Đang cập nhật tự động
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          {seatMapLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p>Đang tải sơ đồ ghế...</p>
            </div>
          ) : (
            <>
              {/* Custom Legend for Real-time Monitor */}
              <div className="mb-6 flex flex-wrap gap-4 justify-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="text-sm font-medium">Đã đặt (Real-time)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#bfdbfe' }}></div>
                  <span className="text-sm font-medium">Ghế thường </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#fef08a' }}></div>
                  <span className="text-sm font-medium">Ghế VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#fbcfe8' }}></div>
                  <span className="text-sm font-medium">Ghế đôi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
                    <span className="text-red-600 font-bold text-xs">✕</span>
                  </div>
                  <span className="text-sm font-medium">Đã ẩn</span>
                </div>
              </div>
              <SeatMap
                seats={seatMapData.seats}
                seatMap={seatMapData.seatMap}
                layoutConfig={layoutConfig}
                showLegend={false}
                onSeatClick={handleSeatClick}
                selectedSeats={selectedSeatIds}
                multiSelect={true}
                onSeatSelect={(seatId, isSelected) => {
                  setSelectedSeatIds(prev => {
                    if (isSelected) {
                      return prev.includes(seatId) ? prev : [...prev, seatId]
                    } else {
                      return prev.filter(id => id !== seatId)
                    }
                  })
                }}
              />
              {selectedSeatIds.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Đã chọn {selectedSeatIds.length} ghế: </span>
                      {selectedSeats.map(seat => seat.seatNumber || seat.seat_number).join(', ')}
                    </p>
                    <Button
                      onClick={handleOpenTicketModal}
                      className="bg-green-500 hover:bg-green-600 text-sm"
                    >
                      Xuất vé ({selectedSeatIds.length} ghế)
                    </Button>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-sm font-semibold text-blue-900">Tổng tiền:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculateTotalPrice())}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
          <p className="text-lg font-semibold text-gray-700 mb-2">Chọn lịch trình để xem trạng thái ghế</p>
          <p className="text-sm">Sau khi chọn nhà xe và lịch trình, sơ đồ ghế sẽ hiển thị trạng thái đặt ghế theo thời gian thực.</p>
        </div>
      )}

      {/* Ticket Creation Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => {
          setTicketModalOpen(false)
          // Don't reset selected seats when closing modal
        }}
        title={`Xuất vé tại quầy (${selectedSeatIds.length} ghế)`}
        size="small"
      >
        <div className="space-y-3">
          {selectedSeats.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs space-y-1.5">
                <div className="font-semibold text-xs mb-1.5">Danh sách ghế:</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedSeats.map((seat, index) => (
                    <div key={seat.id} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-medium">Ghế {seat.seatNumber || seat.seat_number}</span>
                        <span className="text-gray-600 ml-1 text-xs">
                          ({seat.seatType === 'VIP' ? 'VIP' : 
                            seat.seatType === 'DOUBLE' ? 'Đôi' : 
                            seat.seatType === 'LUXURY' ? 'Luxury' : 'Thường'})
                        </span>
                      </div>
                      <span className="font-semibold text-blue-600 text-xs">
                        {formatCurrency(calculatePrice(seat))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-blue-300 mt-1.5">
                  <span className="font-bold text-blue-900 text-sm">Tổng cộng:</span>
                  <span className="text-base font-bold text-blue-600">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                type="text"
                label="Họ *"
                value={customerForm.firstName}
                onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                placeholder="Nhập họ"
                required
              />
              <FormInput
                type="text"
                label="Tên *"
                value={customerForm.lastName}
                onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                placeholder="Nhập tên"
                required
              />
            </div>
            <FormInput
              type="text"
              label="Số điện thoại"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              placeholder="0912345678"
            />
            <FormInput
              type="email"
              label="Email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button
              onClick={() => {
                setTicketModalOpen(false)
              }}
              variant="outline"
              className="text-sm px-4 py-2"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateTickets}
              disabled={creating || selectedSeatIds.length === 0}
              className="bg-green-500 hover:bg-green-600 text-sm px-4 py-2"
            >
              {creating ? `Đang tạo ${selectedSeatIds.length} vé...` : `Xuất ${selectedSeatIds.length} vé (Tiền mặt)`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ticket Print View */}
      {createdTickets.length > 0 && (
        <div className="hidden print:block fixed inset-0 bg-white p-8" id="ticket-print">
          <div className="space-y-8">
            {createdTickets.map((ticket, index) => (
              <div key={ticket.id || index} className="max-w-md mx-auto">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">VÉ XE KHÁCH</h3>
                  <p className="text-sm text-gray-600">Mã vé: {ticket.ticketCode || ticket.ticket_code || 'N/A'}</p>
                </div>
                
                <div className="space-y-3 text-sm border-2 border-gray-800 p-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-semibold">{ticket.customer.firstName} {ticket.customer.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-semibold">{ticket.customer.phone}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tuyến:</span>
                      <span className="font-semibold">
                        {ticket.schedule.route?.departure_station || 'N/A'} → {ticket.schedule.route?.arrival_station || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Xe:</span>
                      <span className="font-semibold">{ticket.bus?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Ghế:</span>
                      <span className="font-semibold">{ticket.seat?.seatNumber || ticket.seat?.seat_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Khởi hành:</span>
                      <span className="font-semibold">{formatDateTime(ticket.departureTime || ticket.departure_time)}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Tổng tiền:</span>
                      <span className="text-lg font-bold">{formatCurrency(ticket.price)}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Thanh toán:</span>
                      <span className="font-semibold text-green-600">Tiền mặt</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

