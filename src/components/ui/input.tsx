"use client";

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#3D2B1F] mb-1.5">{label}</label>}
      <input
        className={`input-field ${error ? 'border-[#C0392B]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[#C0392B] text-xs mt-1">{error}</p>}
    </div>
  );
}
