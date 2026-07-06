"use client";

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer';

  const variants = {
    primary: 'bg-[#E8742D] hover:bg-[#D1631F] text-white shadow-sm hover:shadow-md',
    outline: 'border-2 border-[#E8742D] text-[#E8742D] hover:bg-[#E8742D] hover:text-white',
    ghost: 'text-[#3D2B1F] hover:bg-[#F0E0D0]',
    danger: 'bg-[#C0392B] hover:bg-[#A93226] text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-inherit hover:shadow-none' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
