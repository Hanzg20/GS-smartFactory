import React from 'react';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor, Eye } from 'lucide-react';
import { useA11y } from '../../hooks/useA11y';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(({
  showLabel = false,
  className = '',
}, forwardedRef) => {
  const { mode, setMode } = useTheme();

  // 使用可访问性钩子
  const { ref: a11yRef, a11yProps } = useA11y({
    ariaLabel: '切换主题',
    role: 'button',
  });

  // 合并ref
  const combinedRef = (element: HTMLButtonElement | null) => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      forwardedRef.current = element;
    }
    (a11yRef as React.MutableRefObject<HTMLButtonElement | null>).current = element;
  };

  const themes: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun className="w-5 h-5" />, label: '亮色主题' },
    { mode: 'dark', icon: <Moon className="w-5 h-5" />, label: '暗色主题' },
    { mode: 'system', icon: <Monitor className="w-5 h-5" />, label: '跟随系统' },
    { mode: 'high-contrast', icon: <Eye className="w-5 h-5" />, label: '高对比度' },
  ];

  const currentTheme = themes.find(theme => theme.mode === mode) || themes[0];

  return (
    <div className="relative">
      <button
        ref={combinedRef}
        className={`
          inline-flex items-center justify-center p-2
          rounded-lg transition-colors duration-200
          hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50
          ${className}
        `}
        onClick={() => {
          const currentIndex = themes.findIndex(theme => theme.mode === mode);
          const nextIndex = (currentIndex + 1) % themes.length;
          setMode(themes[nextIndex].mode);
        }}
        {...a11yProps}
      >
        <span className="sr-only">当前主题：{currentTheme.label}</span>
        {currentTheme.icon}
        {showLabel && (
          <span className="ml-2 text-sm font-medium text-slate-200">
            {currentTheme.label}
          </span>
        )}
      </button>

      {/* 键盘快捷键提示 */}
      <div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1
          bg-slate-800 text-slate-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100
          transition-opacity duration-200 pointer-events-none"
      >
        按下 Ctrl + J 切换主题
      </div>
    </div>
  );
}); 