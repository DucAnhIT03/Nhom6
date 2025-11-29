import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { getBanners, addBanner, updateBanner, deleteBanner } from '../../services/bannerService'
import { uploadImage } from '../../services/uploadService'

export default function Banners() {
  const [banners, setBanners] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ banner_url: '', position: 'HOME_TOP' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetch = async () => {
    const res = await getBanners()
    setBanners(res.items || [])
  }

  useEffect(() => {
    fetch()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ banner_url: '', position: 'HOME_TOP' })
    setFile(null)
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({ banner_url: row.banner_url || '', position: row.position || 'HOME_TOP' })
    setFile(null)
    setOpen(true)
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
  }

  const save = async () => {
    try {
      setUploading(true)

      let bannerUrl = form.banner_url

      // Nếu có chọn file thì upload, ưu tiên ảnh upload
      if (file) {
        bannerUrl = await uploadImage(file, 'banners')
      }

      if (!bannerUrl || !bannerUrl.trim()) {
        setUploading(false)
        return alert('Vui lòng chọn ảnh banner')
      }

      const payload = { banner_url: bannerUrl, position: form.position || 'HOME_TOP' }

      if (editing) {
        await updateBanner({ id: editing.id, ...payload })
      } else {
        await addBanner(payload)
      }
      setOpen(false)
      setFile(null)
      fetch()
    } catch (error) {
      alert(error.message || 'Lưu banner thất bại')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Xác nhận xóa banner này?')) return
    await deleteBanner(id)
    fetch()
  }

  const columns = [
    { key: 'id', title: 'ID', dataIndex: 'id' },
    { key: 'banner_url', title: 'Banner', dataIndex: 'banner_url', render: (value) => (
      value ? <img src={value} alt="banner" className="h-16 w-auto rounded-md object-cover" /> : ''
    ) },
    { key: 'position', title: 'Vị trí', dataIndex: 'position', render: (value) => {
      if (value === 'HOME_TOP') return 'Banner trang chủ (trên cùng)'
      if (value === 'FEATURED_OFFERS') return 'Ưu đãi nổi bật'
      return value
    } },
    { key: 'created_at', title: 'Ngày tạo', dataIndex: 'created_at' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header
        title="Quản lý Banner"
        subtitle="Banner hiển thị ở trang chủ, sát header và full chiều ngang"
        action={
          <Button onClick={openAdd} icon="+">
            Thêm banner
          </Button>
        }
      />

      <Table data={banners} columns={columns} onEdit={openEdit} onDelete={remove} />

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Sửa banner' : 'Thêm banner mới'}
      >
        <div className="space-y-5">
          <FormInput label="Ảnh banner" required>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {form.banner_url && !file && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Ảnh hiện tại:</p>
                <img
                  src={form.banner_url}
                  alt="banner preview"
                  className="h-24 w-auto rounded-md object-cover border border-gray-200"
                />
              </div>
            )}
          </FormInput>

          <FormInput label="Vị trí hiển thị" required>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            >
              <option value="HOME_TOP">Banner trang chủ (trên cùng)</option>
              <option value="FEATURED_OFFERS">Ưu đãi nổi bật</option>
            </select>
          </FormInput>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
              Hủy
            </Button>
            <Button onClick={save} disabled={uploading}>
              {uploading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

