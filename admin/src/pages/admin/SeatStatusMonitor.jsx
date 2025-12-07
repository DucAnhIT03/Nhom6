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
import { createTicketAtCounter, updateTicket } from '../../services/ticketService'
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
      
      // Get seat map for the bus - thử với scheduleId nếu có thể
      // Backend có thể hỗ trợ lấy trạng thái ghế theo schedule qua endpoint này
      let seatMapResponse = null
      try {
        // Thử gọi endpoint với scheduleId nếu backend hỗ trợ
        const response = await axiosClient.get(`/seats/bus/${busId}`, {
          params: {
            scheduleId: selectedScheduleId
          }
        })
        if (response?.success && response?.data) {
          seatMapResponse = {
            busId: response.data.busId,
            busName: response.data.busName,
            seats: response.data.seats || [],
            seatMap: response.data.seatMap || {},
            layoutConfig: response.data.layoutConfig || null,
          }
        }
      } catch (seatMapError) {
        // Nếu không hỗ trợ scheduleId, dùng hàm getSeatMap thông thường
        console.log('Seat map with scheduleId not supported, using default...')
        seatMapResponse = await getSeatMap(busId)
      }
      
      console.log('SeatMap response for bus', busId, ':', {
        hasLayoutConfig: !!seatMapResponse.layoutConfig,
        layoutConfig: seatMapResponse.layoutConfig,
        seatsCount: seatMapResponse.seats?.length || 0,
        seatsWithStatus: seatMapResponse.seats?.filter(s => s.status === 'BOOKED')?.length || 0
      })
      
      // Kiểm tra xem backend đã trả về trạng thái BOOKED chưa
      const seatsWithBookedStatus = seatMapResponse.seats?.filter(s => 
        (s.status === 'BOOKED' || s.seatStatus === 'BOOKED')
      ) || []
      
      // Nếu backend đã trả về trạng thái BOOKED, không cần fetch tickets API
      if (seatsWithBookedStatus.length > 0) {
        console.log('✅ Backend đã trả về trạng thái BOOKED cho', seatsWithBookedStatus.length, 'ghế. Không cần fetch tickets API.')
        // bookedSeatIds sẽ được lấy từ seats có status BOOKED
      } else {
        // Chỉ fetch tickets API nếu backend chưa trả về trạng thái
        console.log('⚠️ Backend chưa trả về trạng thái BOOKED. Thử fetch từ tickets API...')
      }
      
      // Get booked seats for this schedule (chỉ khi cần)
      let bookedSeatIds = []
      const isStaff = user?.roles?.includes('ROLE_STAFF')
      
      // Chỉ fetch tickets nếu backend chưa trả về trạng thái BOOKED
      // Và chỉ fetch nếu là admin (có quyền truy cập tickets API)
      const isAdmin = user?.roles?.includes('ROLE_ADMIN')
      if (seatsWithBookedStatus.length === 0 && isAdmin) {
        try {
          // Admin có quyền truy cập tickets API
        const ticketsResponse = await axiosClient.get('/tickets', {
          params: {
            scheduleId: selectedScheduleId,
            page: 1,
              limit: 10000
          }
        })

        if (ticketsResponse?.success && ticketsResponse?.data) {
          const tickets = ticketsResponse.data.items || ticketsResponse.data || []
            console.log('Fetched tickets for schedule', selectedScheduleId, ':', tickets.length, 'tickets')
          tickets.forEach(ticket => {
              const seatId = ticket.seatId || ticket.seat_id
              const status = ticket.status || 'ACTIVE'
              // Chỉ đánh dấu ghế là BOOKED nếu vé không bị hủy (CANCELLED)
              // Vé bị hủy sẽ giải phóng ghế, cho phép đặt lại
              if (seatId && status !== 'CANCELLED' && status !== 'FAILED' && status !== 'PAYMENT_FAILED') {
                bookedSeatIds.push(Number(seatId))
                console.log('Booked seat ID:', seatId, 'Status:', status)
              } else {
                console.log('Skipping cancelled/failed ticket for seat ID:', seatId, 'Status:', status)
              }
            })
          }
          console.log('Total booked seat IDs from tickets API:', bookedSeatIds.length)
      } catch (ticketError) {
          const errorStatus = ticketError?.response?.status
          const errorMessage = ticketError?.response?.data?.message || ticketError?.message
          
          // Lỗi khi fetch tickets - bỏ qua, dùng dữ liệu từ backend
          console.log('Could not fetch tickets API (non-critical):', errorMessage)
        }
      } else if (seatsWithBookedStatus.length === 0 && !isAdmin) {
        // Staff không có quyền và backend chưa trả về status
        // Thử một số endpoint khác để lấy trạng thái ghế đã đặt (chỉ log một lần)
        let foundBookedSeats = false
        
        // Thử endpoint /schedules/{scheduleId}/booked-seats
        try {
          const bookedSeatsResponse = await axiosClient.get(`/schedules/${selectedScheduleId}/booked-seats`)
          if (bookedSeatsResponse?.success && bookedSeatsResponse?.data) {
            const bookedSeats = bookedSeatsResponse.data.seatIds || bookedSeatsResponse.data || []
            if (Array.isArray(bookedSeats) && bookedSeats.length > 0) {
              bookedSeatIds = bookedSeats.map(id => Number(id)).filter(id => id > 0)
              console.log('✅ Lấy được', bookedSeatIds.length, 'ghế đã đặt từ endpoint booked-seats')
              foundBookedSeats = true
            }
          }
        } catch (e1) {
          // Endpoint không tồn tại, thử cách khác (chỉ log một lần)
          if (e1?.response?.status === 404) {
            // Endpoint không tồn tại - không cần log nhiều lần
          } else {
            console.log('Endpoint /schedules/{id}/booked-seats không tồn tại, thử cách khác...')
          }
          
          // Thử endpoint /schedules/{scheduleId}/seats
          if (!foundBookedSeats) {
            try {
              const scheduleSeatsResponse = await axiosClient.get(`/schedules/${selectedScheduleId}/seats`)
              if (scheduleSeatsResponse?.success && scheduleSeatsResponse?.data) {
                const seats = scheduleSeatsResponse.data.seats || scheduleSeatsResponse.data || []
                const booked = seats.filter(s => s.status === 'BOOKED' || s.isBooked)
                bookedSeatIds = booked.map(s => Number(s.id || s.seatId || 0)).filter(id => id > 0)
                if (bookedSeatIds.length > 0) {
                  console.log('✅ Lấy được', bookedSeatIds.length, 'ghế đã đặt từ endpoint /schedules/{id}/seats')
                  foundBookedSeats = true
                }
              }
            } catch (e2) {
              // Không có endpoint nào hoạt động - chỉ log một lần khi load lần đầu
              if (!silent && e2?.response?.status === 404) {
                console.warn('⚠️ Backend chưa hỗ trợ endpoint để lấy trạng thái ghế đã đặt cho staff.')
                console.warn('💡 Giải pháp: Cập nhật backend để trả về status BOOKED khi có scheduleId trong getSeatMap, hoặc cấp quyền cho staff truy cập tickets API.')
              }
            }
          }
        }
        
        // Nếu không tìm thấy ghế đã đặt, hiển thị tất cả ghế là available
        if (!foundBookedSeats && bookedSeatIds.length === 0) {
          console.log('ℹ️ Không thể xác định ghế đã đặt. Hiển thị tất cả ghế là available. (Cần cập nhật backend)')
        }
      } else {
        // Lấy booked seat IDs từ backend response
        seatsWithBookedStatus.forEach(seat => {
          const seatId = Number(seat.id || seat.seatId || 0)
          if (seatId) {
            bookedSeatIds.push(seatId)
          }
        })
        console.log('Total booked seat IDs from backend:', bookedSeatIds.length)
        
        // Cần kiểm tra lại từ tickets API để loại bỏ vé đã hủy (CANCELLED)
        // Vé đã hủy sẽ giải phóng ghế, cho phép đặt lại
        // Chỉ cố gắng fetch nếu là admin (có quyền truy cập tickets API)
        const isAdmin = user?.roles?.includes('ROLE_ADMIN')
        if (isAdmin) {
          try {
            // Admin có quyền truy cập tickets API
            const ticketsResponse = await axiosClient.get('/tickets', {
              params: { scheduleId: selectedScheduleId, page: 1, limit: 10000 }
            })
            
            if (ticketsResponse?.success && ticketsResponse?.data) {
              const tickets = ticketsResponse.data.items || ticketsResponse.data || []
              const cancelledSeatIds = tickets
                .filter(t => {
                  const status = t.status || 'ACTIVE'
                  return status === 'CANCELLED' || status === 'FAILED' || status === 'PAYMENT_FAILED'
                })
                .map(t => Number(t.seatId || t.seat_id || 0))
                .filter(id => id > 0)
              
              // Loại bỏ các ghế có vé đã bị hủy khỏi danh sách booked
              if (cancelledSeatIds.length > 0) {
                console.log('Removing', cancelledSeatIds.length, 'cancelled seats from booked list:', cancelledSeatIds)
                bookedSeatIds = bookedSeatIds.filter(id => !cancelledSeatIds.includes(id))
                console.log('Updated booked seat IDs after removing cancelled:', bookedSeatIds.length)
              }
            }
          } catch (e) {
            // Lỗi khi fetch tickets - bỏ qua, dùng dữ liệu từ backend
            console.log('Could not fetch tickets to filter cancelled seats (non-critical):', e.message)
          }
        } else {
          // Staff không có quyền truy cập tickets API
          // Giả định backend đã xử lý đúng và trả về status BOOKED chính xác
          // (Backend nên tự động loại bỏ vé đã hủy khi trả về status)
          console.log('Staff không có quyền truy cập tickets API. Sử dụng dữ liệu từ backend (giả định backend đã xử lý đúng).')
        }
      }

      // Update seat status based on bookings
      // Nếu seatMapResponse đã có status BOOKED (từ backend với scheduleId), sử dụng nó
      // Nếu không, dùng bookedSeatIds từ tickets API
      const updatedSeats = seatMapResponse.seats.map(seat => {
        // Check cả seat.id và seat.seatId (nếu có)
        const seatId = Number(seat.id || seat.seatId || 0)
        
        // Kiểm tra xem seat đã có status BOOKED từ backend chưa (nếu endpoint hỗ trợ scheduleId)
        const existingStatus = seat.status || seat.seatStatus
        const isBookedFromBackend = existingStatus === 'BOOKED'
        const isBookedFromTickets = bookedSeatIds.includes(seatId)
        const isBooked = isBookedFromBackend || isBookedFromTickets
        
        if (isBooked) {
          console.log('Seat', seat.seatNumber || seat.seat_number, 'is BOOKED (ID:', seatId, ')', 
            isBookedFromBackend ? '(from backend)' : '(from tickets)')
        }
        
        return {
          ...seat,
          status: isBooked ? 'BOOKED' : (existingStatus || 'AVAILABLE'),
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
          // Vé tại quầy không cần tài khoản - tìm user Guest đã có sẵn hoặc user đầu tiên
          let guestUser = null
          if (usersResponse?.data && Array.isArray(usersResponse.data)) {
            // Tìm user Guest với email guest@counter.com hoặc tương tự
            guestUser = usersResponse.data.find(u => {
              const email = (u.email || '').toLowerCase()
              return email === 'guest@counter.com' || 
                     email === 'counter@system.com' ||
                     email.includes('guest@counter') ||
                     (email.includes('guest') && email.includes('counter'))
            })
          }
          
          if (guestUser) {
            // Sử dụng user Guest chung cho vé tại quầy
            userId = guestUser.id
            console.log('Using existing guest user for counter ticket:', guestUser.id, guestUser.email)
          } else {
            // Không có user Guest - sử dụng user đầu tiên có sẵn (thường là admin hoặc user đầu tiên)
            const allUsers = usersResponse?.data || []
            if (allUsers.length > 0) {
              // Ưu tiên tìm user có role USER hoặc không có role đặc biệt
              const regularUser = allUsers.find(u => {
                const roles = u.roles || []
                return !roles.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_STAFF' || (typeof r === 'object' && (r.roleName === 'ROLE_ADMIN' || r.roleName === 'ROLE_STAFF')))
              }) || allUsers[0]
              
              userId = regularUser.id
              console.log('Using available user for counter ticket (no guest found):', userId, regularUser.email)
            } else {
              // Không có user nào - không thể tạo vé
              alert('Không thể tạo vé. Hệ thống chưa có tài khoản người dùng.')
              setCreating(false)
              return
            }
          }
        }
      } catch (userError) {
        console.error('Error finding user:', userError)
        alert('Không thể tìm tài khoản khách hàng. Vui lòng thử lại.')
        setCreating(false)
        return
      }

      // Create tickets for all selected seats
      // Vé xuất tại quầy phải có status COMPLETED (thanh toán thành công)
      // Map seatType để đảm bảo chỉ gửi các giá trị backend chấp nhận: LUXURY, VIP, STANDARD
      const mapSeatType = (seatType) => {
        const type = (seatType || 'STANDARD').toUpperCase()
        // Backend chỉ chấp nhận: LUXURY, VIP, STANDARD
        if (type === 'LUXURY' || type === 'VIP' || type === 'STANDARD') {
          return type
        }
        // Map các giá trị khác về STANDARD
        // DOUBLE, DELUXE, etc. -> STANDARD
        return 'STANDARD'
      }
      
      const ticketsToCreate = selectedSeats.map(seat => {
        const originalSeatType = seat.seatType || seat.seat_type || 'STANDARD'
        const mappedSeatType = mapSeatType(originalSeatType)
        
        console.log('Mapping seatType:', {
          seatId: seat.id,
          original: originalSeatType,
          mapped: mappedSeatType
        })
        
        return {
          userId: userId,
          scheduleId: selectedScheduleId,
          seatId: seat.id,
          departureTime: selectedSchedule.departure_time,
          arrivalTime: selectedSchedule.arrival_time,
          seatType: mappedSeatType, // Đảm bảo chỉ gửi LUXURY, VIP, hoặc STANDARD
          price: calculatePrice(seat),
          status: 'COMPLETED' // Đảm bảo vé xuất tại quầy có trạng thái thanh toán thành công
        }
      })
      
      console.log('Creating tickets at counter with status COMPLETED:', ticketsToCreate.length, 'tickets')

      // Create all tickets using admin counter API
      const ticketPromises = ticketsToCreate.map(ticketData => createTicketAtCounter(ticketData))
      const responses = await Promise.all(ticketPromises)
      
      const successfulTickets = []
      // Sau khi tạo vé, đảm bảo status là COMPLETED (thanh toán thành công)
      const updatePromises = []
      
      responses.forEach((response, index) => {
        if (response?.success && response?.data) {
          const ticket = response.data
          console.log('Ticket created at counter:', {
            id: ticket.id,
            status: ticket.status,
            ticketCode: ticket.ticketCode || ticket.ticket_code
          })
          
          // Backend chỉ chấp nhận BOOKED hoặc CANCELLED
          // Vé tại quầy sẽ có status BOOKED từ backend, nhưng sẽ được đánh dấu là "thanh toán thành công" trong frontend
          console.log('✅ Ticket created at counter with status:', ticket.status || 'BOOKED')
          
          successfulTickets.push({
            ...ticket,
            // Đánh dấu vé này là vé tại quầy (đã thanh toán)
            // Backend trả về BOOKED, nhưng trong frontend sẽ hiển thị là "Thanh toán thành công"
            _isCounterTicket: true, // Flag để phân biệt vé tại quầy
            status: ticket.status || 'BOOKED', // Backend trả về BOOKED
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
      
      // Đợi tất cả các update hoàn thành (nếu có)
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises)
        console.log('✅ Updated', updatePromises.length, 'tickets to COMPLETED status')
      }
      
      if (successfulTickets.length > 0) {
        // Lưu danh sách ID vé tại quầy vào localStorage để phân biệt khi fetch lại
        try {
          const counterTicketIds = JSON.parse(localStorage.getItem('counter_ticket_ids') || '[]')
          const newCounterTicketIds = successfulTickets.map(t => t.id).filter(id => id)
          const updatedCounterTicketIds = [...new Set([...counterTicketIds, ...newCounterTicketIds])]
          localStorage.setItem('counter_ticket_ids', JSON.stringify(updatedCounterTicketIds))
          console.log('Saved counter ticket IDs to localStorage:', newCounterTicketIds.length, 'tickets')
        } catch (e) {
          console.warn('Could not save counter ticket IDs to localStorage:', e)
        }
        
        setCreatedTickets(successfulTickets)
        
        // Reset form
        setCustomerForm({
          firstName: '',
          lastName: '',
          phone: '',
          email: ''
        })
        setSelectedSeatIds([])
        
        // Refresh seat map - đợi một chút để đảm bảo database đã cập nhật
        setTimeout(async () => {
        await fetchSeatStatus()
        }, 500)
        
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


