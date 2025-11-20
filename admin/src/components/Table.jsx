import React from 'react'
import Button from './Button'

export default function Table({ data, columns, onEdit, onDelete, onToggleStatus, customActions }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
        <p className="text-gray-600 text-lg font-medium mb-2">Không có dữ liệu</p>
        <p className="text-gray-400 text-sm">Hãy thêm dữ liệu mới để bắt đầu</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {col.title}
                </th>
              ))}
              {(onEdit || onDelete || onToggleStatus || customActions) && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr 
                key={row.id || index} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((col) => {
                  let cellContent = row[col.dataIndex]
                  
                  // Custom render function
                  if (col.render && typeof col.render === 'function') {
                    cellContent = col.render(cellContent, row)
                  }
                  // Format status
                  else if (col.dataIndex === 'status') {
                    const statusClass = cellContent === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                    cellContent = (
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${statusClass} inline-flex items-center`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cellContent === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {cellContent}
                      </span>
                    )
                  }
                  
                  return (
                    <td 
                      key={col.key} 
                      className={`px-6 py-4 text-sm text-gray-700 ${col.dataIndex === 'image' ? '' : 'whitespace-nowrap'}`}
                    >
                      {cellContent}
                    </td>
                  )
                })}
                {(onEdit || onDelete || onToggleStatus || customActions) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      {customActions && typeof customActions === 'function' && customActions(row)}
                      {onToggleStatus && (
                        <Button
                          size="sm"
                          variant={row.status === 'ACTIVE' ? 'danger' : 'secondary'}
                          onClick={() => onToggleStatus(row)}
                        >
                          {row.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="sm"
                          onClick={() => onEdit(row)}
                        >
                          Sửa
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDelete(row.id || row)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
