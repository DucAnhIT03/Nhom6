import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import Header from '../../components/Header'
import { getBuses, addBus, updateBus, deleteBus } from '../../services/busService'
import { getCompanies } from '../../services/busCompanyService'

export default function Buses(){
  const [buses, setBuses] = useState([])
  const [companies, setCompanies] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', descriptions:'', license_plate:'', capacity:0, floors:2, company_ids:[] })

  const fetch = async ()=> { setBuses(await getBuses()); setCompanies(await getCompanies()) }
  useEffect(()=>{ fetch() }, [])

  const openAdd = ()=>{ 
    if (companies.length === 0) {
      alert('Cần ít nhất 1 nhà xe để tạo xe. Vui lòng thêm nhà xe trước.')
      return
    }
    setEditing(null); 
    setForm({ name:'', descriptions:'', license_plate:'', capacity:0, floors:2, company_ids:[] }); 
    setOpen(true) 
  }
  const openEdit = (row)=>{ 
    setEditing(row); 
    setForm({ 
      ...row, 
      company_ids: row.company_id ? [row.company_id] : [] 
    }); 
    setOpen(true) 
  }

  const save = async ()=>{
    // Validate form
    if (!form.name || !form.name.trim()) {
      return alert('Tên xe không được để trống')
    }
    if (!form.capacity || form.capacity <= 0 || isNaN(form.capacity)) {
      return alert('Sức chứa phải là số lớn hơn 0')
    }
    if (!form.floors || (form.floors !== 1 && form.floors !== 2)) {
      return alert('Số tầng phải là 1 hoặc 2')
    }

    const companyIds = Array.isArray(form.company_ids) 
      ? form.company_ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0)
      : []

    try {
      if (editing) {
        // Edit mode: chỉ cho phép chọn 1 nhà xe
        if (companyIds.length === 0) {
          return alert('Vui lòng chọn nhà xe')
        }
        if (companyIds.length > 1) {
          return alert('Khi sửa, chỉ có thể chọn 1 nhà xe')
        }
        if (!form.license_plate || !form.license_plate.trim()) {
          return alert('Biển số xe không được để trống')
        }

        const busData = {
          ...form,
          company_id: companyIds[0]
        }
        const response = await updateBus({ id: editing.id, ...busData })
        // Update state directly instead of fetching
        if (response?.success && response?.data) {
          const updated = {
            id: editing.id,
            name: response.data.name || form.name,
            descriptions: response.data.descriptions || form.descriptions,
            license_plate: response.data.licensePlate || form.license_plate,
            capacity: response.data.capacity || form.capacity,
            floors: response.data.floors || form.floors || 2,
            company_id: response.data.companyId || response.data.company?.id || companyIds[0],
            company: response.data.company?.companyName || companies.find(c => c.id === companyIds[0])?.company_name || '',
            created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : editing.created_at,
            updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          }
          setBuses(buses.map(b => b.id === editing.id ? updated : b))
        }
        alert('Cập nhật xe thành công')
        setOpen(false)
      } else {
        // Add mode: có thể chọn nhiều nhà xe
        if (companyIds.length === 0) {
          return alert('Vui lòng chọn ít nhất một nhà xe')
        }

        // Nếu chỉ chọn 1 nhà xe, yêu cầu nhập biển số
        if (companyIds.length === 1) {
          if (!form.license_plate || !form.license_plate.trim()) {
            return alert('Biển số xe không được để trống')
          }
        }

        const newBuses = []
        let successCount = 0
        let errorCount = 0

        // Tạo xe cho mỗi nhà xe
        for (let i = 0; i < companyIds.length; i++) {
          try {
            const companyId = companyIds[i]
            // Nếu có nhiều nhà xe, tự động tạo biển số hoặc yêu cầu nhập
            let licensePlate = form.license_plate.trim()
            
            // Nếu có nhiều nhà xe và chưa có biển số, tự động tạo
            if (companyIds.length > 1 && !licensePlate) {
              // Tạo biển số tự động dựa trên tên xe và số thứ tự
              licensePlate = `${form.name.replace(/\s+/g, '').substring(0, 5).toUpperCase()}-${i + 1}`
            }

            const busData = {
              name: form.name,
              descriptions: form.descriptions || '',
              license_plate: licensePlate,
              capacity: form.capacity,
              floors: form.floors,
              company_id: companyId
            }

            const response = await addBus(busData)
            if (response?.success && response?.data) {
              const newBus = {
                id: response.data.id,
                name: response.data.name || busData.name,
                descriptions: response.data.descriptions || busData.descriptions,
                license_plate: response.data.licensePlate || busData.license_plate,
                capacity: response.data.capacity || busData.capacity,
                floors: response.data.floors || busData.floors || 2,
                company_id: response.data.companyId || response.data.company?.id || companyId,
                company: response.data.company?.companyName || companies.find(c => c.id === companyId)?.company_name || '',
                created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
                updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
              }
              newBuses.push(newBus)
              successCount++
            }
          } catch (error) {
            console.error(`Error creating bus for company ${companyIds[i]}:`, error)
            errorCount++
          }
        }

        if (newBuses.length > 0) {
          setBuses([...newBuses, ...buses])
          if (errorCount > 0) {
            alert(`Thêm thành công ${successCount} xe. Có ${errorCount} xe không thể tạo.`)
          } else {
            alert(`Thêm thành công ${successCount} xe`)
          }
        } else {
          alert('Không thể tạo xe. Vui lòng thử lại.')
        }
        setOpen(false)
      }
    } catch (error) {
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Có lỗi xảy ra'
      alert('Lỗi: ' + message)
    }
  }

  const remove = async (id)=>{ 
    if(!confirm('Xác nhận xóa?')) return
    try {
      await deleteBus(id)
      // Remove from state directly instead of fetching
      setBuses(buses.filter(b => b.id !== id))
      alert('Xóa xe thành công')
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(message)
    }
  }

  const columns = [
    { key:'id', title:'ID', dataIndex:'id' },
    { key:'name', title:'Tên xe', dataIndex:'name' },
    { key:'license_plate', title:'Biển số', dataIndex:'license_plate' },
    { key:'capacity', title:'Số ghế', dataIndex:'capacity' },
    { 
      key:'floors', 
      title:'Số tầng', 
      dataIndex:'floors',
      render: (floors) => floors === 1 ? '1 tầng' : '2 tầng'
    },
    { key:'company', title:'Nhà xe', dataIndex:'company' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Xe"
        subtitle="Quản lý thông tin các xe"
        action={
          <Button 
            onClick={openAdd} 
            icon="+"
            disabled={companies.length === 0}
            title={companies.length === 0 ? 'Cần ít nhất 1 nhà xe để tạo xe' : ''}
          >
            Thêm xe
          </Button>
        }
      />

      <Table data={buses} columns={columns} onEdit={openEdit} onDelete={remove} />

      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing? 'Sửa xe':'Thêm xe'}>
        <FormInput label="Tên xe" required>
          <input 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            placeholder="Ví dụ: Xe giường nằm 40 chỗ"
            value={form.name} 
            onChange={e=>setForm({...form, name:e.target.value})} 
          />
        </FormInput>
        <FormInput label="Mô tả">
          <textarea 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            rows="3"
            placeholder="Mô tả về xe (tùy chọn)"
            value={form.descriptions} 
            onChange={e=>setForm({...form, descriptions:e.target.value})} 
          />
        </FormInput>
        <FormInput label="Biển số" required={editing || form.company_ids.length <= 1}>
          <input 
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            placeholder={form.company_ids.length > 1 ? "Để trống để tự động tạo (tùy chọn)" : "Ví dụ: 51G-12345"}
            value={form.license_plate} 
            onChange={e=>setForm({...form, license_plate:e.target.value})} 
          />
          {form.company_ids.length > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Nếu để trống, hệ thống sẽ tự động tạo biển số cho mỗi xe
            </p>
          )}
        </FormInput>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Sức chứa (ghế)" required>
            <input 
              type="number" 
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              placeholder="Ví dụ: 40"
              value={form.capacity || ''} 
              onChange={e=>setForm({...form, capacity: e.target.value ? Number(e.target.value) : ''})} 
            />
          </FormInput>
          <FormInput label="Số tầng" required>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.floors || 2} 
              onChange={e=>setForm({...form, floors: Number(e.target.value)})}
            >
              <option value="1">1 tầng</option>
              <option value="2">2 tầng</option>
            </select>
          </FormInput>
        </div>
        <FormInput label="Nhà xe" required>
          {editing ? (
            // Edit mode: chỉ cho phép chọn 1 nhà xe
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.company_ids[0] || ''} 
              onChange={e=>setForm({...form, company_ids: e.target.value ? [Number(e.target.value)] : []})}
            >
              <option value="">-- Chọn nhà xe --</option>
              {companies.map(c=> <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          ) : (
            // Add mode: cho phép chọn nhiều nhà xe bằng checkbox
            <div className="space-y-2">
              <div className="border border-gray-300 rounded-lg p-3 bg-white max-h-[200px] overflow-y-auto">
                {companies.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Chưa có nhà xe nào</p>
                ) : (
                  <div className="space-y-2">
                    {companies.map(c => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={form.company_ids.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                company_ids: [...form.company_ids, c.id]
                              })
                            } else {
                              setForm({
                                ...form,
                                company_ids: form.company_ids.filter(id => id !== c.id)
                              })
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 flex-1">
                          {c.company_name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {form.company_ids.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-600 font-medium">
                    Đã chọn: {form.company_ids.length} nhà xe
                  </p>
                  <button
                    type="button"
                    onClick={() => setForm({...form, company_ids: []})}
                    className="text-xs text-red-600 hover:text-red-700 underline"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              )}
              {form.company_ids.length === 0 && companies.length > 0 && (
                <p className="text-xs text-gray-500">Vui lòng chọn ít nhất một nhà xe</p>
              )}
              {form.company_ids.length > 1 && (
                <p className="text-xs text-amber-600">
                  ⚠️ Khi chọn nhiều nhà xe, biển số sẽ được tạo tự động nếu để trống
                </p>
              )}
            </div>
          )}
        </FormInput>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={()=>setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={save}>
            Lưu
          </Button>
        </div>
      </Modal>
    </div>
  )
}