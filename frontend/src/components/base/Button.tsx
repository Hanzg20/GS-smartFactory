import React from 'react';
import { BaseProps, Size, Variant, Status } from '../../types/common';
import { Loader2 } from 'lucide-react';
import { useA11y } from '../../hooks/useA11y';

export interface ButtonProps extends BaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  status?: Status;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  status = 'idle',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ariaLabel,
  ariaDescribedBy,
  onClick,
  ...props
}, forwardedRef) => {
  // 使用可访问性钩子
  const { ref, a11yProps } = useA11y({
    focusable: !isDisabled && !isLoading,
    ariaLabel,
    ariaDescribedBy,
    role: 'button',
  });

  // 合并ref
  const combinedRef = (element: HTMLButtonElement) => {
    // 设置forwardedRef
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      forwardedRef.current = element;
    }
    // 设置内部ref
    (ref as React.MutableRefObject<HTMLButtonElement | null>).current = element;
  };

  // 基础样式
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // 尺寸样式
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // 变体样式
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
    secondary: 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600/50 focus:ring-slate-500',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    warning: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    info: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-cyan-500'
  };

  // 状态样式
  const statusStyles = {
    idle: '',
    loading: 'cursor-wait opacity-80',
    success: 'cursor-default',
    error: 'cursor-not-allowed opacity-80'
  };

  // 禁用样式
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  // 组合所有样式
  const buttonStyles = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    statusStyles[status],
    isDisabled || isLoading ? disabledStyles : '',
    fullWidth ? 'w-full' : '',
    'rounded-lg',
    className
  ].join(' ');

  // 处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) return;
    onClick?.(event);
  };

  return (
    <button
      ref={combinedRef}
      className={buttonStyles}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      {...a11yProps}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>加载中...</span>
          <span className="sr-only">正在加载，请稍候</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2" aria-hidden="true">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2" aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}); 