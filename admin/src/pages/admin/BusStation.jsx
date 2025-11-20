import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { getBusStationRelations, addBusStationRelation, deleteBusStationRelation } from '../../services/busStationService'
import { getBusStations } from '../../services/stationService'
import { getBuses } from '../../services/busService'

export default function BusStation(){
  const [relations, setRelations] = useState([])
  const [stations, setStations] = useState([])
  const [buses, setBuses] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ station_id:'', bus_id:'' })

  const fetch = async ()=> {
    setRelations(await getBusStationRelations())
    setStations(await getBusStations())
    setBuses(await getBuses())
  }
  useEffect(()=>{ fetch() }, [])

  const openAdd = ()=>{ 
    if (stations.length === 0) {
      alert('Cần ít nhất 1 bến xe để thêm quan hệ. Vui lòng thêm bến xe trước.')
      return
    }
    if (buses.length === 0) {
      alert('Cần ít nhất 1 xe để thêm quan hệ. Vui lòng thêm xe trước.')
      return
    }
    setForm({ station_id: stations[0]?.id||'', bus_id: buses[0]?.id||'' }); 
    setOpen(true) 
  }

  const save = async ()=>{
    if (!form.station_id || !form.bus_id) {
      return alert('Vui lòng chọn đầy đủ bến xe và xe')
    }
    try {
      await addBusStationRelation({ station_id: Number(form.station_id), bus_id: Number(form.bus_id) })
      alert('Thêm xe vào bến thành công')
      setOpen(false)
      fetch()
    } catch (error) {
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Có lỗi xảy ra'
      alert('Lỗi: ' + message)
    }
  }
  
  const remove = async (rel)=>{
    if(!confirm('Xác nhận xóa quan hệ này?')) return
    try {
      await deleteBusStationRelation(rel)
      alert('Xóa quan hệ thành công')
      fetch()
    } catch (error) {
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Có lỗi xảy ra'
      alert('Lỗi: ' + message)
    }
  }

  const columns = [
    { key:'station_name', title:'Bến xe', dataIndex:'station_name' },
    { key:'bus_name', title:'Xe', dataIndex:'bus_name' },
    { key:'license_plate', title:'Biển số', dataIndex:'license_plate' },
    { 
      key:'company_name', 
      title:'Nhà xe', 
      dataIndex:'company_name',
      render: (text) => (
        <span className={text === 'Chưa có nhà xe' ? 'text-gray-400 italic' : ''}>
          {text}
        </span>
      )
    },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Xe ở Bến"
        subtitle="Quản lý quan hệ giữa xe và bến xe"
        action={
          <Button 
            onClick={openAdd} 
            icon="+"
            disabled={stations.length === 0 || buses.length === 0}
            title={
              stations.length === 0
                ? 'Cần ít nhất 1 bến xe để thêm quan hệ'
                : buses.length === 0
                ? 'Cần ít nhất 1 xe để thêm quan hệ'
                : ''
            }
          >
            Thêm quan hệ
          </Button>
        }
      />

      <Table data={relations} columns={columns} onDelete={(id)=>remove({ id })} />

      <Modal isOpen={open} onClose={()=>setOpen(false)} title="Thêm quan hệ Xe - Bến">
        <div className="space-y-5">
          <FormInput label="Bến xe" required>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.station_id} 
              onChange={e=>setForm({...form, station_id: Number(e.target.value)})}
            >
              <option value="">-- Chọn bến xe --</option>
              {stations.map(s=> (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormInput>
          
          <FormInput label="Xe" required>
            <select 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.bus_id} 
              onChange={e=>setForm({...form, bus_id: Number(e.target.value)})}
            >
              <option value="">-- Chọn xe --</option>
              {buses.map(b=> (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormInput>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={()=>setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={save}>
              Lưu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}