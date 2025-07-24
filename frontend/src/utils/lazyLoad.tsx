import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorComponent?: React.ComponentType<{ error: Error }>;
}

const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const DefaultErrorComponent: React.FC<{ error: Error }> = ({ error }) => (
  <div className="tech-card p-6 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
      <span className="text-red-500 text-2xl">!</span>
    </div>
    <h3 className="text-xl font-semibold text-red-500 mb-2">
      组件加载失败
    </h3>
    <p className="text-slate-400 mb-4">
      {error.message || '加载组件时发生错误'}
    </p>
    <button
      onClick={() => window.location.reload()}
      className="btn-primary"
    >
      重试
    </button>
  </div>
);

export function lazyLoad(
  factory: () => Promise<{ default: React.ComponentType<any> }>,
  options: LazyLoadOptions = {}
) {
  const {
    fallback = <DefaultLoadingComponent />,
    errorComponent: ErrorComponent = DefaultErrorComponent,
  } = options;

  const LazyComponent = React.lazy(factory);

  return function WithLazyLoad(props: any) {
    return (
      <Suspense fallback={fallback}>
        <ErrorBoundary ErrorComponent={ErrorComponent}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
}

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; ErrorComponent: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; ErrorComponent: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { ErrorComponent } = this.props;
      return <ErrorComponent error={this.state.error} />;
    }

    return this.props.children;
  }
} 