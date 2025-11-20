import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { getPosts, addPost, updatePost, deletePost } from '../../services/postService'
import { uploadImage } from '../../services/uploadService'

const isContentEmpty = (html) => {
  if (!html) return true
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return text.length === 0
}

function uploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => ({
    async upload() {
      const file = await loader.file
      const url = await uploadImage(file, 'posts')
      return { default: url }
    },
    abort() {},
  })
}

export default function Posts(){
  const [posts, setPosts] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title:'', content:'', image_url:'', status: 'PUBLISHED' })

  const fetch = async ()=> setPosts(await getPosts())
  useEffect(()=>{ fetch() }, [])

  const openAdd = ()=>{ setEditing(null); setForm({ title:'', content:'', image_url:'', status: 'PUBLISHED' }); setOpen(true) }
  const openEdit = (row)=>{ setEditing(row); setForm({ title: row.title, content: row.content, image_url: row.image_url, status: row.status || 'PUBLISHED' }); setOpen(true) }

  const save = async ()=>{
    if (!form.title || !form.title.trim()) return alert('Tiêu đề bắt buộc')
    if (isContentEmpty(form.content)) return alert('Nội dung không được trống')

    if (editing) {
      await updatePost({ id: editing.id, ...form })
    } else {
      await addPost(form)
    }
    setOpen(false); fetch()
  }

  const remove = async (id)=>{ if(!confirm('Xác nhận xóa?')) return; await deletePost(id); fetch() }

  const columns = [
    { key: 'id', title: 'ID', dataIndex: 'id' },
    { key: 'title', title: 'Tiêu đề', dataIndex: 'title' },
    { key: 'status', title: 'Trạng thái', dataIndex: 'status', render: (value) => value === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp' },
    { key: 'created_at', title: 'Ngày tạo', dataIndex: 'created_at' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Header 
        title="Quản lý Bài viết"
        subtitle="Quản lý các bài viết và tin tức"
        action={
          <Button onClick={openAdd} icon="+">
            Thêm bài viết
          </Button>
        }
      />

      <Table data={posts} columns={columns} onEdit={openEdit} onDelete={remove} />

      <Modal isOpen={open} onClose={()=>setOpen(false)} title={editing ? 'Sửa bài viết' : 'Thêm bài viết mới'}>
        <div className="space-y-5">
          <FormInput label="Tiêu đề" required>
            <input 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              placeholder="Nhập tiêu đề bài viết" 
              value={form.title} 
              onChange={e=>setForm({...form, title:e.target.value})} 
            />
          </FormInput>
          
          <FormInput label="Nội dung" required>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <CKEditor
                editor={ClassicEditor}
                data={form.content}
                config={{
                  extraPlugins: [uploadAdapterPlugin],
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'link',
                    'bulletedList',
                    'numberedList',
                    'blockQuote',
                    'imageUpload',
                    '|',
                    'undo',
                    'redo',
                  ],
                }}
                onChange={(_, editor) => {
                  const data = editor.getData()
                  setForm({ ...form, content: data })
                }}
              />
            </div>
          </FormInput>
          
          <FormInput label="Trạng thái">
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              value={form.status}
              onChange={(e)=>setForm({...form, status: e.target.value})}
            >
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Nháp</option>
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