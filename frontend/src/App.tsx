import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/auth-store';
import { auth } from './lib/supabase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineDetector } from './components/OfflineDetector';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ThemeToggle } from './components/base/ThemeToggle';
import { useHotkeys } from './hooks/useA11y';
import './index.css';

// 懒加载组件
const LoginForm = React.lazy(() => import('./components/LoginForm'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const DevicePage = React.lazy(() => import('./components/DevicePage'));
const AlarmPage = React.lazy(() => import('./components/AlarmPage'));
const ProductionPage = React.lazy(() => import('./components/ProductionPage'));
const AIPage = React.lazy(() => import('./components/AIPage'));
const ReportsPage = React.lazy(() => import('./components/ReportsPage'));

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
          <div className="mt-4 text-center">
            <div className="text-blue-400 font-mono text-sm">SmartFactory Studio</div>
            <div className="text-slate-500 text-xs mt-1">正在加载系统...</div>
          </div>
        </div>
      </div>
    );
  }
 
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { toggleMode } = useTheme();

  // 注册主题切换快捷键
  useHotkeys({
    'Ctrl+J': toggleMode,
  });

  return (
    <ErrorBoundary>
      <OfflineDetector>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
          {/* 主题切换按钮 */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle showLabel />
          </div>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/devices/*"
              element={
                <ProtectedRoute>
                  <DevicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alarms/*"
              element={
                <ProtectedRoute>
                  <AlarmPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production/*"
              element={
                <ProtectedRoute>
                  <ProductionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai/*"
              element={
                <ProtectedRoute>
                  <AIPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/*"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </OfflineDetector>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App; 