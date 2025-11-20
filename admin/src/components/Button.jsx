import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, outline, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  icon: Icon, // Pass an icon component or string like "+"
  className = '',
  ...props
}) => {
  const baseStyles = "font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center";
  let variantStyles = '';
  let sizeStyles = '';
  let iconSize = '1em'; // Default icon size

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-blue-500';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-sm hover:shadow-md focus:ring-gray-400';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus:ring-red-500';
      break;
    case 'outline':
      variantStyles = 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500';
      break;
    case 'ghost':
      variantStyles = 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500';
      break;
    default:
      variantStyles = 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-blue-500';
  }

  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-xs rounded-md';
      iconSize = '0.8em';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-lg rounded-lg';
      iconSize = '1.2em';
      break;
    case 'md':
    default:
      sizeStyles = 'px-5 py-2.5 text-sm rounded-lg';
      iconSize = '1em';
      break;
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const iconSpacing = children && Icon ? 'mr-2' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {Icon && (typeof Icon === 'string' ? <span className={`${iconSpacing} text-${iconSize}`}>{Icon}</span> : <Icon className={`${iconSpacing}`} size={iconSize} />)}
      {children}
    </button>
  );
};

export default Button;
