// Use Vite env variables (import.meta.env)
const isDev = import.meta.env.MODE === 'development';

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, error || '');
    }
    // Optionally send non-dev errors to Sentry here
    // captureError(new Error(message), { extra: data });
  },
  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  debug: (message: string, data?: any) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}; 