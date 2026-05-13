import React from 'react';
import { cn } from '../../lib/utils';

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#3498db] text-white hover:bg-blue-600 shadow-lg shadow-blue-200',
    secondary: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
