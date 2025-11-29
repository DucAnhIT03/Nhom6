import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { getBusStationRelations, addBusStationRelation, deleteBusStationRelation } from '../../services/busStationService'
import { getBusStations } from '../../services/stationService'
import { getBuses } from '../../services/busService'
import { getSchedules } from '../../services/scheduleService'

export default function BusStation(){
  const [relations, setRelations] = useState([])
  const [stations, setStations] = useState([])
  const [buses, setBuses] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ station_id:'', bus_id:'' })
  const [busStatuses, setBusStatuses] = useState({}) // Map bus_id -> status info

  // Tính toán trạng thái xe dựa trên schedule
  const calculateBusStatus = (schedules, busId) => {
    if (!schedules || schedules.length === 0) {
      return {
        status: 'no_schedule',
        message: 'Chưa có lịch trình',
        timeElapsed: null
      }
    }

    const now = new Date()
    
    // Tìm schedule gần nhất (sắp tới hoặc đang diễn ra)
    const upcomingSchedules = schedules
      .filter(s => s.departure_time && new Date(s.departure_time) >= now)
      .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))
    
    const currentSchedules = schedules.filter(s => {
      if (!s.departure_time || !s.arrival_time) return false
      const depTime = new Date(s.departure_time)
      const arrTime = new Date(s.arrival_time)
      return now >= depTime && now < arrTime
    })

    // Tìm schedule vừa kết thúc gần nhất
    const pastSchedules = schedules
      .filter(s => s.arrival_time && new Date(s.arrival_time) < now)
      .sort((a, b) => new Date(b.arrival_time) - new Date(a.arrival_time))

    // Trường hợp 1: Đang ở bến (có schedule sắp tới)
    if (upcomingSchedules.length > 0) {
      const nextSchedule = upcomingSchedules[0]
      const depTime = new Date(nextSchedule.departure_time)
      const timeUntilDeparture = depTime - now
      const hours = Math.floor(timeUntilDeparture / (1000 * 60 * 60))
      const minutes = Math.floor((timeUntilDeparture % (1000 * 60 * 60)) / (1000 * 60))
      
      return {
        status: 'at_station',
        message: 'Đang ở bến',
        timeElapsed: null,
        nextDeparture: depTime
      }
    }

    // Trường hợp 2: Đã khởi hành (đang trên đường)
    if (currentSchedules.length > 0) {
      const currentSchedule = currentSchedules[0]
      const depTime = new Date(currentSchedule.departure_time)
      const timeElapsed = now - depTime
      const hours = Math.floor(timeElapsed / (1000 * 60 * 60))
      const minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60))
      
      return {
        status: 'departed',
        message: `Đã khởi hành ${hours > 0 ? `${hours} giờ ` : ''}${minutes} phút`,
        timeElapsed: { hours, minutes },
        departureTime: depTime
      }
    }

    // Trường hợp 3: Đã đến nơi
    if (pastSchedules.length > 0) {
      const lastSchedule = pastSchedules[0]
      const arrTime = new Date(lastSchedule.arrival_time)
      const timeElapsed = now - arrTime
      const hours = Math.floor(timeElapsed / (1000 * 60 * 60))
      const minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60))
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      
      let timeText = ''
      if (days > 0) {
        timeText = `${days} ngày ${remainingHours > 0 ? `${remainingHours} giờ` : ''}`
      } else if (hours > 0) {
        timeText = `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`
      } else {
        timeText = `${minutes} phút`
      }
      
      return {
        status: 'arrived',
        message: `Đã đến nơi ${timeText}`,
        timeElapsed: { days, hours: remainingHours, minutes },
        arrivalTime: arrTime
      }
    }

    return {
      status: 'no_schedule',
      message: 'Chưa có lịch trình',
      timeElapsed: null
    }
  }

  const fetch = async ()=> {
    const [relationsData, stationsData, busesData] = await Promise.all([
      getBusStationRelations(),
      getBusStations(),
      getBuses()
    ])
    
    setRelations(relationsData)
    setStations(stationsData)
    setBuses(busesData)

    // Lấy schedules cho tất cả các bus và tính trạng thái
    const statusMap = {}
    const uniqueBusIds = [...new Set(relationsData.map(r => r.bus_id))]
    
    await Promise.all(
      uniqueBusIds.map(async (busId) => {
        try {
          const schedules = await getSchedules({ busId, limit: 100 })
          statusMap[busId] = calculateBusStatus(schedules, busId)
        } catch (error) {
          console.error(`Error fetching schedules for bus ${busId}:`, error)
          statusMap[busId] = {
            status: 'error',
            message: 'Lỗi tải dữ liệu',
            timeElapsed: null
          }
        }
      })
    )
    
    setBusStatuses(statusMap)
  }
  
  useEffect(()=>{ 
    fetch()
  }, [])

  // Cập nhật trạng thái mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      setBusStatuses(prev => {
        const updated = { ...prev }
        let hasChanges = false
        
        Object.keys(prev).forEach(busId => {
          const currentStatus = prev[busId]
          if (currentStatus && currentStatus.status === 'departed' && currentStatus.departureTime) {
            const now = new Date()
            const depTime = new Date(currentStatus.departureTime)
            const timeElapsed = now - depTime
            const hours = Math.floor(timeElapsed / (1000 * 60 * 60))
            const minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60))
            
            updated[busId] = {
              ...currentStatus,
              message: `Đã khởi hành ${hours > 0 ? `${hours} giờ ` : ''}${minutes} phút`,
              timeElapsed: { hours, minutes }
            }
            hasChanges = true
          } else if (currentStatus && currentStatus.status === 'arrived' && currentStatus.arrivalTime) {
            const now = new Date()
            const arrTime = new Date(currentStatus.arrivalTime)
            const timeElapsed = now - arrTime
            const hours = Math.floor(timeElapsed / (1000 * 60 * 60))
            const minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60))
            const days = Math.floor(hours / 24)
            const remainingHours = hours % 24
            
            let timeText = ''
            if (days > 0) {
              timeText = `${days} ngày ${remainingHours > 0 ? `${remainingHours} giờ` : ''}`
            } else if (hours > 0) {
              timeText = `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`
            } else {
              timeText = `${minutes} phút`
            }
            
            updated[busId] = {
              ...currentStatus,
              message: `Đã đến nơi ${timeText}`,
              timeElapsed: { days, hours: remainingHours, minutes }
            }
            hasChanges = true
          }
        })
        
        return hasChanges ? updated : prev
      })
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  const openAdd = ()=>{ 
    if (stations.length === 0) {
      alert('Cần ít nhất 1 bến xe để thêm quan hệ. Vui lòng thêm bến xe trước.')
      return
    }
    if (buses.length === 0) {
      alert('Cần ít nhất 1 xe để thêm quan hệ. Vui lòng thêm xe trước.')
      return
    }
    setForm({ station_id: stations[0]?.id||'', bus_id: buses[0]?.id||'' }); 
    setOpen(true) 
  }

  const save = async ()=>{
    if (!form.station_id || !form.bus_id) {
      return alert('Vui lòng chọn đầy đủ bến xe và xe')
    }
    try {
      await addBusStationRelation({ station_id: Number(form.station_id), bus_id: Number(form.bus_id) })
      alert('Thêm xe vào bến thành công')
      setOpen(false)
      fetch()
    } catch (error) {
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Có lỗi xảy ra'
      alert('Lỗi: ' + message)
    }
  }
  
  const remove = async (rel)=>{
    if(!confirm('Xác nhận xóa quan hệ này?')) return
    try {
      await deleteBusStationRelation(rel)
      alert('Xóa quan hệ thành công')
      fetch()
    } catch (error) {
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Có lỗi xảy ra'
      alert('Lỗi: ' + message)
    }
  }

  const columns = [
    { key:'station_name', title:'Bến xe', dataIndex:'station_name' },
    { key:'bus_name', title:'Xe', dataIndex:'bus_name' },
    { key:'license_plate', title:'Biển số', dataIndex:'license_plate' },
    { 
      key:'company_name', 
      title:'Nhà xe', 
      dataIndex:'company_name',
      render: (text) => (
        <span className={text === 'Chưa có nhà xe' ? 'text-gray-400 italic' : ''}>
          {text}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      dataIndex: 'bus_id',
      render: (busId) => {
        const status = busStatuses[busId]
        if (!status) {
          return <span className="text-gray-500">Đang tải...</span>
        }
        
        const getStatusColor = () => {
          switch (status.status) {
            case 'at_station':
              return 'bg-blue-100 text-blue-800'
            case 'departed':
              return 'bg-yellow-100 text-yellow-800'
            case 'arrived':
              return 'bg-green-100 text-green-800'
            case 'no_schedule':
              return 'bg-gray-100 text-gray-600'
            default:
              return 'bg-red-100 text-red-800'
          }
        }
        
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {status.message}
          </span>
        )
      }
    },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Xe ở Bến"
        subtitle="Quản lý quan hệ giữa xe và bến xe"
        action={
          <Button 
            onClick={openAdd} 
            icon="+"
            disabled={stations.length === 0 || buses.length === 0}
            title={
              stations.length === 0
                ? 'Cần ít nhất 1 bến xe để thêm quan hệ'
                : buses.length === 0
                ? 'Cần ít nhất 1 xe để thêm quan hệ'
                : ''
            }
          >
            Thêm quan hệ
          </Button>
        }
      />

      <Table data={relations} columns={columns} onDelete={(id)=>remove({ id })} />

      <Modal isOpen={open} onClose={()=>setOpen(false)} title="Thêm quan hệ Xe - Bến">
        <div className="space-y-5">
          <FormInput label="Bến xe" required>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.station_id} 
              onChange={e=>setForm({...form, station_id: Number(e.target.value)})}
            >
              <option value="">-- Chọn bến xe --</option>
              {stations.map(s=> (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormInput>
          
          <FormInput label="Xe" required>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.bus_id} 
              onChange={e=>setForm({...form, bus_id: Number(e.target.value)})}
            >
              <option value="">-- Chọn xe --</option>
              {buses.map(b=> (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormInput>

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