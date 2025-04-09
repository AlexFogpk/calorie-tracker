import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Use Vite env variables for DSN and environment mode
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV_MODE = import.meta.env.MODE;

export const initSentry = () => {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0, // Adjust in production if needed
      environment: ENV_MODE, 
      beforeSend(event) {
        // Don't send errors to Sentry in development mode
        if (ENV_MODE === 'development') {
          console.log('Sentry event captured (dev mode - not sent):', event);
          return null;
        }
        return event;
      },
    });
    console.log('Sentry initialized for environment:', ENV_MODE);
  } else {
    console.warn('Sentry DSN not found. Sentry will not be initialized.');
  }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  if (SENTRY_DSN && ENV_MODE !== 'development') { 
    Sentry.captureException(error, {
      // Pass the context directly if it conforms to Sentry's expected structure
      // Or just pass the extra data if needed
      extra: context, // Pass additional context as extra data
      // contexts: { 
      //   ...context, // Might cause type issues if context keys don't match Sentry expectations
      //   // environment: ENV_MODE, // Environment is already set in init
      // },
    });
  } else if (ENV_MODE === 'development') {
    console.error('Simulated Sentry capture (dev mode):', error, context);
  }
}; 