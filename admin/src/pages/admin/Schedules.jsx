import React, { useEffect, useState } from 'react'
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
    setEditing(row)
    // Get bus_company_id from route or bus
    const selectedRoute = routes.find(r => r.id === row.route_id)
    const selectedBus = buses.find(b => b.id === row.bus_id)
    const busCompanyId = selectedRoute?.bus_company_id || selectedBus?.company_id || ''
    
    setForm({ 
      route_id: row.route_id || '', 
      bus_company_id: busCompanyId,
      bus_id: row.bus_id || '', 
      start_date: row.start_date || '', 
      end_date: row.end_date || ''
    })
    
    // Load departure time from existing schedule
    if (row.departure_time) {
      const departureDate = new Date(row.departure_time)
      const dateKey = departureDate.toISOString().split('T')[0]
      const timeKey = `${String(departureDate.getHours()).padStart(2, '0')}:${String(departureDate.getMinutes()).padStart(2, '0')}`
      setDepartureTimesByDate({ [dateKey]: [timeKey] })
    } else {
      setDepartureTimesByDate({})
    }
    
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
    const selectedBus = buses.find(b => b.id === form.bus_id)
    if (!selectedBus || !selectedBus.capacity) return alert('Không tìm thấy thông tin xe')
    const totalSeats = selectedBus.capacity

    try {
      // Check if route has bus company, if not, update route with selected bus company
      const selectedRoute = routes.find(r => r.id === form.route_id)
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
        const updatedRoute = routes.find(r => r.id === form.route_id)
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
    const selectedRoute = routes.find(r => r.id === form.route_id)
    return selectedRoute?.duration || 0 // duration in minutes
  }

  const columns = [
    { key: 'id', title: 'ID', dataIndex: 'id' },
    { 
      key: 'route', 
      title: 'Tuyến đường', 
      dataIndex: 'route', 
      render: (route) => route ? `${route.departure_station} → ${route.arrival_station}` : '-' 
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
      key: 'departure_time', 
      title: 'Giờ khởi hành', 
      dataIndex: 'departure_time',
      render: (time) => {
        if (!time) return '-'
        const date = new Date(time)
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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

      <Table data={schedules} columns={columns} onEdit={openEdit} onDelete={remove} />

      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing ? 'Sửa lịch trình' : 'Thêm lịch trình mới'}>
        <div className="space-y-5">
          <FormInput label="Tuyến đường" required>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.route_id}
              onChange={(e) => {
                const selectedRoute = routes.find(r => r.id === e.target.value)
                // If route has bus company, auto-select it; otherwise leave empty for user to choose
                setForm({
                  ...form, 
                  route_id: e.target.value, 
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
                setForm({...form, bus_company_id: e.target.value, bus_id: ''})
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
              const selectedRoute = routes.find(r => r.id === form.route_id)
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
              onChange={(e)=>setForm({...form, bus_id: e.target.value})}
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
