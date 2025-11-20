import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Header from '../../components/Header'
import { getUsers, blockUser, unblockUser } from '../../services/userService'

export default function Users(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = async ()=> {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ fetch() }, [])

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

  const columns = [
    { key:'id', title:'ID', dataIndex:'id' },
    { key:'last_name', title:'Họ', dataIndex:'last_name' },
    { key:'first_name', title:'Tên', dataIndex:'first_name' },
    { key:'email', title:'Email', dataIndex:'email' },
    { key:'phone', title:'SĐT', dataIndex:'phone' },
    { key:'status', title:'Trạng thái', dataIndex:'status' },
    { key:'created_at', title:'Ngày tạo', dataIndex:'created_at' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Người dùng"
        subtitle="Quản lý tài khoản người dùng"
      />

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
    </div>
  )
}
