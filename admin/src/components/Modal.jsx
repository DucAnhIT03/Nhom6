import React, { useEffect } from 'react'

export default function Modal({ isOpen, title='Modal', children, onClose, size = 'medium' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-6xl',
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto mx-4 transform transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center rounded-t-lg">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
        
        {/* Content */}
        <div className={`${size === 'small' ? 'p-4' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
