import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
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

  const filteredCompanies = useMemo(() => {
    if (!selectedRouteId) return companies
    const route = routes.find(r => Number(r.id) === Number(selectedRouteId))
    if (!route) return companies
    return companies.filter(company => Number(company.id) === Number(route.bus_company_id))
  }, [companies, routes, selectedRouteId])

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

  useEffect(() => {
    if (!selectedRouteId) {
      setPriceForm(emptyPriceState())
      return
    }
    const loadPrices = async () => {
      try {
        const data = await getSeatTypePrices({ routeId: selectedRouteId })
        const nextState = emptyPriceState()
        data.forEach((item) => {
          nextState[item.seatType] = item.price ?? ''
        })
        setPriceForm(nextState)
      } catch (error) {
        console.error('Error loading seat type prices:', error)
        alert('Không thể tải giá ghế cho tuyến đã chọn')
      }
    }
    loadPrices()
  }, [selectedRouteId])

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

  const handleSaveSingle = async () => {
    if (!selectedRouteId) {
      return alert('Vui lòng chọn tuyến đường trước khi lưu')
    }
    try {
      setLoading(true)
      await saveSeatTypePrices({
        routeId: Number(selectedRouteId),
        seatTypePrices: normalizeSeatTypePrices(priceForm),
      })
      alert('Đã lưu giá vé theo loại cho tuyến đường')
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
                Chọn nhà xe → tuyến đường để cấu hình giá cho từng loại ghế.
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
                  label: `${route.departure_station} → ${route.arrival_station} (${route.bus_company})`,
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
                        className="flex items-center gap-3 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanyIds((prev) => [...prev, String(company.id)])
                            } else {
                              setSelectedCompanyIds((prev) =>
                                prev.filter((id) => id !== String(company.id))
                              )
                            }
                          }}
                        />
                        <span>{company.company_name}</span>
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

      </div>
    </div>
  )
}


