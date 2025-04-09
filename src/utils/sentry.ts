import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        // Не отправляем ошибки в Sentry в режиме разработки
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },
    });
  }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        ...context,
        environment: process.env.NODE_ENV,
      },
    });
  }
}; 