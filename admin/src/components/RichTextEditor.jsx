import React, { useRef, useState, useEffect } from 'react'

const TOOLBAR_ACTIONS = [
  { icon: 'B', command: 'bold', label: 'Đậm' },
  { icon: 'I', command: 'italic', label: 'Nghiêng' },
  { icon: 'U', command: 'underline', label: 'Gạch chân' },
  { icon: '•', command: 'insertUnorderedList', label: 'Danh sách' },
  { icon: '1.', command: 'insertOrderedList', label: 'Danh sách số' },
]

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null)
  const [html, setHtml] = useState(value || '')

  useEffect(() => {
    setHtml(value || '')
  }, [value])

  const exec = (command) => {
    document.execCommand(command, false, null)
    handleInput()
  }

  const handleInput = () => {
    const content = editorRef.current?.innerHTML || ''
    setHtml(content)
    onChange?.(content)
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.command}
            type="button"
            className="text-sm px-2 py-1 rounded hover:bg-white border border-transparent hover:border-gray-200"
            title={action.label}
            onClick={() => exec(action.command)}
          >
            {action.icon}
          </button>
        ))}
      </div>
      <div className="relative">
        {!html && (
          <p className="absolute left-4 top-3 text-sm text-gray-400 pointer-events-none">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          className="min-h-[200px] px-4 py-3 focus:outline-none"
          contentEditable
          dangerouslySetInnerHTML={{ __html: html }}
          onInput={handleInput}
          suppressContentEditableWarning
        />
      </div>
    </div>
  )
}


