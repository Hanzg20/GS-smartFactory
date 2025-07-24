import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ErrorState {
  error: Error | null;
  isError: boolean;
}

interface UseErrorHandlerOptions {
  fallbackMessage?: string;
  showToast?: boolean;
  maxRetries?: number;
}

export function useErrorHandler<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: UseErrorHandlerOptions = {}
) {
  const {
    fallbackMessage = '操作失败，请重试',
    showToast = true,
    maxRetries = 3
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false
  });
  const [retryCount, setRetryCount] = useState(0);

  const reset = useCallback(() => {
    setErrorState({ error: null, isError: false });
    setRetryCount(0);
  }, []);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      try {
        const result = await asyncFn(...args);
        reset();
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setErrorState({ error: errorObj, isError: true });
        
        if (showToast) {
          toast.error(errorObj.message || fallbackMessage);
        }

        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          // 指数退避重试
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return execute(...args);
        }

        throw errorObj;
      }
    },
    [asyncFn, fallbackMessage, showToast, retryCount, maxRetries, reset]
  );

  const retry = useCallback(
    async (...args: Parameters<T>) => {
      setRetryCount(0);
      return execute(...args);
    },
    [execute]
  );

  return {
    execute,
    retry,
    reset,
    ...errorState,
    retryCount
  };
} 