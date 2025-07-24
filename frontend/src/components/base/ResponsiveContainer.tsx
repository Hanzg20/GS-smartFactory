import React from 'react';
import { useBreakpoint, Breakpoint } from '../../hooks/useBreakpoint';
import { BaseProps } from '../../types/common';

interface ResponsiveContainerProps extends BaseProps {
  children: React.ReactNode;
  hideOn?: Breakpoint[];
  showOn?: Breakpoint[];
  as?: keyof JSX.IntrinsicElements;
  maxWidth?: Breakpoint;
  padding?: boolean;
  center?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  hideOn = [],
  showOn = [],
  as: Component = 'div',
  maxWidth,
  padding = true,
  center = true,
  className = '',
  ...props
}) => {
  const { breakpoint } = useBreakpoint();

  // 检查是否应该隐藏
  if (hideOn.includes(breakpoint)) {
    return null;
  }

  // 检查是否应该显示
  if (showOn.length > 0 && !showOn.includes(breakpoint)) {
    return null;
  }

  // 最大宽度类
  const maxWidthClass = maxWidth
    ? {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        xs: 'max-w-full',
      }[maxWidth]
    : '';

  // 组合类名
  const containerClasses = [
    padding && 'px-4 sm:px-6 lg:px-8',
    center && 'mx-auto',
    maxWidthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={containerClasses} {...props}>
      {children}
    </Component>
  );
};

// 响应式网格组件
interface ResponsiveGridProps extends BaseProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
  rowGap?: number;
  colGap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    '2xl': 4,
  },
  gap = 6,
  rowGap,
  colGap,
  className = '',
  ...props
}) => {
  // 构建网格列类名
  const gridColsClasses = Object.entries(cols)
    .map(([breakpoint, count]) => {
      if (breakpoint === 'xs') {
        return `grid-cols-${count}`;
      }
      return `${breakpoint}:grid-cols-${count}`;
    })
    .join(' ');

  // 构建间距类名
  const gapClasses = rowGap || colGap
    ? `gap-x-${colGap || gap} gap-y-${rowGap || gap}`
    : `gap-${gap}`;

  // 组合类名
  const gridClasses = [
    'grid',
    gridColsClasses,
    gapClasses,
    className,
  ].join(' ');

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

// 响应式堆栈组件
interface ResponsiveStackProps extends BaseProps {
  children: React.ReactNode;
  direction?: {
    xs?: 'row' | 'column';
    sm?: 'row' | 'column';
    md?: 'row' | 'column';
    lg?: 'row' | 'column';
    xl?: 'row' | 'column';
    '2xl'?: 'row' | 'column';
  };
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = {
    xs: 'column',
    sm: 'row',
  },
  spacing = 4,
  align = 'start',
  justify = 'start',
  wrap = false,
  className = '',
  ...props
}) => {
  // 构建方向类名
  const directionClasses = Object.entries(direction)
    .map(([breakpoint, dir]) => {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      return `${prefix}flex-${dir}`;
    })
    .join(' ');

  // 构建对齐和间距类名
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const spacingClass = `space-${direction.xs === 'column' ? 'y' : 'x'}-${spacing}`;
  const wrapClass = wrap ? 'flex-wrap' : '';

  // 组合类名
  const stackClasses = [
    'flex',
    directionClasses,
    alignClass,
    justifyClass,
    spacingClass,
    wrapClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  );
}; 