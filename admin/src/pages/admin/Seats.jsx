import React, { useEffect, useState, useMemo } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import SeatMap from '../../components/SeatMap'
import { getSeats, addSeat, updateSeat, deleteSeat, getSeatMap, addSeatsBulk, deleteSeatMap, updateSeatsBulk } from '../../services/seatService'
import { getBuses, updateBusLayoutConfig } from '../../services/busService'
import { getRoutes } from '../../services/routeService'
import { getCompanies } from '../../services/busCompanyService'

const DEFAULT_SEAT_MAP = { busId: null, busName: '', seats: [], seatMap: {} }
const DEFAULT_FLOOR_CONFIGS = [
  { floor: 1, rows: 4, columns: 4, prefix: 'A' },
  { floor: 2, rows: 4, columns: 4, prefix: 'B' }
]
const LAYOUT_STORAGE_KEY = 'seat_layout_configs'

const loadSeatLayoutConfig = (busId) => {
  if (typeof window === 'undefined') return null
  try {
    const data = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}')
    return data?.[busId] || null
  } catch (error) {
    console.warn('Cannot load seat layout configs', error)
    return null
  }
}

const saveSeatLayoutConfig = (busId, config) => {
  if (typeof window === 'undefined') return
  try {
    const data = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}')
    data[busId] = config
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Cannot save seat layout config', error)
  }
}

const removeSeatLayoutConfig = (busId) => {
  if (typeof window === 'undefined') return
  try {
    const data = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}')
    if (data?.[busId]) {
      delete data[busId]
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data))
    }
  } catch (error) {
    console.warn('Cannot remove seat layout config', error)
  }
}

