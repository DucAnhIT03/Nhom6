import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { getBusStations, addBusStation, updateBusStation, deleteBusStation } from '../../services/stationService'
import { uploadImage } from '../../services/uploadService'

export default function Stations(){
  const [stations, setStations] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ name:'', image:'', descriptions:'', location:'' })
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)

  const fetch = async ()=> {
    setLoading(true)
    try {
      const data = await getBusStations()
      setStations(data)
    } catch (error) {
      console.error('Error fetching stations:', error)
      alert('Không thể tải danh sách bến xe')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ fetch() }, [])

  const openAdd = ()=>{ 
    setEditing(null); 
    setForm({ name:'', image:'', descriptions:'', location:'' }); 
    setImagePreview('')
    setImageFile(null)
    setOpen(true) 
  }
  
  const openEdit = (row)=>{ 
    setEditing(row); 
    setForm({ 
      name: row.name || '',
      image: row.image || '',
      descriptions: row.descriptions || '',
      location: row.location || ''
    }); 
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
    if (!form.name) {
      return alert('Tên bến không được để trống')
    }
    
    try {
      setUploading(true)
      
      // Upload image if there's a new file
      let imageUrl = form.image
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, 'stations')
        } catch (error) {
          alert('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message))
          setUploading(false)
          return
        }
      }
      
      // Save station with image URL
      const stationData = {
        ...form,
        image: imageUrl
      }
      
      if (editing) {
        const response = await updateBusStation({ id: editing.id, ...stationData })
        // Update state directly instead of fetching
        if (response?.success && response?.data) {
          const updated = {
            id: editing.id,
            name: response.data.name || stationData.name,
            image: response.data.image || imageUrl,
            descriptions: response.data.descriptions || stationData.descriptions,
            location: response.data.location || stationData.location,
            created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : editing.created_at,
            updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          }
          setStations(stations.map(s => s.id === editing.id ? updated : s))
        }
        alert('Cập nhật bến xe thành công')
      } else {
        const response = await addBusStation(stationData)
        // Add to state directly instead of fetching
        if (response?.success && response?.data) {
          const newStation = {
            id: response.data.id,
            name: response.data.name || stationData.name,
            image: response.data.image || imageUrl,
            descriptions: response.data.descriptions || stationData.descriptions,
            location: response.data.location || stationData.location,
            created_at: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            updated_at: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          }
          setStations([newStation, ...stations])
        }
        alert('Thêm bến xe thành công')
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
    if(!confirm('Xác nhận xóa bến xe này?')) return
    
    try {
      await deleteBusStation(id)
      // Remove from state directly instead of fetching
      setStations(stations.filter(s => s.id !== id))
      alert('Xóa bến xe thành công')
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
          alt="Bến xe" 
          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
          Không có ảnh
        </div>
      )
    },
    { key:'name', title:'Tên bến', dataIndex:'name' },
    { key:'location', title:'Vị trí', dataIndex:'location' },
    { key:'created_at', title:'Ngày tạo', dataIndex:'created_at' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Bến xe"
        subtitle="Quản lý thông tin các bến xe"
        action={
          <Button onClick={openAdd} icon="+">
            Thêm bến xe
          </Button>
        }
      />

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <Table data={stations} columns={columns} onEdit={openEdit} onDelete={remove} />
      )}

      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing? 'Sửa bến xe':'Thêm bến xe'}>
        <div className="space-y-4">
          <FormInput label="Tên bến" required>
            <input 
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white" 
              value={form.name} 
              onChange={e=>setForm({...form, name:e.target.value})} 
              placeholder="Nhập tên bến xe"
            />
          </FormInput>
          
          <FormInput label="Hình ảnh">
            <div className="space-y-2">
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                disabled={uploading}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </FormInput>
          
          <FormInput label="Mô tả">
            <textarea 
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none" 
              value={form.descriptions} 
              onChange={e=>setForm({...form, descriptions:e.target.value})} 
              placeholder="Nhập mô tả về bến xe"
            />
          </FormInput>
          <FormInput label="Vị trí">
            <input 
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white" 
              value={form.location} 
              onChange={e=>setForm({...form, location:e.target.value})} 
              placeholder="Nhập địa chỉ bến xe"
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
          <Button
            onClick={save}
            disabled={uploading}
          >
            {uploading ? 'Đang upload...' : (editing ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
