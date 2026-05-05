// ─── Polyfills cho trình duyệt cũ (Huawei tablet, Chrome < 92) ───
// MUI DataGrid và các thư viện khác dùng các API ES2022+ nội bộ
if (!Array.prototype.at) {
  Array.prototype.at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}
if (!String.prototype.at) {
  String.prototype.at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}
// @ts-ignore — polyfill cho trình duyệt cũ
if (!Array.prototype.findLast) {
  // @ts-ignore
  Array.prototype.findLast = function (fn: any, thisArg?: any) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (fn.call(thisArg, this[i], i, this)) return this[i];
    }
    return undefined;
  };
}
// @ts-ignore — polyfill cho trình duyệt cũ
if (!Array.prototype.findLastIndex) {
  // @ts-ignore
  Array.prototype.findLastIndex = function (fn: any, thisArg?: any) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (fn.call(thisArg, this[i], i, this)) return i;
    }
    return -1;
  };
}
if (!(Object as any).hasOwn) {
  (Object as any).hasOwn = function (obj: any, prop: PropertyKey) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}
if (typeof structuredClone === 'undefined') {
  (window as any).structuredClone = function (val: any) {
    return JSON.parse(JSON.stringify(val));
  };
}
// ─── End Polyfills ───

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/utils/context/AuthProvider.tsx";
import { LoadingProvider } from "@/utils/context/LoadingProvider.tsx";
import { ThemeContextProvider } from './utils/context/ThemeContextProvider';
import { LocaleProvider } from '@/utils/context/LocaleProvider.tsx';
import { loadAppConfig } from '@/utils/appConfig';

const queryClient = new QueryClient()

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20, color: 'red', background: 'white', position: 'absolute', inset: 0, zIndex: 9999}}>
            <h1>Runtime Error</h1>
            <pre>{String(this.state.error?.stack || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Load runtime config (config.json) BEFORE mounting the React tree
loadAppConfig().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
          <ThemeContextProvider>
              <LoadingProvider>
                  <QueryClientProvider client={queryClient}>
                      <AuthProvider>
                          <LocaleProvider>
                              <ErrorBoundary>
                                  <App />
                              </ErrorBoundary>
                          </LocaleProvider>
                      </AuthProvider>
                  </QueryClientProvider>
              </LoadingProvider>
          </ThemeContextProvider>
      </React.StrictMode>,
  );
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}