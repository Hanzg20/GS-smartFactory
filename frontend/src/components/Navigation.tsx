import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: '工厂总览', icon: '🏭' },
    { path: '/bigscreen', label: '大屏监控', icon: '📊' },
    { path: '/devices', label: '设备管理', icon: '⚙️' },
    { path: '/alarms', label: '报警管理', icon: '🚨' },
    { path: '/production', label: '生产管理', icon: '🏗️' },
    { path: '/materials', label: '物料管理', icon: '📦' },
    { path: '/process', label: '工艺管理', icon: '🔧' },
    { path: '/quality', label: '质量管理', icon: '✅' },
    { path: '/environment', label: '环境监测', icon: '🌡️' },
    { path: '/personnel', label: '人员管理', icon: '👥' },
    { path: '/ai', label: 'AI分析', icon: '🤖' },
    { path: '/reports', label: '报表分析', icon: '📈' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-slate-900 border-r border-slate-700 h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* 顶部Logo区域 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-semibold">SmartFactory</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底部状态信息 */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>系统在线</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation; 