import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface OfflineDetectorProps {
  children: React.ReactNode;
  onOffline?: () => void;
  onOnline?: () => void;
}

export const OfflineDetector: React.FC<OfflineDetectorProps> = ({
  children,
  onOffline,
  onOnline
}) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowBanner(false);
      onOnline?.();
      toast.success('网络已恢复');
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
      onOffline?.();
      toast.error('网络连接已断开');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);

  const handleRetry = () => {
    // 尝试重新连接
    if ('onLine' in navigator && navigator.onLine) {
      setIsOffline(false);
      setShowBanner(false);
      onOnline?.();
      toast.success('网络已恢复');
    } else {
      toast.error('网络仍然离线');
    }
  };

  return (
    <>
      {showBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 p-4 ${
            isOffline ? 'bg-red-500/10' : 'bg-green-500/10'
          } backdrop-blur-sm`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isOffline ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <Wifi className="w-5 h-5 text-green-500" />
              )}
              <span className={isOffline ? 'text-red-500' : 'text-green-500'}>
                {isOffline ? '网络连接已断开' : '网络已恢复'}
              </span>
            </div>
            {isOffline && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-3 py-1 rounded-md bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </button>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
}; 