import React, { useEffect, useState, useMemo } from 'react'
import Table from '../../components/Table'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import { getUsers, blockUser, unblockUser, createAdmin, createStaff, updateUserBusCompany } from '../../services/userService'
import { getCompanies } from '../../services/busCompanyService'

export default function Users(){
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([]) // Store all users for filtering
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL') // ALL, ROLE_ADMIN, ROLE_USER, ROLE_STAFF
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'ROLE_STAFF', // Default to staff
    busCompanyId: ''
  })
  const [creating, setCreating] = useState(false)
  const [companies, setCompanies] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [editBusCompanyModalOpen, setEditBusCompanyModalOpen] = useState(false)
  const [editBusCompanyId, setEditBusCompanyId] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetch = async ()=> {
    setLoading(true)
    try {
      const data = await getUsers()
      setAllUsers(data)
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ 
    fetch()
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = [...allUsers]

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => {
        const roles = user.roles || []
        return roles.includes(roleFilter)
      })
    }

    // Filter by search term (name, phone, email)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase()
        const email = (user.email || '').toLowerCase()
        const phone = (user.phone || '').toLowerCase()
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower)
      })
    }

    setUsers(filtered)
  }, [searchTerm, roleFilter, allUsers])

  const handleToggleStatus = async (user) => {
    const action = user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'
    if(!confirm(`Xác nhận ${action} tài khoản ${user.email}?`)) return
    
    try {
      if (user.status === 'ACTIVE') {
        await blockUser(user.id)
        alert('Khóa tài khoản thành công')
      } else {
        await unblockUser(user.id)
        alert('Mở khóa tài khoản thành công')
      }
      fetch()
    } catch (error) {
      console.error('Error updating user status:', error)
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(message)
    }
  }

  const openAddModal = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'ROLE_STAFF'
    })
    setModalOpen(true)
  }

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (form.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setCreating(true)
    try {
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        busCompanyId: form.role === 'ROLE_STAFF' && form.busCompanyId ? Number(form.busCompanyId) : undefined
      }

      if (form.role === 'ROLE_ADMIN') {
        await createAdmin(userData)
        alert('Tạo tài khoản quản trị viên thành công')
      } else {
        await createStaff(userData)
        alert('Tạo tài khoản nhân viên thành công')
      }
      
      setModalOpen(false)
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'ROLE_STAFF',
        busCompanyId: ''
      })
      fetch()
    } catch (error) {
      console.error('Error creating user:', error)
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(message)
    } finally {
      setCreating(false)
    }
  }

  const handleOpenEditBusCompany = (user) => {
    setEditingUser(user)
    setEditBusCompanyId(user.bus_company_id || '')
    setEditBusCompanyModalOpen(true)
  }

  const handleUpdateBusCompany = async () => {
    if (!editingUser) return
    
    setUpdating(true)
    try {
      await updateUserBusCompany(editingUser.id, editBusCompanyId || null)
      alert('Cập nhật nhà xe thành công')
      setEditBusCompanyModalOpen(false)
      setEditingUser(null)
      setEditBusCompanyId('')
      fetch()
    } catch (error) {
      console.error('Error updating bus company:', error)
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(message)
    } finally {
      setUpdating(false)
    }
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      'ROLE_ADMIN': 'Quản trị viên',
      'ROLE_USER': 'Người dùng',
      'ROLE_STAFF': 'Nhân viên xe',
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'ROLE_ADMIN': 'bg-purple-100 text-purple-800',
      'ROLE_USER': 'bg-blue-100 text-blue-800',
      'ROLE_STAFF': 'bg-green-100 text-green-800',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const getCompanyName = (companyId) => {
    if (!companyId) return 'Chưa gán'
    const company = companies.find(c => c.id === companyId)
    return company ? company.company_name : 'Không tìm thấy'
  }

  const columns = [
    { key:'id', title:'ID', dataIndex:'id' },
    { key:'last_name', title:'Họ', dataIndex:'last_name' },
    { key:'first_name', title:'Tên', dataIndex:'first_name' },
    { key:'email', title:'Email', dataIndex:'email' },
    { key:'phone', title:'SĐT', dataIndex:'phone' },
    { 
      key:'roles', 
      title:'Vai trò', 
      dataIndex:'roles',
      render: (roles) => {
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
          return <span className="text-gray-400 italic">Chưa có vai trò</span>;
        }
        return (
          <div className="flex flex-wrap gap-2">
            {roles.map((role, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
              >
                {getRoleLabel(role)}
              </span>
            ))}
          </div>
        );
      }
    },
    { 
      key:'bus_company_id', 
      title:'Nhà xe', 
      dataIndex:'bus_company_id',
      render: (busCompanyId, user) => {
        const isStaff = user.roles && user.roles.includes('ROLE_STAFF')
        if (!isStaff) {
          return <span className="text-gray-400">-</span>
        }
        return (
          <div className="flex items-center gap-2">
            <span className={busCompanyId ? '' : 'text-gray-400 italic'}>
              {getCompanyName(busCompanyId)}
            </span>
            <button
              onClick={() => handleOpenEditBusCompany(user)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Sửa
            </button>
          </div>
        )
      }
    },
    { key:'status', title:'Trạng thái', dataIndex:'status' },
    { key:'created_at', title:'Ngày tạo', dataIndex:'created_at' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Người dùng"
        subtitle="Quản lý tài khoản người dùng"
        action={
          <Button onClick={openAddModal} icon="+">
            Thêm tài khoản
          </Button>
        }
      />

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo vai trò
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ROLE_ADMIN">Quản trị viên</option>
              <option value="ROLE_USER">Người dùng</option>
              <option value="ROLE_STAFF">Nhân viên xe</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {searchTerm || roleFilter !== 'ALL' ? (
          <div className="mt-3 text-sm text-gray-600">
            Tìm thấy <span className="font-semibold text-blue-600">{users.length}</span> người dùng
            {searchTerm && ` với từ khóa "${searchTerm}"`}
            {roleFilter !== 'ALL' && ` có vai trò ${getRoleLabel(roleFilter)}`}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <Table 
          data={users} 
          columns={columns} 
          onToggleStatus={handleToggleStatus}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Thêm tài khoản mới">
        <div className="space-y-5">
          <FormInput label="Vai trò" required>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.role}
              onChange={(e) => setForm({...form, role: e.target.value, busCompanyId: e.target.value === 'ROLE_ADMIN' ? '' : form.busCompanyId})}
            >
              <option value="ROLE_STAFF">Nhân viên xe</option>
              <option value="ROLE_ADMIN">Quản trị viên</option>
            </select>
          </FormInput>

          {form.role === 'ROLE_STAFF' && (
            <FormInput label="Nhà xe (tùy chọn)">
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                value={form.busCompanyId}
                onChange={(e) => setForm({...form, busCompanyId: e.target.value})}
              >
                <option value="">Chưa gán nhà xe</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </FormInput>
          )}

          <FormInput label="Họ" required>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={form.lastName}
              onChange={(e) => setForm({...form, lastName: e.target.value})}
              placeholder="Nhập họ"
            />
          </FormInput>

          <FormInput label="Tên" required>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={form.firstName}
              onChange={(e) => setForm({...form, firstName: e.target.value})}
              placeholder="Nhập tên"
            />
          </FormInput>

          <FormInput label="Email" required>
            <input
              type="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              placeholder="example@email.com"
            />
          </FormInput>

          <FormInput label="Mật khẩu" required>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Tối thiểu 6 ký tự"
            />
          </FormInput>

          <FormInput label="Số điện thoại">
            <input
              type="tel"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              placeholder="0329263803 (không bắt buộc)"
            />
          </FormInput>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={creating}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Bus Company Modal */}
      <Modal 
        isOpen={editBusCompanyModalOpen} 
        onClose={() => {
          setEditBusCompanyModalOpen(false)
          setEditingUser(null)
          setEditBusCompanyId('')
        }} 
        title={`Gán nhà xe cho ${editingUser ? `${editingUser.first_name} ${editingUser.last_name}` : 'nhân viên'}`}
      >
        <div className="space-y-4">
          <FormInput label="Nhà xe">
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={editBusCompanyId}
              onChange={(e) => setEditBusCompanyId(e.target.value)}
            >
              <option value="">Chưa gán nhà xe</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </FormInput>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditBusCompanyModalOpen(false)
                setEditingUser(null)
                setEditBusCompanyId('')
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateBusCompany} disabled={updating}>
              {updating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
