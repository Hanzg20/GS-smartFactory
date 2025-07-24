import { useState, useEffect } from 'react';

// 断点定义
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// 获取当前断点
const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'lg';

  const width = window.innerWidth;

  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getCurrentBreakpoint());
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : breakpoints.lg
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    width,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isLargeScreen: breakpoint === 'xl' || breakpoint === '2xl',
    // 断点检查工具
    smallerThan: (bp: Breakpoint) => width < breakpoints[bp],
    largerThan: (bp: Breakpoint) => width >= breakpoints[bp],
    between: (min: Breakpoint, max: Breakpoint) =>
      width >= breakpoints[min] && width < breakpoints[max],
  };
}; 