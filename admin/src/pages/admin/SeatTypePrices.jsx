import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import Table from '../../components/Table'
import { getRoutes } from '../../services/routeService'
import { getCompanies } from '../../services/busCompanyService'
import { 
  getSeatTypePrices, 
  saveSeatTypePrices, 
} from '../../services/seatTypePriceService'

const SEAT_TYPES = [
  { value: 'STANDARD', label: 'Ghế thường' },
  { value: 'VIP', label: 'Ghế VIP' },
  { value: 'DOUBLE', label: 'Ghế đôi' },
]

const emptyPriceState = () =>
  SEAT_TYPES.reduce((acc, type) => ({ ...acc, [type.value]: '' }), {})

export default function SeatTypePrices() {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [routes, setRoutes] = useState([])
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([])
  const [priceForm, setPriceForm] = useState(emptyPriceState())
  const [routePriceList, setRoutePriceList] = useState([])

  const selectedRoute = useMemo(
    () => routes.find((route) => Number(route.id) === Number(selectedRouteId)),
    [routes, selectedRouteId],
  )

  const filteredCompanies = useMemo(() => {
    if (!selectedRouteId) return companies
    if (!selectedRoute) return companies
    return companies.filter(
      (company) => Number(company.id) === Number(selectedRoute.bus_company_id),
    )
  }, [companies, selectedRoute, selectedRouteId])

  const fetchInitial = async () => {
    setLoading(true)
    try {
      const [companyData, routesData] = await Promise.all([
        getCompanies(),
        getRoutes(),
      ])
      setCompanies(companyData)
      setRoutes(routesData)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      alert('Không thể tải dữ liệu cần thiết')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitial()
  }, [])

  const loadSeatTypePrices = useCallback(
    async (routeId, companyName, companyId) => {
    try {
      const data = await getSeatTypePrices({
        routeId,
        companyId,
      })
      const nextState = emptyPriceState()
      data.forEach((item) => {
        nextState[item.seatType] = item.price ?? ''
      })
      setPriceForm(nextState)

      const normalizedList = SEAT_TYPES.map((type) => {
        const found = data.find((item) => item.seatType === type.value)
        return {
          id: `${routeId}-${type.value}`,
          seatType: type.value,
          seatTypeLabel: type.label,
          price: found?.price ?? '',
          companyName: companyName || '',
        }
      })
      setRoutePriceList(normalizedList)
    } catch (error) {
      console.error('Error loading seat type prices:', error)
      alert('Không thể tải giá ghế cho tuyến đã chọn')
      setRoutePriceList([])
    }
    },
    [],
  )

  useEffect(() => {
    if (!selectedRouteId || selectedCompanyIds.length === 0) {
      setPriceForm(emptyPriceState())
      setRoutePriceList([])
      return
    }

    const activeCompanyId = selectedCompanyIds[0]
    const activeCompany = companies.find(
      (c) => String(c.id) === String(activeCompanyId),
    )

    loadSeatTypePrices(
      selectedRouteId,
      activeCompany?.company_name || selectedRoute?.bus_company,
      activeCompanyId,
    )
  }, [
    selectedRouteId,
    selectedCompanyIds,
    companies,
    selectedRoute?.bus_company,
    loadSeatTypePrices,
  ])

  const handleRoutePriceChange = (seatType, value) => {
    setPriceForm((prev) => ({
      ...prev,
      [seatType]: value,
    }))
  }

  const normalizeSeatTypePrices = (state) =>
    SEAT_TYPES.map((type) => ({
      seatType: type.value,
      price: Number(state[type.value]) || 0,
    }))

  const handleEditRow = (row) => {
    if (!row) return
    const input = document.getElementById(`seat-price-${row.seatType}`)
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      input.focus()
    }
  }

  const handleDeleteRow = async (row) => {
    if (!selectedRouteId || !row) return
    if (!selectedCompanyIds.length) {
      return alert('Vui lòng tick chọn nhà xe trước khi xóa giá')
    }

    const activeCompanyId = selectedCompanyIds[0]
    const activeCompany = companies.find(
      (c) => String(c.id) === String(activeCompanyId),
    )
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa giá cho "${row.seatTypeLabel}" không?`,
    )
    if (!confirmDelete) return

    const nextState = {
      ...priceForm,
      [row.seatType]: '',
    }
    setPriceForm(nextState)

    try {
      setLoading(true)
      await saveSeatTypePrices({
        routeId: Number(selectedRouteId),
        seatTypePrices: normalizeSeatTypePrices(nextState),
      })
      alert('Đã xóa giá vé cho loại ghế này')
      await loadSeatTypePrices(
        selectedRouteId,
        activeCompany?.company_name || selectedRoute?.bus_company,
        activeCompanyId,
      )
    } catch (error) {
      console.error('Error deleting seat type price:', error)
      alert(error?.response?.data?.message || 'Không thể xóa giá vé loại ghế này')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSingle = async () => {
    if (!selectedRouteId) {
      return alert('Vui lòng chọn tuyến đường trước khi lưu')
    }
    if (!selectedCompanyIds.length) {
      return alert('Vui lòng tick chọn nhà xe trước khi lưu giá')
    }

    const activeCompanyId = selectedCompanyIds[0]
    const activeCompany = companies.find(
      (c) => String(c.id) === String(activeCompanyId),
    )
    try {
      setLoading(true)
      await saveSeatTypePrices({
        routeId: Number(selectedRouteId),
        seatTypePrices: normalizeSeatTypePrices(priceForm),
      })
      alert('Đã lưu giá vé theo loại cho tuyến đường')
      await loadSeatTypePrices(
        selectedRouteId,
        activeCompany?.company_name || selectedRoute?.bus_company,
        activeCompanyId,
      )
    } catch (error) {
      console.error('Error saving seat type prices:', error)
      alert(error?.response?.data?.message || 'Không thể lưu giá vé')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Header title="Giá vé theo loại" onRefresh={fetchInitial} />

      <div className="grid gap-6">
        <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Thiết lập giá theo tuyến đường
              </h2>
              <p className="text-sm text-gray-500">
                Chọn tuyến đường, cấu hình giá cho từng loại ghế rồi lưu lại.
              </p>
            </div>
            {selectedRouteId && (
              <Button onClick={handleSaveSingle} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu giá tuyến này'}
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              type="select"
              label="Tuyến đường"
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value)
                setSelectedCompanyIds([])
                setPriceForm(emptyPriceState())
              }}
              options={[
                { value: '', label: '-- Chọn tuyến đường --' },
                ...routes.map((route) => ({
                  value: route.id,
                  label: `${route.departure_station} → ${route.arrival_station}`,
                })),
              ]}
            />
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Nhà xe (tick chọn)
              </p>
              <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 max-h-56 overflow-y-auto">
                {!selectedRouteId && (
                  <p className="text-sm text-gray-500">
                    Chọn tuyến đường trước để hiển thị nhà xe.
                  </p>
                )}
                {selectedRouteId && filteredCompanies.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Tuyến này chưa có nhà xe phù hợp.
                  </p>
                )}
                {selectedRouteId &&
                  filteredCompanies.map((company) => {
                    const checked = selectedCompanyIds.includes(String(company.id))
                    return (
                      <label
                        key={company.id}
                        className="flex items-center justify-between text-sm text-gray-700"
                      >
                        <span>{company.company_name}</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanyIds((prev) => [...prev, String(company.id)])
                            } else {
                              setSelectedCompanyIds((prev) =>
                                prev.filter((id) => id !== String(company.id)),
                              )
                            }
                          }}
                        />
                      </label>
                    )
                  })}
              </div>
              {selectedCompanyIds.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  Đã chọn: {selectedCompanyIds.length} nhà xe
                </p>
              )}
            </div>
          </div>

          {selectedRouteId ? (
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {SEAT_TYPES.map((type) => (
                <FormInput
                  key={type.value}
                  type="number"
                  id={`seat-price-${type.value}`}
                  label={`Giá ${type.label} (VNĐ)`}
                  min="0"
                  value={priceForm[type.value]}
                  onChange={(e) =>
                    handleRoutePriceChange(type.value, e.target.value)
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Vui lòng chọn tuyến đường để thiết lập giá.
            </p>
          )}
        </section>
        <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Thông tin giá vé
              </h2>
              <p className="text-sm text-gray-500">
                Hiển thị giá vé hiện hành cho từng loại ghế của tuyến đã chọn.
              </p>
            </div>
          </div>
          {selectedRoute && (
            <div className="mb-4 text-sm text-gray-600">
              <p>
                Tuyến: <span className="font-semibold">{selectedRoute.departure_station} → {selectedRoute.arrival_station}</span>
              </p>
              <p>
                Nhà xe: <span className="font-semibold">{selectedRoute.bus_company || 'Chưa xác định'}</span>
              </p>
            </div>
          )}
          {!selectedRouteId && (
            <p className="text-sm text-gray-500">
              Chọn tuyến đường để xem danh sách giá đã lưu.
            </p>
          )}
          {selectedRouteId && selectedCompanyIds.length === 0 && (
            <p className="text-sm text-gray-500">
              Tick chọn nhà xe để xem thông tin giá vé.
            </p>
          )}
          {selectedRouteId && selectedCompanyIds.length > 0 && (
            <Table
              data={routePriceList}
              columns={[
                {
                  key: 'seatType',
                  dataIndex: 'seatTypeLabel',
                  title: 'Loại ghế',
                },
                {
                  key: 'company',
                  dataIndex: 'companyName',
                  title: 'Nhà xe',
                  render: (value) =>
                    value || selectedRoute?.bus_company || 'Chưa xác định',
                },
                {
                  key: 'price',
                  dataIndex: 'price',
                  title: 'Giá (VNĐ)',
                  render: (value) =>
                    value ? Number(value).toLocaleString('vi-VN') : 'Chưa cấu hình',
                },
              ]}
              customActions={(row) => (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditRow(row)}>
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteRow(row)}
                  >
                    Xóa
                  </Button>
                </div>
              )}
            />
          )}
        </section>
      </div>
    </div>
  )
}


