import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineDetector } from './components/OfflineDetector';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import Layout from './components/Layout';
import FactoryOverview from './components/FactoryOverview';
import BigScreenDashboard from './components/BigScreenDashboard';
import { DevicePage } from './components/DevicePage';
import AlarmPage from './components/AlarmPage';
import ProductionPage from './components/ProductionPage';
import MaterialPage from './components/MaterialPage';
import ProcessPage from './components/ProcessPage';
import QualityPage from './components/QualityPage';
import EnvironmentPage from './components/EnvironmentPage';
import PersonnelPage from './components/PersonnelPage';
import AIPage from './components/AIPage';
import ReportsPage from './components/ReportsPage';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// 错误边界包装组件
const ErrorFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">出现了错误</h1>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        刷新页面
      </button>
    </div>
  </div>
);

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />
  },
  {
    path: '/register',
    element: <RegisterForm onClose={() => {}} />
  },
  {
    path: '/bigscreen',
    element: <ProtectedRoute><BigScreenDashboard fullScreen={true} /></ProtectedRoute>
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
    children: [
      {
        path: '',
        element: <FactoryOverview />
      },
      {
        path: 'dashboard',
        element: <BigScreenDashboard fullScreen={false} />
      },
      {
        path: 'devices/*',
        element: <DevicePage />
      },
      {
        path: 'alarms/*',
        element: <AlarmPage />
      },
      {
        path: 'production/*',
        element: <ProductionPage />
      },
      {
        path: 'materials',
        element: <MaterialPage />
      },
      {
        path: 'process',
        element: <ProcessPage />
      },
      {
        path: 'quality',
        element: <QualityPage />
      },
      {
        path: 'environment',
        element: <EnvironmentPage />
      },
      {
        path: 'personnel',
        element: <PersonnelPage />
      },
      {
        path: 'ai/*',
        element: <AIPage />
      },
      {
        path: 'reports/*',
        element: <ReportsPage />
      }
    ]
  }
]);

// 应用内容组件
const AppContent: React.FC = () => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <OfflineDetector>
        <RouterProvider router={router} />
      </OfflineDetector>
    </ErrorBoundary>
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App; 