export default function Seats(){
  const [seats, setSeats] = useState([])
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [companies, setCompanies] = useState([])
  const [filteredBuses, setFilteredBuses] = useState([])
  const [builderBuses, setBuilderBuses] = useState([])
  const [open, setOpen] = useState(false)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [deleteMapLoading, setDeleteMapLoading] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [selectedBusId, setSelectedBusId] = useState('')
  const [seatMapData, setSeatMapData] = useState(DEFAULT_SEAT_MAP)
  const [seatMapLoading, setSeatMapLoading] = useState(false)
  const [layoutConfig, setLayoutConfig] = useState(null)
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [selectedBulkSeats, setSelectedBulkSeats] = useState([])
  const [bulkEditForm, setBulkEditForm] = useState({
    seat_type: 'STANDARD',
    is_hidden: false,
  })
  const [bulkEditLoading, setBulkEditLoading] = useState(false)
  const [form, setForm] = useState({ 
    route_id: '',
    bus_id: '', 
    seat_number: '', 
    seat_type: 'STANDARD', 
    price_for_seat_type: 0,
    is_hidden: false
  })
  const [builderForm, setBuilderForm] = useState({
    companyId: '',
    busId: '',
    floors: 1,
    seat_type: 'STANDARD',
    price_for_seat_type: 0,
    floorConfigs: DEFAULT_FLOOR_CONFIGS.map(config => ({ ...config }))
  })
  const selectedBus = useMemo(() => {
    if (!selectedBusId) return null
    return buses.find(b => b.id === Number(selectedBusId)) || null
  }, [buses, selectedBusId])
  const builderBus = useMemo(() => {
    if (!builderForm.busId) return null
    return buses.find(b => b.id === Number(builderForm.busId)) || null
  }, [buses, builderForm.busId])
  const activeFloorConfigs = useMemo(() => {
    const totalFloors = Number(builderForm.floors) || 1
    return builderForm.floorConfigs.slice(0, Math.max(Math.min(totalFloors, 2), 1))
  }, [builderForm.floorConfigs, builderForm.floors])
  const builderSeatCount = useMemo(() => {
    return activeFloorConfigs.reduce((sum, config) => {
      const rows = Number(config.rows) || 0
      const columns = Number(config.columns) || 0
      return sum + (rows * columns)
    }, 0)
  }, [activeFloorConfigs])
  const companyFilteredBuses = useMemo(() => {
    if (!selectedCompanyId) return []
    return buses.filter(bus => Number(bus.company_id) === Number(selectedCompanyId))
  }, [selectedCompanyId, buses])

  const fetch = async ()=> {
    setLoading(true)
    try {
      const [seatsData, busesData, routesData, companiesData] = await Promise.all([
        getSeats({ busId: selectedBusId || undefined }),
        getBuses(),
        getRoutes(),
        getCompanies()
      ])
      setSeats(seatsData)
      setBuses(busesData)
      setRoutes(routesData)
      setCompanies(companiesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ fetch() }, [selectedBusId])

useEffect(() => {
    if (!selectedBusId) {
    setMultiSelectMode(false)
    setSelectedBulkSeats([])
    setBulkEditForm({ seat_type: 'STANDARD', is_hidden: false })
  }
  }, [selectedBusId])

  useEffect(() => {
    if (!selectedCompanyId) {
      if (selectedBusId) {
        setSelectedBusId('')
      }
      return
    }
    if (selectedBusId) {
      const selectedBus = buses.find(b => b.id === Number(selectedBusId))
      if (!selectedBus || Number(selectedBus.company_id) !== Number(selectedCompanyId)) {
        setSelectedBusId('')
      }
    }
  }, [selectedCompanyId, buses])

  useEffect(() => {
    if (builderForm.companyId) {
      const filtered = buses.filter(b => Number(b.company_id) === Number(builderForm.companyId))
      setBuilderBuses(filtered)
      if (!filtered.find(bus => bus.id === Number(builderForm.busId))) {
        setBuilderForm(prev => ({ ...prev, busId: '' }))
      }
    } else {
      setBuilderBuses([])
      if (builderForm.busId) {
        setBuilderForm(prev => ({ ...prev, busId: '' }))
      }
    }
  }, [builderForm.companyId, buses])

  useEffect(() => {
    if (!builderForm.busId) {
      setBuilderForm(prev => ({
        ...prev,
        floors: 1,
        floorConfigs: DEFAULT_FLOOR_CONFIGS.map(config => ({ ...config }))
      }))
      return
    }
    const storedLayout = loadSeatLayoutConfig(Number(builderForm.busId))
    if (storedLayout) {
      setBuilderForm(prev => ({
        ...prev,
        floors: storedLayout.floors || prev.floors,
        floorConfigs: prev.floorConfigs.map((config, index) => {
          const storedConfig = storedLayout.floorConfigs?.[index]
          if (storedConfig) {
            return {
              ...config,
              ...storedConfig
            }
          }
          return config
        })
      }))
    }
  }, [builderForm.busId])

  useEffect(() => {
    if (selectedBusId) {
      const layout = loadSeatLayoutConfig(Number(selectedBusId))
      setLayoutConfig(layout)
    } else {
      setLayoutConfig(null)
    }
  }, [selectedBusId])

  useEffect(() => {
    if (selectedBusId) {
      fetchSeatMap(selectedBusId)
    } else {
      setSeatMapData(DEFAULT_SEAT_MAP)
    }
  }, [selectedBusId])

  const fetchSeatMap = async (busId) => {
    if (!busId) return
    setSeatMapLoading(true)
    try {
      const data = await getSeatMap(busId)
      setSeatMapData({
        busId: data?.busId || busId,
        busName: data?.busName || '',
        seats: data?.seats || [],
        seatMap: data?.seatMap || {}
      })
    } catch (error) {
      console.error('Error fetching seat map:', error)
      alert('Không thể tải sơ đồ ghế')
    } finally {
      setSeatMapLoading(false)
    }
  }

  const handleBuilderChange = (field, value) => {
    setBuilderForm(prev => ({
      ...prev,
      [field]: value
    }))
  }
  const handleFloorConfigChange = (floorIndex, field, value) => {
    setBuilderForm(prev => {
      const nextConfigs = prev.floorConfigs.map((config, index) =>
        index === floorIndex
          ? {
              ...config,
              [field]: field === 'prefix' ? value.toUpperCase() : value
            }
          : config
      )
      return {
        ...prev,
        floorConfigs: nextConfigs
      }
    })
  }
  useEffect(() => {
    if (builderForm.busId) {
      const bus = buses.find(b => b.id === Number(builderForm.busId))
      if (bus?.floors && bus.floors !== builderForm.floors) {
        setBuilderForm(prev => ({
          ...prev,
          floors: Math.max(1, Math.min(Number(bus.floors) || 1, 2))
        }))
      }
    } else if (builderForm.floors !== 1) {
      setBuilderForm(prev => ({ ...prev, floors: 1 }))
    }
  }, [builderForm.busId, builderForm.floors, buses])

  const handleGenerateSeatMap = async () => {
    if (!builderForm.companyId) {
      return alert('Vui lòng chọn nhà xe')
    }
    if (!builderForm.busId) {
      return alert('Vui lòng chọn xe')
    }
    const floors = Number(builderForm.floors) || 0
    if (floors < 1 || floors > 2) {
      return alert('Số tầng phải là 1 hoặc 2')
    }
    for (let i = 0; i < floors; i++) {
      const config = activeFloorConfigs[i]
      if (!config) {
        return alert(`Thiếu cấu hình cho tầng ${i + 1}`)
      }
      if ((Number(config.rows) || 0) <= 0 || (Number(config.columns) || 0) <= 0) {
        return alert(`Số hàng và số cột của tầng ${i + 1} phải lớn hơn 0`)
      }
      if (!config.prefix || !config.prefix.trim()) {
        return alert(`Vui lòng nhập tiền tố cho tầng ${i + 1}`)
      }
    }
    const selectedBuilderBus = buses.find(b => b.id === Number(builderForm.busId))
    if (selectedBuilderBus?.capacity && builderSeatCount > selectedBuilderBus.capacity) {
      const continueCreate = confirm(`Sơ đồ mới (${builderSeatCount} ghế) vượt quá sức chứa ${selectedBuilderBus.capacity} ghế của xe. Bạn có chắc chắn?`)
      if (!continueCreate) return
    }

    const seatsPayload = []
    const pad = (num) => String(num).padStart(2, '0')

    const buildFloorSeats = (floorConfig) => {
      const rows = Number(floorConfig.rows)
      const columns = Number(floorConfig.columns)
      const cleanPrefix = floorConfig.prefix.trim().toUpperCase()
      for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= columns; col++) {
          const order = (row - 1) * columns + col
          seatsPayload.push({
            bus_id: builderForm.busId,
            seat_number: `${cleanPrefix}${pad(order)}`,
            seat_type: builderForm.seat_type,
            price_for_seat_type: builderForm.price_for_seat_type
          })
        }
      }
    }

    activeFloorConfigs.slice(0, floors).forEach(buildFloorSeats)

    if (!seatsPayload.length) {
      return alert('Không có ghế nào được tạo. Vui lòng kiểm tra lại cấu hình.')
    }

    try {
      setBulkLoading(true)
      const existing = await getSeatMap(builderForm.busId)
      if (existing?.seats?.length) {
        const confirmed = confirm(`Xe hiện đã có ${existing.seats.length} ghế. Thao tác này có thể tạo trùng số ghế. Bạn có muốn tiếp tục?`)
        if (!confirmed) {
          setBulkLoading(false)
          return
        }
      }
      await addSeatsBulk(seatsPayload)
      alert(`Đã tạo ${seatsPayload.length} ghế cho xe ${selectedBuilderBus?.name || ''}`)

      const storedLayout = {
        busId: Number(builderForm.busId),
        floors,
        floorConfigs: activeFloorConfigs.slice(0, floors).map((config, index) => ({
          floor: config.floor || index + 1,
          prefix: (config.prefix || '').trim().toUpperCase(),
          rows: Number(config.rows) || 1,
          columns: Number(config.columns) || 1,
          label: config.floor === 1
            ? 'Tầng dưới'
            : config.floor === 2
              ? 'Tầng trên'
              : `Tầng ${config.floor || index + 1}`
        }))
      }
      // Lưu vào localStorage (để admin dùng)
      saveSeatLayoutConfig(storedLayout.busId, storedLayout)
      // Lưu vào database (để user dùng)
      try {
        await updateBusLayoutConfig(storedLayout.busId, storedLayout)
      } catch (error) {
        console.warn('Không thể lưu layout config vào database:', error)
      }
      if (selectedBusId && Number(selectedBusId) === storedLayout.busId) {
        setLayoutConfig(storedLayout)
      }

      fetch()
      if (selectedBusId && Number(selectedBusId) === Number(builderForm.busId)) {
        await fetchSeatMap(builderForm.busId)
      }
      setBuilderOpen(false)
    } catch (error) {
      console.error('Error generating seat layout:', error)
      alert(error?.response?.data?.message || error?.message || 'Không thể tạo sơ đồ ghế')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleDeleteSeatMap = async (targetBusId) => {
    const busIdToDelete = Number(targetBusId || selectedBusId)
    if (!busIdToDelete) {
      return alert('Vui lòng chọn xe cần xóa sơ đồ')
    }
    const targetBus = buses.find(b => b.id === busIdToDelete)
    const busLabel = `${targetBus?.name || 'Xe'}${targetBus?.license_plate ? ` • ${targetBus.license_plate}` : ''}`
    if (!confirm(`Bạn chắc chắn muốn xóa toàn bộ sơ đồ ghế của ${busLabel}?`)) return
    try {
      setDeleteMapLoading(true)
      await deleteSeatMap(busIdToDelete)
      removeSeatLayoutConfig(busIdToDelete)
      alert('Đã xóa sơ đồ ghế.')
      if (Number(selectedBusId) === busIdToDelete) {
        setLayoutConfig(null)
        setSeatMapData(DEFAULT_SEAT_MAP)
        await fetchSeatMap(busIdToDelete)
      }
      fetch()
    } catch (error) {
      console.error('Error deleting seat map:', error)
      alert(error?.response?.data?.message || error?.message || 'Không thể xóa sơ đồ ghế')
    } finally {
      setDeleteMapLoading(false)
    }
  }

  const handleRouteChange = (routeId) => {
    const route = routes.find(r => r.id === Number(routeId))
    
    if (route && route.bus_company_id) {
      const filtered = buses.filter(b => b.company_id === route.bus_company_id)
      setFilteredBuses(filtered)
      // Reset bus_id if current bus doesn't belong to selected route's company
      if (form.bus_id) {
        const currentBus = buses.find(b => b.id === Number(form.bus_id))
        if (!currentBus || currentBus.company_id !== route.bus_company_id) {
          setForm({ ...form, route_id: routeId, bus_id: '' })
        } else {
          setForm({ ...form, route_id: routeId })
        }
      } else {
        setForm({ ...form, route_id: routeId })
      }
    } else {
      setFilteredBuses([])
      setForm({ ...form, route_id: routeId, bus_id: '' })
    }
  }

  const openAdd = ()=>{ 
    if (routes.length === 0) {
      alert('Cần ít nhất 1 tuyến đường để tạo ghế. Vui lòng thêm tuyến đường trước.')
      return
    }
    setEditing(null)
    setForm({ 
      route_id: '',
      bus_id: selectedBusId || '', 
      seat_number: '', 
      seat_type: 'STANDARD', 
      price_for_seat_type: 0,
      is_hidden: false
    })
    setFilteredBuses([])
    setOpen(true) 
  }
  const openEdit = (row)=>{ 
    setEditing(row)
    setForm({ 
      route_id: '',
      bus_id: row.bus_id || '',
      seat_number: row.seat_number || '',
      seat_type: row.seat_type || 'STANDARD',
      price_for_seat_type: row.price_for_seat_type || 0,
      is_hidden: row.is_hidden || false
    })
    setOpen(true) 
  }

  const handleSeatEdit = (seat) => {
    openEdit({
      id: seat.id,
      bus_id: seat.busId || seat.bus_id,
      seat_number: seat.seatNumber || seat.seat_number,
      seat_type: seat.seatType || seat.seat_type,
      price_for_seat_type: seat.priceForSeatType || seat.price_for_seat_type || 0,
      is_hidden: seat.isHidden || seat.is_hidden || false,
      status: seat.status
    })
  }

  const cancelBulkEdit = () => {
    setMultiSelectMode(false)
    setSelectedBulkSeats([])
    setBulkEditForm({ seat_type: 'STANDARD', is_hidden: false })
  }

  const applyBulkEdit = async () => {
    if (!selectedBulkSeats.length) {
      return alert('Vui lòng chọn ít nhất 1 ghế để chỉnh sửa')
    }
    const payload = {
      seats: selectedBulkSeats.map(id => ({
        id,
        data: {
          seatType: bulkEditForm.seat_type,
          isHidden: bulkEditForm.is_hidden,
        }
      }))
    }
    try {
      setBulkEditLoading(true)
      await updateSeatsBulk(payload)
      alert(`Đã cập nhật ${selectedBulkSeats.length} ghế`)
      cancelBulkEdit()
      fetch()
      if (selectedBusId) {
        await fetchSeatMap(selectedBusId)
      }
    } catch (error) {
      console.error('Error bulk updating seats:', error)
      alert(error?.response?.data?.message || error?.message || 'Không thể cập nhật ghế')
    } finally {
      setBulkEditLoading(false)
    }
  }

  const handleSeatSelect = (seatId, isSelected) => {
    setSelectedBulkSeats(prev => {
      if (isSelected) {
        if (prev.includes(seatId)) return prev
        return [...prev, seatId]
      }
      return prev.filter(id => id !== seatId)
    })
  }

  const toggleBulkEditMode = (nextState) => {
    if (nextState) {
      setMultiSelectMode(true)
      setSelectedBulkSeats([])
      setBulkEditForm({ seat_type: 'STANDARD', is_hidden: false })
    } else {
      cancelBulkEdit()
    }
  }

  const save = async ()=>{
    if (!form.bus_id) {
      return alert('Không xác định được xe của ghế này')
    }
    if (!form.seat_number || !form.seat_number.trim()) {
      return alert('Không xác định được số ghế')
    }
    try {
      if (editing) {
        await updateSeat({
          id: editing.id,
          seat_type: form.seat_type,
          is_hidden: form.is_hidden,
        })
        alert('Cập nhật ghế thành công')
      } else {
        await addSeat(form)
        alert('Thêm ghế thành công')
      }
      setOpen(false)
      fetch()
      if (selectedBusId && Number(form.bus_id) === Number(selectedBusId)) {
        await fetchSeatMap(selectedBusId)
      }
    } catch (error) {
      console.error('Error saving seat:', error)
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu ghế')
    }
  }

  const handleDelete = async (rowOrId)=>{
    const seatId = typeof rowOrId === 'object' ? rowOrId.id : rowOrId
    const seat = typeof rowOrId === 'object' 
      ? rowOrId 
      : seats.find(item => item.id === seatId)

    if (!seatId) {
      console.error('Seat ID is missing, cannot delete.', rowOrId)
      alert('Không thể xác định ghế cần xóa. Vui lòng thử lại.')
      return
    }

    const seatNumber = seat?.seat_number || seat?.seatNumber || seatId
    const busId = seat?.bus_id || seat?.busId

    if (!confirm(`Bạn có chắc chắn muốn xóa ghế ${seatNumber}?`)) return

    try {
      await deleteSeat(seatId)
      alert('Xóa ghế thành công')
      fetch()
      if (busId && selectedBusId && Number(busId) === Number(selectedBusId)) {
        await fetchSeatMap(busId)
      }
    } catch (error) {
      console.error('Error deleting seat:', error)
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xóa ghế')
    }
  }

  const columns = [
    { key: 'seat_number', title: 'Số ghế', dataIndex: 'seat_number' },
    { key: 'bus_name', title: 'Tên xe', dataIndex: 'bus_name' },
    { key: 'seat_type', title: 'Loại ghế', dataIndex: 'seat_type', render: (value) => {
      const types = {
        'STANDARD': 'Thường',
        'VIP': 'VIP',
        'DOUBLE': 'Đôi',
        'LUXURY': 'Luxury'
      }
      return types[value] || value
    }},
    { key: 'price_for_seat_type', title: 'Giá (VNĐ)', dataIndex: 'price_for_seat_type', render: (value) => {
      return new Intl.NumberFormat('vi-VN').format(value || 0)
    }},
    { key: 'status', title: 'Trạng thái', dataIndex: 'status', render: (value) => {
      const statuses = {
        'AVAILABLE': 'Còn trống',
        'BOOKED': 'Đã bán',
        'RESERVED': 'Đã đặt'
      }
      return statuses[value] || value
    }},
    { key: 'created_at', title: 'Ngày tạo', dataIndex: 'created_at' },
  ]

  return (
    <div className="p-6">
      <Header 
        title="Quản lý ghế" 
        onAdd={openAdd}
        onRefresh={fetch}
      />

      {/* Filter & quick actions */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <FormInput
            type="select"
            label="Chọn nhà xe"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            options={[
              { value: '', label: '-- Chọn nhà xe --' },
              ...companies.map(company => ({ value: company.id, label: company.company_name }))
            ]}
          />
        </div>
        <div className="w-64">
          <FormInput
            type="select"
            label="Chọn xe để thiết lập sơ đồ"
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            disabled={!selectedCompanyId}
            options={[
              { value: '', label: selectedCompanyId ? '-- Chọn xe --' : 'Chọn nhà xe trước' },
              ...(selectedCompanyId ? companyFilteredBuses : []).map(bus => ({ value: bus.id, label: bus.name }))
            ]}
          />
        </div>
        <Button
          onClick={() => setBuilderOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Thêm sơ đồ chỗ ngồi
        </Button>
        {selectedBusId && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleDeleteSeatMap()}
              className="bg-rose-500 hover:bg-rose-600"
              disabled={deleteMapLoading}
            >
              {deleteMapLoading ? 'Đang xóa...' : 'Xóa sơ đồ'}
            </Button>
          </div>
        )}
      </div>

      {/* Seat map workspace */}
      {selectedBusId ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Sơ đồ ghế - {seatMapData.busName || selectedBus?.name || 'Đang tải...'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Nhà xe: {selectedBus?.company || 'Chưa xác định'} •
                  Biển số: {selectedBus?.license_plate || '---'} •
                  Sức chứa: {selectedBus?.capacity || 0} ghế
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    checked={multiSelectMode}
                    onChange={(e) => toggleBulkEditMode(e.target.checked)}
                    disabled={!seatMapData.seats.length}
                  />
                  Bật chế độ chọn nhiều ghế
                </label>
              </div>
            </div>
            {seatMapLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p>Đang tải sơ đồ ghế...</p>
              </div>
            ) : (
              <SeatMap
                seats={seatMapData.seats}
                seatMap={seatMapData.seatMap}
                onSeatEdit={handleSeatEdit}
                multiSelect={multiSelectMode}
                selectedSeats={selectedBulkSeats}
                onSeatSelect={handleSeatSelect}
                layoutConfig={layoutConfig}
              />
            )}
            {multiSelectMode && (
              <div className="mt-6 border-t border-dashed pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="text-sm text-gray-600">
                    Đang chọn <span className="font-semibold text-gray-900">{selectedBulkSeats.length}</span> ghế
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={cancelBulkEdit}>
                      Hủy chọn
                    </Button>
                    <Button
                      onClick={applyBulkEdit}
                      disabled={bulkEditLoading || !selectedBulkSeats.length}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {bulkEditLoading ? 'Đang áp dụng...' : 'Áp dụng thay đổi'}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại ghế</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={bulkEditForm.seat_type}
                      onChange={(e) => setBulkEditForm(prev => ({ ...prev, seat_type: e.target.value }))}
                    >
                      <option value="STANDARD">Thường</option>
                      <option value="VIP">VIP</option>
                      <option value="DOUBLE">Đôi</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-7">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={bulkEditForm.is_hidden}
                        onChange={(e) => setBulkEditForm(prev => ({ ...prev, is_hidden: e.target.checked }))}
                      />
                      Ẩn ghế (tạm ẩn)
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  * Chỉ các ghế chưa bán mới có thể chọn. Hãy click lại vào ghế để bỏ chọn.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-600 mb-2">Hướng dẫn thiết lập nhanh</p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Click vào ghế trên sơ đồ để chỉnh sửa loại ghế, giá hoặc ẩn hiện.</li>
                <li>Bật “Chỉnh sửa nhiều ghế” để chọn hàng loạt và áp dụng loại ghế/ẩn hiện cùng lúc.</li>
                <li>Xóa ghế trực tiếp ở danh sách bên dưới khi cần cấu hình lại.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
          <p className="text-lg font-semibold text-gray-700 mb-2">Chọn một xe để xem sơ đồ ghế</p>
          <p className="text-sm">Sau khi chọn xe, sơ đồ ghế tương ứng sẽ hiển thị tại đây để bạn cấu hình nhanh chóng.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Chỉnh sửa ghế' : 'Thêm ghế mới'}
      >
        <div className="space-y-4">
          {!editing && (
            <>
              <FormInput
                type="select"
                label="Tuyến đường *"
                value={form.route_id}
                onChange={(e) => handleRouteChange(e.target.value)}
                options={[
                  { value: '', label: '-- Chọn tuyến đường --' },
                  ...routes.map(route => ({ 
                    value: route.id, 
                    label: `${route.departure_station} → ${route.arrival_station} (${route.bus_company})` 
                  }))
                ]}
                required
              />
              <FormInput
                type="select"
                label="Xe *"
                value={form.bus_id}
                onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
                options={[
                  { value: '', label: '-- Chọn xe --' },
                  ...(form.route_id && filteredBuses.length > 0 ? filteredBuses : []).map(bus => ({ 
                    value: bus.id, 
                    label: `${bus.name} - ${bus.license_plate} (Sức chứa: ${bus.capacity}) - ${bus.company}` 
                  }))
                ]}
                required
                disabled={!form.route_id}
              />
              {!form.route_id && (
                <p className="text-sm text-gray-500">Vui lòng chọn tuyến đường trước để hiển thị danh sách xe</p>
              )}
              <FormInput
                type="text"
                label="Số ghế (ví dụ: A01, A11, B01)"
                value={form.seat_number}
                onChange={(e) => setForm({ ...form, seat_number: e.target.value.toUpperCase() })}
                placeholder="A01"
                required
              />
            </>
          )}
          <FormInput
            type="select"
            label="Loại ghế"
            value={form.seat_type}
            onChange={(e) => setForm({ ...form, seat_type: e.target.value })}
            options={[
              { value: 'STANDARD', label: 'Thường' },
              { value: 'VIP', label: 'VIP' },
              { value: 'DOUBLE', label: 'Đôi' }
            ]}
          />
          <FormInput
            type="checkbox"
            label="Ẩn ghế"
            checked={form.is_hidden}
            onChange={(e) => setForm({ ...form, is_hidden: e.target.checked })}
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setOpen(false)} className="bg-gray-500 hover:bg-gray-600">
              Hủy
            </Button>
            <Button onClick={save} className="bg-blue-500 hover:bg-blue-600">
              {editing ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="Thêm sơ đồ chỗ ngồi"
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              type="select"
              label="Nhà xe"
              value={builderForm.companyId}
              onChange={(e) => handleBuilderChange('companyId', e.target.value)}
              options={[
                { value: '', label: '-- Chọn nhà xe --' },
                ...companies.map(company => ({
                  value: company.id,
                  label: company.company_name
                }))
              ]}
            />
            <FormInput
              type="select"
              label="Xe"
              value={builderForm.busId}
              onChange={(e) => handleBuilderChange('busId', e.target.value)}
              disabled={!builderForm.companyId}
              options={[
                { value: '', label: builderForm.companyId ? '-- Chọn xe --' : 'Chọn nhà xe trước' },
                ...builderBuses.map(bus => ({
                  value: bus.id,
                  label: `${bus.name} • ${bus.license_plate}`
                }))
              ]}
            />
          </div>
          {builderForm.busId && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleDeleteSeatMap(builderForm.busId)}
                disabled={deleteMapLoading}
                className="border-rose-500 text-rose-600 hover:bg-rose-50"
              >
                {deleteMapLoading ? 'Đang xóa sơ đồ...' : 'Xóa sơ đồ xe này'}
              </Button>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-600">Số tầng (lấy từ cấu hình xe)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {builderBus?.floors || builderForm.floors || 1}
              </p>
              {!builderForm.busId && (
                <p className="text-xs text-gray-500 mt-2">Chọn nhà xe và xe để hệ thống tự đồng bộ số tầng.</p>
              )}
            </div>
            <FormInput
              type="select"
              label="Loại ghế mặc định"
              value={builderForm.seat_type}
              onChange={(e) => handleBuilderChange('seat_type', e.target.value)}
              options={[
                { value: 'STANDARD', label: 'Thường' },
                { value: 'VIP', label: 'VIP' },
              { value: 'DOUBLE', label: 'Đôi' }
              ]}
            />
          </div>
          {activeFloorConfigs.map((config, idx) => (
            <div key={config.floor} className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Cấu hình tầng {idx + 1}</p>
              <div className="grid gap-4 md:grid-cols-3">
                <FormInput
                  type="number"
                  label="Số hàng"
                  min="1"
                  value={config.rows}
                  onChange={(e) => handleFloorConfigChange(idx, 'rows', Math.max(1, Number(e.target.value) || 1))}
                />
                <FormInput
                  type="number"
                  label="Số cột"
                  min="1"
                  value={config.columns}
                  onChange={(e) => handleFloorConfigChange(idx, 'columns', Math.max(1, Number(e.target.value) || 1))}
                />
                <FormInput
                  type="text"
                  label="Tiền tố"
                  value={config.prefix}
                  onChange={(e) => handleFloorConfigChange(idx, 'prefix', e.target.value)}
                  placeholder={idx === 0 ? 'A' : 'B'}
                />
              </div>
            </div>
          ))}
          <FormInput
            type="number"
            label="Giá mặc định (VNĐ)"
            min="0"
            value={builderForm.price_for_seat_type}
            onChange={(e) => handleBuilderChange('price_for_seat_type', Math.max(0, Number(e.target.value) || 0))}
          />
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <p>
              Tổng ghế dự kiến: <span className="font-semibold text-gray-800">{builderSeatCount}</span>
              {builderBus?.capacity ? ` • Sức chứa xe: ${builderBus.capacity} ghế` : ''}
            </p>
            <p className="text-amber-600">
              Lưu ý: Hãy đảm bảo xóa ghế cũ trước khi sinh sơ đồ mới để tránh trùng số ghế.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setBuilderOpen(false)}
              variant="outline"
            >
              Đóng
            </Button>
            <Button
              onClick={handleGenerateSeatMap}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={bulkLoading || !builderForm.busId}
            >
              {bulkLoading ? 'Đang sinh...' : 'Sinh sơ đồ ghế'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

