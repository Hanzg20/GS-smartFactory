import React, { forwardRef } from 'react';
import { BaseProps, Size, Status } from '../../types/common';
import { useA11y } from '../../hooks/useA11y';

export interface InputProps extends BaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size;
  status?: Status;
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  status = 'idle',
  error,
  label,
  helperText,
  leftIcon,
  rightIcon,
  isFullWidth = false,
  className = '',
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  hideLabel = false,
  id,
  ...props
}, forwardedRef) => {
  // 生成唯一ID
  const uniqueId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${uniqueId}-error`;
  const helperId = `${uniqueId}-helper`;

  // 使用可访问性钩子
  const { ref, a11yProps } = useA11y({
    focusable: !disabled,
    ariaLabel: ariaLabel || label,
    ariaDescribedBy: [
      ariaDescribedBy,
      error ? errorId : undefined,
      helperText ? helperId : undefined,
    ].filter(Boolean).join(' ') || undefined,
  });

  // 合并ref
  const combinedRef = (element: HTMLInputElement) => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      forwardedRef.current = element;
    }
    (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
  };

  // 基础样式
  const baseStyles = 'tech-input transition-all duration-300 focus:outline-none focus:ring-2';

  // 尺寸样式
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl'
  };

  // 状态样式
  const statusStyles = {
    idle: 'focus:ring-blue-500/50',
    loading: 'animate-pulse focus:ring-blue-500/50',
    success: 'border-green-500 focus:ring-green-500/50',
    error: 'border-red-500 focus:ring-red-500/50'
  };

  // 禁用样式
  const disabledStyles = 'opacity-50 cursor-not-allowed bg-slate-800/30';

  // 组合所有样式
  const inputStyles = [
    baseStyles,
    sizeStyles[size],
    statusStyles[error ? 'error' : status],
    disabled ? disabledStyles : '',
    isFullWidth ? 'w-full' : '',
    'rounded-lg',
    className
  ].join(' ');

  const containerStyles = [
    'relative',
    isFullWidth ? 'w-full' : 'inline-block'
  ].join(' ');

  return (
    <div className={containerStyles}>
      {label && (
        <label
          htmlFor={uniqueId}
          className={`block text-sm font-medium text-slate-300 mb-1 ${
            hideLabel ? 'sr-only' : ''
          }`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            {leftIcon}
          </div>
        )}
        
        <input
          ref={combinedRef}
          id={uniqueId}
          className={`
            ${inputStyles}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
          disabled={disabled || status === 'loading'}
          aria-invalid={error ? 'true' : 'false'}
          {...a11yProps}
          {...props}
        />
        
        {rightIcon && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            {rightIcon}
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* 帮助文本 */}
      {helperText && !error && (
        <p
          id={helperId}
          className="mt-1 text-sm text-slate-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}); 