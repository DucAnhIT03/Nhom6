import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { getRoutes, addRoute, updateRoute, deleteRoute } from '../../services/routeService'
import { getBusStations } from '../../services/stationService'

export default function RoutesPage(){
  const [routes, setRoutes] = useState([])
  const [stations, setStations] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ departure_station_id: '', arrival_station_id: '', duration:'', distance:'' })

  const fetch = async ()=> {
    setLoading(true)
    try {
      const [routesData, stationsData] = await Promise.all([
        getRoutes(),
        getBusStations()
      ])
      setRoutes(routesData)
      setStations(stationsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ fetch() }, [])

  const openAdd = ()=>{ 
    if (stations.length < 2) {
      alert('Cần ít nhất 2 bến xe để tạo tuyến đường. Vui lòng thêm bến xe trước.')
      return
    }
    setEditing(null)
    setForm({ 
      departure_station_id: stations[0]?.id || '', 
      arrival_station_id: stations[1]?.id || '', 
      duration: '', 
      distance: '' 
    })
    setOpen(true) 
  }
  
  const openEdit = (row)=>{ 
    setEditing(row)
    setForm({ 
      departure_station_id: row.departure_station_id, 
      arrival_station_id: row.arrival_station_id, 
      duration: row.duration, 
      distance: row.distance 
    })
    setOpen(true) 
  }

  const save = async ()=>{
    // Validate và convert data
    const departureStationId = Number(form.departure_station_id)
    const arrivalStationId = Number(form.arrival_station_id)
    const duration = Number(form.duration)
    const distance = Number(form.distance)
    
    if (!departureStationId || !arrivalStationId) {
      return alert('Vui lòng chọn đầy đủ điểm đi và điểm đến')
    }
    if (departureStationId === arrivalStationId) {
      return alert('Điểm đi và điểm đến không được trùng nhau')
    }
    if (!duration || duration <= 0 || isNaN(duration)) {
      return alert('Thời gian phải là số lớn hơn 0')
    }
    if (!distance || distance <= 0 || isNaN(distance)) {
      return alert('Khoảng cách phải là số lớn hơn 0')
    }
    
    try {
      setLoading(true)
      
      const routeData = {
        departure_station_id: departureStationId,
        arrival_station_id: arrivalStationId,
        duration: duration,
        distance: distance,
        // bus_company_id không bắt buộc, sẽ được chọn khi tạo lịch trình
      }
      
      if (editing) {
        const response = await updateRoute({ id: editing.id, ...routeData })
        // Update state directly instead of fetching
        if (response?.success && response?.data) {
          const updated = {
            id: editing.id,
            departure_station_id: response.data.departureStation?.id || routeData.departure_station_id,
            arrival_station_id: response.data.arrivalStation?.id || routeData.arrival_station_id,
            bus_company_id: response.data.busCompany?.id || editing.bus_company_id,
            departure_station: response.data.departureStation?.name || editing.departure_station,
            arrival_station: response.data.arrivalStation?.name || editing.arrival_station,
            bus_company: response.data.busCompany?.companyName || editing.bus_company,
            price: response.data.price || editing.price,
            duration: response.data.duration || routeData.duration,
            distance: response.data.distance || routeData.distance,
            created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : editing.created_at,
            updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          }
          setRoutes(routes.map(r => r.id === editing.id ? updated : r))
        }
        alert('Cập nhật tuyến đường thành công')
        setOpen(false)
      } else {
        // Add mode: tạo tuyến đường không có nhà xe
        const response = await addRoute(routeData)
        if (response?.success && response?.data) {
          const newRoute = {
            id: response.data.id,
            departure_station_id: response.data.departureStation?.id || routeData.departure_station_id,
            arrival_station_id: response.data.arrivalStation?.id || routeData.arrival_station_id,
            bus_company_id: response.data.busCompany?.id || null,
            departure_station: response.data.departureStation?.name || stations.find(s => s.id === routeData.departure_station_id)?.name || '',
            arrival_station: response.data.arrivalStation?.name || stations.find(s => s.id === routeData.arrival_station_id)?.name || '',
            bus_company: response.data.busCompany?.companyName || '',
            price: response.data.price ?? 0,
            duration: response.data.duration || routeData.duration,
            distance: response.data.distance || routeData.distance,
            created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          }
          setRoutes([newRoute, ...routes])
          alert('Thêm tuyến đường thành công')
        } else {
          alert('Không thể tạo tuyến đường. Vui lòng thử lại.')
        }
        setOpen(false)
      }
    } catch (error) {
      console.error('Save route error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Không thể lưu tuyến đường'
      alert('Lỗi: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tuyến đường này?')) return
    try {
      setLoading(true)
      await deleteRoute(id)
      // Remove from state directly instead of fetching
      setRoutes(routes.filter(r => r.id !== id))
      alert('Xóa tuyến đường thành công')
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message || 'Không thể xóa tuyến đường'))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', title: 'ID', dataIndex: 'id' },
    { key: 'departure', title: 'Điểm đi', dataIndex: 'departure_station' },
    { key: 'arrival', title: 'Điểm đến', dataIndex: 'arrival_station' },
    { key: 'duration', title: 'Thời gian (phút)', dataIndex: 'duration' },
    { key: 'distance', title: 'Khoảng cách (km)', dataIndex: 'distance' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Tuyến đường"
        subtitle="Quản lý các tuyến đường"
        action={
          <div className="flex gap-2">
            <Button
              onClick={openAdd}
              disabled={loading || stations.length < 2}
              icon="+"
              title={
                stations.length < 2
                  ? 'Cần ít nhất 2 bến xe để tạo tuyến đường'
                  : ''
              }
            >
              Thêm tuyến
            </Button>
          </div>
        }
      />

      {/* Loading State */}
      {loading && routes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <Table data={routes} columns={columns} onEdit={openEdit} onDelete={remove} />
      )}

      {/* Modal */}
      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing ? 'Sửa tuyến đường' : 'Thêm tuyến đường mới'}>
        <div className="space-y-5">
          <FormInput label="Điểm đi" required>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.departure_station_id} 
            onChange={e=>setForm({...form, departure_station_id: e.target.value ? Number(e.target.value) : ''})}
            >
              <option value="">-- Chọn bến đi --</option>
              {stations.map(s=> (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormInput>

          <FormInput label="Điểm đến" required>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.arrival_station_id} 
            onChange={e=>setForm({...form, arrival_station_id: e.target.value ? Number(e.target.value) : ''})}
            >
              <option value="">-- Chọn bến đến --</option>
              {stations.map(s=> (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormInput>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Thời gian (phút)" required>
              <input 
                type="number"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="Ví dụ: 300"
                value={form.duration || ''} 
                onChange={e=>setForm({...form, duration: e.target.value ? Number(e.target.value) : ''})} 
              />
            </FormInput>

            <FormInput label="Khoảng cách (km)" required>
              <input 
                type="number"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="Ví dụ: 180"
                value={form.distance || ''} 
                onChange={e=>setForm({...form, distance: e.target.value ? Number(e.target.value) : ''})} 
              />
            </FormInput>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={()=>setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={save}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
