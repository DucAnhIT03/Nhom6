import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { getCompanies, addCompany, updateCompany, deleteCompany } from '../../services/busCompanyService'
import { uploadImage } from '../../services/uploadService'

export default function BusCompanies(){
  const [companies, setCompanies] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ company_name:'', image:'', address:'', descriptions:'' })
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)

  const fetch = async ()=> {
    setLoading(true)
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
      alert('Không thể tải danh sách nhà xe')
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ fetch() }, [])

  const openAdd = ()=>{ 
    setEditing(null)
    setForm({ company_name:'', image:'', address:'', descriptions:'' })
    setImagePreview('')
    setImageFile(null)
    setOpen(true) 
  }
  
  const openEdit = (row)=>{ 
    setEditing(row)
    setForm({ 
      company_name: row.company_name || '',
      image: row.image || '',
      address: row.address || '',
      descriptions: row.descriptions || ''
    })
    setImagePreview(row.image || '')
    setImageFile(null)
    setOpen(true) 
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB')
        return
      }

      // Store file for upload
      setImageFile(file)
      
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const save = async ()=>{
    if (!form.company_name) {
      return alert('Tên nhà xe không được để trống')
    }
    
    try {
      setUploading(true)
      
      // Upload image if there's a new file
      let imageUrl = form.image
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, 'companies')
        } catch (error) {
          alert('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message))
          setUploading(false)
          return
        }
      }
      
      // Save company with image URL
      const companyData = {
        ...form,
        image: imageUrl
      }
      
      if (editing) {
        const response = await updateCompany({ id: editing.id, ...companyData })
        // Update state directly instead of fetching
        if (response?.success && response?.data) {
          const updated = {
            id: editing.id,
            company_name: response.data.companyName || companyData.company_name,
            image: response.data.image || imageUrl,
            address: response.data.address || companyData.address,
            descriptions: response.data.descriptions || companyData.descriptions,
            created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : editing.created_at,
            updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          }
          setCompanies(companies.map(c => c.id === editing.id ? updated : c))
        }
        alert('Cập nhật nhà xe thành công')
      } else {
        const response = await addCompany(companyData)
        // Add to state directly instead of fetching
        if (response?.success && response?.data) {
          const newCompany = {
            id: response.data.id,
            company_name: response.data.companyName || companyData.company_name,
            image: response.data.image || imageUrl,
            address: response.data.address || companyData.address,
            descriptions: response.data.descriptions || companyData.descriptions,
            created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          }
          setCompanies([newCompany, ...companies])
        }
        alert('Thêm nhà xe thành công')
      }
      setOpen(false)
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(message)
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id)=>{ 
    if(!confirm('Bạn có chắc chắn muốn xóa nhà xe này?')) return
    
    try {
      await deleteCompany(id)
      // Remove from state directly instead of fetching
      setCompanies(companies.filter(c => c.id !== id))
      alert('Xóa nhà xe thành công')
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(message)
    }
  }

  const columns = [
    { key:'id', title:'ID', dataIndex:'id' },
    { 
      key:'image', 
      title:'Hình ảnh', 
      dataIndex:'image',
      render: (image) => image ? (
        <img 
          src={image} 
          alt="Nhà xe" 
          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
          Không có ảnh
        </div>
      )
    },
    { key:'company_name', title:'Tên nhà xe', dataIndex:'company_name' },
    { key:'address', title:'Địa chỉ trụ sở', dataIndex:'address' },
    { key:'descriptions', title:'Mô tả', dataIndex:'descriptions', render: (text) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '-' },
    { key:'created_at', title:'Ngày tạo', dataIndex:'created_at' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Nhà xe"
        subtitle="Quản lý thông tin các nhà xe"
        action={
          <Button onClick={openAdd} icon="+">
            Thêm nhà xe
          </Button>
        }
      />

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <Table data={companies} columns={columns} onEdit={openEdit} onDelete={remove} />
      )}

      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing? 'Sửa nhà xe':'Thêm nhà xe mới'}>
        <div className="space-y-5">
          <FormInput label="Tên nhà xe" required>
            <input 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200" 
              value={form.company_name} 
              onChange={e=>setForm({...form, company_name:e.target.value})} 
              placeholder="Nhập tên nhà xe"
            />
          </FormInput>
          
          <FormInput label="Hình ảnh">
            {imagePreview && (
              <div className="mb-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            <input 
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">Chọn file ảnh (JPG, PNG, tối đa 5MB)</p>
          </FormInput>
          
          <FormInput label="Địa chỉ trụ sở">
            <input 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200" 
              value={form.address} 
              onChange={e=>setForm({...form, address:e.target.value})} 
              placeholder="Nhập địa chỉ trụ sở của nhà xe"
            />
          </FormInput>
          
          <FormInput label="Mô tả nhà xe">
            <textarea 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none" 
              rows={4}
              value={form.descriptions} 
              onChange={e=>setForm({...form, descriptions:e.target.value})} 
              placeholder="Nhập mô tả về nhà xe"
            />
          </FormInput>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={()=>setOpen(false)}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button onClick={save} disabled={uploading}>
            {uploading ? 'Đang upload...' : (editing ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
