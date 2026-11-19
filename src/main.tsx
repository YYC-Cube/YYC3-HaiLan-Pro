import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'
import { assertEnvReady, describeEnvStatus } from './config/env'

// Global error capture
window.onerror = function(message, source, lineno, colno, error) {
  console.error('[Global Error]', { message, source, lineno, colno, error });
};

window.onunhandledrejection = function(event) {
  console.error('[Unhandled Rejection]', event.reason);
};

// 启动期环境自检：凭证缺失时明确提示并安全降级（不静默失败、不白屏）
assertEnvReady();
console.info('[Env] 状态快照 ·', describeEnvStatus());

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Fatal: Root element not found');
} else {
  ReactDOM.createRoot(rootElement).render(
    <App />
  )
}
