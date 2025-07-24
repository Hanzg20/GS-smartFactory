import React, { useRef } from 'react';
import { BaseProps, Variant } from '../../types/common';
import { useA11y } from '../../hooks/useA11y';

export interface CardProps extends BaseProps {
  children?: React.ReactNode;
  variant?: Variant;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  isHoverable?: boolean;
  isClickable?: boolean;
  noPadding?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'primary',
  title,
  subtitle,
  actions,
  footer,
  isHoverable = false,
  isClickable = false,
  noPadding = false,
  className = '',
  onClick,
  ariaLabel,
  ariaDescribedBy,
  role = 'region',
  ...props
}, forwardedRef) => {
  // 使用可访问性钩子
  const { ref: a11yRef, a11yProps } = useA11y({
    focusable: isClickable,
    ariaLabel: ariaLabel || (typeof title === 'string' ? title : undefined),
    ariaDescribedBy,
    role: isClickable ? 'button' : role,
  });

  // 合并ref
  const combinedRef = (element: HTMLDivElement | null) => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      forwardedRef.current = element;
    }
    (a11yRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
  };

  // 基础样式
  const baseStyles = 'tech-card backdrop-blur-sm shadow-2xl';

  // 变体样式
  const variantStyles = {
    primary: 'bg-slate-800/50 border-slate-700/50',
    secondary: 'bg-slate-700/50 border-slate-600/50',
    success: 'bg-green-900/20 border-green-700/30',
    danger: 'bg-red-900/20 border-red-700/30',
    warning: 'bg-yellow-900/20 border-yellow-700/30',
    info: 'bg-blue-900/20 border-blue-700/30'
  };

  // 交互样式
  const interactionStyles = [
    isHoverable && 'tech-card-hover',
    isClickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
  ].filter(Boolean).join(' ');

  // 组合所有样式
  const cardStyles = [
    baseStyles,
    variantStyles[variant],
    interactionStyles,
    className
  ].join(' ');

  // 处理键盘事件
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isClickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  // 移除重复的tabIndex
  const { tabIndex, ...restA11yProps } = a11yProps;

  return (
    <div
      ref={combinedRef}
      className={cardStyles}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : undefined}
      {...restA11yProps}
      {...props}
    >
      {/* 卡片头部 */}
      {(title || subtitle || actions) && (
        <div className={`flex items-start justify-between ${!noPadding ? 'p-6 pb-0' : ''}`}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-200">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* 卡片内容 */}
      <div className={!noPadding ? 'p-6' : ''}>
        {children}
      </div>

      {/* 卡片底部 */}
      {footer && (
        <div
          className={`border-t border-slate-700/50 ${!noPadding ? 'px-6 py-4' : ''}`}
          aria-label="卡片底部"
        >
          {footer}
        </div>
      )}
    </div>
  );
}); 