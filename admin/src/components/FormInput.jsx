import React from 'react'

const baseFieldClass =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'

export default function FormInput({
  label,
  required,
  error,
  children,
  type = 'text',
  value,
  onChange,
  placeholder,
  options = [],
  min,
  max,
  step,
  disabled,
  checked,
  rows = 4,
  className = '',
  id,
  ...rest
}) {
  const renderField = () => {
    if (children) return children

    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          className={`${baseFieldClass} resize-none ${className}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          {...rest}
        />
      )
    }

    if (type === 'select') {
      return (
        <select
          id={id}
          className={`${baseFieldClass} ${className}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...rest}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    if (type === 'checkbox') {
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...rest}
          />
          {placeholder && <span className="text-sm text-gray-600">{placeholder}</span>}
        </div>
      )
    }

    return (
      <input
        id={id}
        type={type}
        className={`${baseFieldClass} ${className}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        {...rest}
      />
    )
  }

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
