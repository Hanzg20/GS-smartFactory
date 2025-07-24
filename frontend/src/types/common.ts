// 基础组件Props类型
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

// 尺寸类型
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 变体类型
export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

// 状态类型
export type Status = 'idle' | 'loading' | 'success' | 'error';

// 设备类型
export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  location?: string;
  ip_address?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  parameters?: Record<string, any>;
  last_maintenance?: string;
  next_maintenance?: string;
  metrics?: {
    temperature?: number;
    pressure?: number;
    speed?: number;
    runtime?: number;
    [key: string]: number | undefined;
  };
}

// 告警类型
export interface Alarm {
  id: string;
  type: 'critical' | 'error' | 'warning' | 'info';
  message: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

// 生产数据类型
export interface Production {
  id: string;
  deviceId: string;
  deviceName: string;
  productName: string;
  quantity: number;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'paused' | 'failed';
  metrics?: {
    efficiency?: number;
    quality?: number;
    [key: string]: number | undefined;
  };
}

// 用户类型
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  lastLogin?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 过滤器类型
export interface FilterParams {
  search?: string;
  status?: string;
  type?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  [key: string]: any;
}

// 主题类型
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    [key: string]: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      [key: string]: string;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      bold: number;
      [key: string]: number;
    };
  };
} 