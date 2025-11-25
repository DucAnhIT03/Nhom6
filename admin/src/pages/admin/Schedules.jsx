import React, { useEffect, useMemo, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { getSchedules, addSchedule, updateSchedule, deleteSchedule } from '../../services/scheduleService'
import { getRoutes, updateRoute } from '../../services/routeService'
import { getBuses } from '../../services/busService'
import { getCompanies } from '../../services/busCompanyService'

export default function Schedules(){
  const [schedules, setSchedules] = useState([])
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [companies, setCompanies] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ 
    route_id: '', 
    bus_company_id: '',
    bus_id: '', 
    start_date: '', 
    end_date: ''
  })
  const [departureTimesByDate, setDepartureTimesByDate] = useState({}) // { '2025-11-20': ['08:00', '14:00'], ... }
  const [newTimeInputs, setNewTimeInputs] = useState({}) // { '2025-11-20': '08:00', ... }
  const [expandedGroupId, setExpandedGroupId] = useState(null)

  const fetch = async () => {
    try {
      const [schedulesData, routesData, busesData, companiesData] = await Promise.all([
        getSchedules(),
        getRoutes(),
        getBuses(),
        getCompanies()
      ])
      setSchedules(schedulesData)
      setRoutes(routesData)
      setBuses(busesData)
      setCompanies(companiesData)
      
      // Debug: Log buses data to check company_id
      console.log('Fetched buses:', busesData.map(b => ({
        id: b.id,
        name: b.name,
        company_id: b.company_id,
        company_id_type: typeof b.company_id
      })))
      console.log('Fetched companies:', companiesData.map(c => ({
        id: c.id,
        name: c.company_name || c.name
      })))
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Không thể tải dữ liệu')
    }
  }

  useEffect(() => { fetch() }, [])

  useEffect(() => {
    setExpandedGroupId(null)
  }, [schedules])

  const groupedSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return []

    const groups = new Map()

    schedules.forEach((schedule) => {
      const groupKey = `${schedule.route_id}-${schedule.bus_id}-${schedule.start_date}-${schedule.end_date}`
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          route_id: schedule.route_id,
          bus_id: schedule.bus_id,
          route: schedule.route,
          bus: schedule.bus,
          bus_company: schedule.bus?.company || schedule.route?.bus_company || '',
          start_date: schedule.start_date,
          end_date: schedule.end_date,
          total_seats: schedule.total_seats,
          available_seat: schedule.available_seat,
          schedules: [],
          departuresByDate: {}
        })
      }

      const group = groups.get(groupKey)
      group.schedules.push(schedule)

      if (schedule.departure_time) {
        const dateKey = schedule.departure_time.split('T')[0]
        const timeLabel = new Date(schedule.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        if (!group.departuresByDate[dateKey]) {
          group.departuresByDate[dateKey] = []
        }
        group.departuresByDate[dateKey].push({
          scheduleId: schedule.id,
          timeLabel,
          schedule
        })
      }
    })

    return Array.from(groups.values()).map((group, index) => {
      const departureDetails = Object.entries(group.departuresByDate)
        .map(([date, entries]) => ({
          date,
          label: new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          entries: entries.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      return {
        ...group,
        display_index: index + 1,
        departureDetails
      }
    })
  }, [schedules])

  const openAdd = () => {
    setEditing(null)
    setForm({ 
      route_id: '', 
      bus_company_id: '',
      bus_id: '', 
      start_date: '', 
      end_date: ''
    })
    setDepartureTimesByDate({})
    setNewTimeInputs({})
    setOpen(true)
  }

  const openEdit = (row) => {
    const targetSchedule = row?.schedules ? row.schedules[0] : row
    if (!targetSchedule) return

    setEditing(targetSchedule)
    // Get bus_company_id from route or bus
    const selectedRoute = routes.find(r => Number(r.id) === Number(targetSchedule.route_id))
    const selectedBus = buses.find(b => Number(b.id) === Number(targetSchedule.bus_id))
    const busCompanyId = selectedRoute?.bus_company_id || selectedBus?.company_id || ''
    
    setForm({ 
      route_id: targetSchedule.route_id || '', 
      bus_company_id: busCompanyId,
      bus_id: targetSchedule.bus_id || '', 
      start_date: targetSchedule.start_date || '', 
      end_date: targetSchedule.end_date || ''
    })
    
    // Load departure times from schedule or group
    const schedulesToLoad = row?.schedules || [targetSchedule]
    const loadedTimes = {}

    schedulesToLoad.forEach((schedule) => {
      if (schedule.departure_time) {
        const departureDate = new Date(schedule.departure_time)
        const dateKey = departureDate.toISOString().split('T')[0]
        const timeKey = `${String(departureDate.getHours()).padStart(2, '0')}:${String(departureDate.getMinutes()).padStart(2, '0')}`
        if (!loadedTimes[dateKey]) {
          loadedTimes[dateKey] = []
        }
        if (!loadedTimes[dateKey].includes(timeKey)) {
          loadedTimes[dateKey].push(timeKey)
        }
      }
    })

    setDepartureTimesByDate(loadedTimes)
    
    setNewTimeInputs({})
    setOpen(true)
  }

  const save = async () => {
    if (!form.route_id) return alert('Vui lòng chọn tuyến đường')
    if (!form.bus_company_id) return alert('Vui lòng chọn nhà xe')
    if (!form.bus_id) return alert('Vui lòng chọn xe')
    if (!form.start_date) return alert('Vui lòng chọn ngày bắt đầu')
    if (!form.end_date) return alert('Vui lòng chọn ngày kết thúc')
    
    // Check if at least one departure time is set
    const hasDepartureTimes = Object.values(departureTimesByDate).some(times => times.length > 0)
    if (!hasDepartureTimes) return alert('Vui lòng thêm ít nhất một giờ khởi hành')
    
    // Get bus capacity
    const selectedBus = buses.find(b => Number(b.id) === Number(form.bus_id))
    if (!selectedBus || !selectedBus.capacity) return alert('Không tìm thấy thông tin xe')
    const totalSeats = selectedBus.capacity

    try {
      // Check if route has bus company, if not, update route with selected bus company
      const selectedRoute = routes.find(r => Number(r.id) === Number(form.route_id))
      if (selectedRoute && !selectedRoute.bus_company_id) {
        // Update route with bus company
        await updateRoute({
          id: form.route_id,
          departure_station_id: selectedRoute.departure_station_id,
          arrival_station_id: selectedRoute.arrival_station_id,
          bus_company_id: form.bus_company_id,
          duration: selectedRoute.duration,
          distance: selectedRoute.distance
        })
        // Update local state
        const updatedRoute = routes.find(r => Number(r.id) === Number(form.route_id))
        if (updatedRoute) {
          updatedRoute.bus_company_id = form.bus_company_id
          setRoutes([...routes])
        }
      }

      if (editing) {
        // For editing, update single schedule with new departure time if changed
        const duration = getRouteDuration()
        const departureTimes = Object.entries(departureTimesByDate).flatMap(([date, times]) =>
          times.map(time => ({ date, time }))
        )
        
        const updateData = { ...form, total_seats: totalSeats }
        
        if (departureTimes.length > 0) {
          // Use the first departure time for editing (since we're editing a single schedule)
          const { date, time } = departureTimes[0]
          const departureTime = new Date(`${date}T${time}`)
          const arrivalTime = new Date(departureTime.getTime() + duration * 60000)
          
          updateData.departure_time = departureTime.toISOString()
          updateData.arrival_time = arrivalTime.toISOString()
        }
        
        await updateSchedule({ id: editing.id, ...updateData })
      } else {
        // For creating, create multiple schedules (one for each departure time)
        const duration = getRouteDuration()
        const schedulesToCreate = []
        
        Object.entries(departureTimesByDate).forEach(([date, times]) => {
          times.forEach(time => {
            const departureTime = new Date(`${date}T${time}`)
            const arrivalTime = new Date(departureTime.getTime() + duration * 60000) // Add duration in milliseconds
            
            schedulesToCreate.push({
              route_id: form.route_id,
              bus_id: form.bus_id,
              start_date: form.start_date,
              end_date: form.end_date,
              departure_time: departureTime.toISOString(),
              arrival_time: arrivalTime.toISOString(),
              total_seats: totalSeats
            })
          })
        })
        
        // Create all schedules
        for (const scheduleData of schedulesToCreate) {
          await addSchedule(scheduleData)
        }
      }
      setOpen(false)
      fetch()
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Xác nhận xóa?')) return
    try {
      await deleteSchedule(id)
      fetch()
    } catch (error) {
      alert('Không thể xóa lịch trình')
    }
  }

  // Get companies for selected route
  const getFilteredCompanies = () => {
    // Always show all companies, user can choose any company
    return companies
  }

  // Get buses for selected company
  const getFilteredBuses = () => {
    if (!form.bus_company_id) return []
    // Convert both to numbers for comparison (select value is string)
    const selectedCompanyId = Number(form.bus_company_id)
    const filtered = buses.filter(bus => {
      // Handle both number and string company_id, and null/undefined
      const busCompanyId = bus.company_id !== null && bus.company_id !== undefined 
        ? Number(bus.company_id) 
        : null
      return busCompanyId === selectedCompanyId
    })
    console.log('Filtering buses:', {
      selectedCompanyId,
      selectedCompanyIdType: typeof form.bus_company_id,
      totalBuses: buses.length,
      filteredCount: filtered.length,
      allBuses: buses.map(b => ({ 
        id: b.id, 
        name: b.name, 
        company_id: b.company_id, 
        company_id_type: typeof b.company_id 
      })),
      filteredBuses: filtered.map(b => ({ 
        id: b.id, 
        name: b.name, 
        company_id: b.company_id 
      }))
    })
    return filtered
  }

  // Generate list of dates from start_date to end_date
  const getDateRange = () => {
    if (!form.start_date || !form.end_date) return []
    const dates = []
    const start = new Date(form.start_date)
    const end = new Date(form.end_date)
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(new Date(current).toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  // Add departure time for a specific date
  const addDepartureTime = (date, time) => {
    if (!time) return
    setDepartureTimesByDate(prev => {
      const newTimes = { ...prev }
      if (!newTimes[date]) {
        newTimes[date] = []
      }
      if (!newTimes[date].includes(time)) {
        newTimes[date] = [...newTimes[date], time].sort()
      }
      return newTimes
    })
  }

  // Remove departure time for a specific date
  const removeDepartureTime = (date, time) => {
    setDepartureTimesByDate(prev => {
      const newTimes = { ...prev }
      if (newTimes[date]) {
        newTimes[date] = newTimes[date].filter(t => t !== time)
        if (newTimes[date].length === 0) {
          delete newTimes[date]
        }
      }
      return newTimes
    })
  }

  // Get selected route duration for calculating arrival time
  const getRouteDuration = () => {
    const selectedRoute = routes.find(r => Number(r.id) === Number(form.route_id))
    return selectedRoute?.duration || 0 // duration in minutes
  }

  const columns = [
    { key: 'index', title: 'ID', dataIndex: 'display_index' },
    { 
      key: 'route', 
      title: 'Tuyến đường', 
      dataIndex: 'route', 
      render: (route) => route ? `${route.departure_station} → ${route.arrival_station}` : '-' 
    },
    {
      key: 'bus_company',
      title: 'Nhà xe',
      dataIndex: 'bus_company',
      render: (value, row) => value || row.bus?.company || '-'
    },
    { 
      key: 'bus', 
      title: 'Xe', 
      dataIndex: 'bus', 
      render: (bus) => bus ? `${bus.name} (${bus.license_plate})` : '-' 
    },
    { 
      key: 'start_date', 
      title: 'Ngày bắt đầu', 
      dataIndex: 'start_date',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    { 
      key: 'end_date', 
      title: 'Ngày kết thúc', 
      dataIndex: 'end_date',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    { 
      key: 'departure_details', 
      title: 'Giờ khởi hành', 
      dataIndex: 'departureDetails',
      render: (_, row) => {
        if (!row.departureDetails || row.departureDetails.length === 0) {
          return '-'
        }

        const isExpanded = expandedGroupId === row.id

        return (
          <div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setExpandedGroupId(isExpanded ? null : row.id)}
            >
              {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </Button>

            {isExpanded && (
              <div className="mt-4 space-y-3">
                {row.departureDetails.map(detail => (
                  <div key={detail.date} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {detail.label}
                    </p>
                    <div className="mt-2 space-y-2">
                      {detail.entries.map(entry => (
                        <div 
                          key={entry.scheduleId} 
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <span className="text-sm font-medium text-gray-900">{entry.timeLabel}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(entry.schedule)}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => remove(entry.scheduleId)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }
    },
    { key: 'available_seat', title: 'Ghế trống', dataIndex: 'available_seat' },
    { key: 'total_seats', title: 'Tổng ghế', dataIndex: 'total_seats' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Lịch trình"
        subtitle="Quản lý lịch trình xe khách"
        action={
          <Button onClick={openAdd} icon="+">
            Thêm lịch trình
          </Button>
        }
      />

      <Table data={groupedSchedules} columns={columns} />

      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing ? 'Sửa lịch trình' : 'Thêm lịch trình mới'}>
        <div className="space-y-5">
          <FormInput label="Tuyến đường" required>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.route_id}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : ''
                const selectedRoute = routes.find(r => Number(r.id) === Number(value))
                // If route has bus company, auto-select it; otherwise leave empty for user to choose
                setForm({
                  ...form, 
                  route_id: value, 
                  bus_company_id: selectedRoute?.bus_company_id || '',
                  bus_id: ''
                })
              }}
            >
              <option value="">Chọn tuyến đường</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.departure_station} → {route.arrival_station}{route.bus_company ? ` - ${route.bus_company}` : ''}
                </option>
              ))}
            </select>
          </FormInput>

          <FormInput label="Nhà xe" required>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.bus_company_id}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : ''
                setForm({...form, bus_company_id: value, bus_id: ''})
              }}
              disabled={!form.route_id}
            >
              <option value="">Chọn nhà xe</option>
              {getFilteredCompanies().map(company => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
            {form.route_id && (() => {
              const selectedRoute = routes.find(r => Number(r.id) === Number(form.route_id))
              if (selectedRoute && !selectedRoute.bus_company_id) {
                return <p className="text-xs text-blue-600 mt-1">Nhà xe này sẽ được gắn vào tuyến đường khi lưu</p>
              }
              return null
            })()}
          </FormInput>

          <FormInput label="Xe" required>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.bus_id}
              onChange={(e)=>{
                const value = e.target.value ? Number(e.target.value) : ''
                setForm({...form, bus_id: value})
              }}
              disabled={!form.bus_company_id}
            >
              <option value="">Chọn xe</option>
              {getFilteredBuses().map(bus => (
                <option key={bus.id} value={bus.id}>
                  {bus.name} ({bus.license_plate}) - {bus.capacity} ghế
                </option>
              ))}
            </select>
            {form.bus_company_id && getFilteredBuses().length === 0 && (
              <p className="text-xs text-red-600 mt-1">Nhà xe này chưa có xe nào</p>
            )}
          </FormInput>

          <FormInput label="Ngày bắt đầu" required>
            <input 
              type="date"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={form.start_date}
              onChange={(e)=>setForm({...form, start_date: e.target.value})}
            />
          </FormInput>

          <FormInput label="Ngày kết thúc" required>
            <input 
              type="date"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={form.end_date}
              onChange={(e)=>setForm({...form, end_date: e.target.value})}
              min={form.start_date}
            />
          </FormInput>

          {/* Setup departure times by date */}
          {form.start_date && form.end_date && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thiết lập giờ khởi hành theo ngày</h3>
              {getDateRange().map(date => {
                const dateStr = new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                const times = departureTimesByDate[date] || []
                
                return (
                  <div key={date} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-3">{dateStr}</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                          value={newTimeInputs[date] || ''}
                          onChange={(e) => {
                            setNewTimeInputs(prev => ({ ...prev, [date]: e.target.value }))
                          }}
                          placeholder="Chọn giờ"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const time = newTimeInputs[date]
                            if (time) {
                              addDepartureTime(date, time)
                              setNewTimeInputs(prev => {
                                const newInputs = { ...prev }
                                delete newInputs[date]
                                return newInputs
                              })
                            }
                          }}
                          disabled={!newTimeInputs[date]}
                          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                    {times.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {times.map(time => (
                          <div
                            key={time}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-900">{time}</span>
                            <button
                              type="button"
                              onClick={() => removeDepartureTime(date, time)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có giờ khởi hành nào</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={()=>setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={save}>
              Lưu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
