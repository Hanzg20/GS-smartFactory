import { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';

interface UseA11yOptions {
  focusable?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

export const useA11y = ({
  focusable = true,
  ariaLabel,
  ariaDescribedBy,
  role,
  tabIndex = 0
}: UseA11yOptions = {}) => {
  const ref = useRef<HTMLElement>(null);

  // 处理键盘导航
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!ref.current) return;

    // 处理Enter键
    if (event.key === 'Enter') {
      ref.current.click();
    }

    // 处理空格键
    if (event.key === ' ') {
      event.preventDefault();
      ref.current.click();
    }

    // 处理Escape键
    if (event.key === 'Escape') {
      ref.current.blur();
    }
  }, []);

  // 设置焦点管理
  useEffect(() => {
    const element = ref.current;
    if (!element || !focusable) return;

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [focusable, handleKeyDown]);

  // 返回可访问性属性
  return {
    ref,
    a11yProps: {
      role,
      tabIndex: focusable ? tabIndex : -1,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
    },
  };
};

// 焦点管理工具
export const useFocusTrap = () => {
  const ref = useRef<HTMLElement>(null);

  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // 处理Tab键
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('keydown', handleFocusTrap);
    return () => element.removeEventListener('keydown', handleFocusTrap);
  }, [handleFocusTrap]);

  return ref;
};

// 快捷键管理工具
export const useHotkeys = (hotkeys: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查修饰键
      const hasCtrl = event.ctrlKey || event.metaKey;
      const hasShift = event.shiftKey;
      const hasAlt = event.altKey;

      // 构建快捷键字符串
      const hotkeyString = [
        hasCtrl && 'Ctrl',
        hasShift && 'Shift',
        hasAlt && 'Alt',
        event.key.toUpperCase(),
      ]
        .filter(Boolean)
        .join('+');

      // 执行对应的处理函数
      const handler = hotkeys[hotkeyString];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys]);
};

// 高对比度模式工具
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(
    localStorage.getItem('highContrast') === 'true'
  );

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => {
      const newValue = !prev;
      localStorage.setItem('highContrast', String(newValue));
      return newValue;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', isHighContrast);
  }, [isHighContrast]);

  return {
    isHighContrast,
    toggleHighContrast,
  };
};

// 屏幕阅读器通知工具
export const useAnnounce = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  return {
    announcement,
    announce,
    announceProps: {
      'aria-live': 'polite',
      'aria-atomic': true,
      className: 'sr-only',
    },
  };
}; 