# 📊 Monitoring & Logging Guide - SSM Platform

## Overview

This guide provides comprehensive recommendations for monitoring and logging your SSM Platform, focusing on Appwrite Cloud integration, error tracking, performance monitoring, and user analytics.

---

## 1. Appwrite Console Monitoring

### Accessing Logs

1. Navigate to [Appwrite Cloud Console](https://cloud.appwrite.io/)
2. Select your project
3. Click **"Logs"** in the left sidebar

### Log Filtering

Filter logs by:
- **Service**: Database, Storage, Functions, Auth, Realtime
- **Time Range**: Last hour, 24 hours, 7 days, custom
- **Severity**: Info, Warning, Error
- **Status Code**: 200, 400, 401, 403, 404, 500, etc.

### Key Metrics to Monitor

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **API Request Count** | Total API calls per hour | >10,000/hour |
| **Error Rate** | Percentage of failed requests | >5% |
| **Response Time** | Average API response time | >500ms |
| **Storage Usage** | Total storage consumed | >80% of quota |
| **Bandwidth** | Data transfer usage | >80% of quota |
| **Active Sessions** | Concurrent user sessions | Track trends |
| **Database Queries** | Query count and performance | >1000ms avg |

### Viewing Specific Logs

**Authentication Logs:**
```
Service: Auth
Events: account.sessions.create, account.create, account.sessions.delete
```

**Database Logs:**
```
Service: Database
Events: databases.*.collections.*.documents.*.create
         databases.*.collections.*.documents.*.update
         databases.*.collections.*.documents.*.delete
```

**Storage Logs:**
```
Service: Storage
Events: buckets.*.files.*.create, buckets.*.files.*.delete
```

---

## 2. Appwrite Functions Logging

If you're using Appwrite Functions for backend logic:

### Function Logging Best Practices

```javascript
// appwrite-function/index.js
export default async ({ req, res, log, error }) => {
  // Log incoming request
  log('Function invoked', {
    method: req.method,
    path: req.path,
    userId: req.headers['x-appwrite-user-id'],
  });

  try {
    // Your business logic
    const result = await processData(req.body);
    
    log('Operation successful', {
      recordsProcessed: result.count,
      duration: result.duration,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    // Log errors with context
    error('Operation failed', {
      errorMessage: err.message,
      errorStack: err.stack,
      requestBody: req.body,
    });

    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
```

### Viewing Function Logs

1. Go to **Functions** in Appwrite Console
2. Select your function
3. Click **"Executions"** tab
4. View logs for each execution:
   - **Status**: Success, Failed, Processing
   - **Duration**: Execution time
   - **Logs**: Console output from `log()` and `error()`
   - **Response**: Function return value

### Function Monitoring Alerts

Set up alerts for:
- ❌ High failure rate (>10%)
- ⏱️ Long execution times (>5s)
- 🔥 High invocation count (potential abuse)
- 💾 Memory usage spikes

---

## 3. Client-Side Error Tracking

### Recommended Tools

#### Option 1: Sentry (Recommended)

**Installation:**
```bash
npm install @sentry/react
```

**Setup:**
```typescript
// client/src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 1.0, // 100% in dev, reduce in production
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Don't send events with passwords
      if (event.request?.data?.password) {
        delete event.request.data.password;
      }
      return event;
    },
  });
};

// Wrap your app
export const SentryErrorBoundary = Sentry.ErrorBoundary;
```

**Usage in App:**
```typescript
// client/src/main.tsx
import { initSentry, SentryErrorBoundary } from './lib/monitoring/sentry';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SentryErrorBoundary fallback={<ErrorFallback />}>
    <App />
  </SentryErrorBoundary>
);
```

**Track Custom Events:**
```typescript
import * as Sentry from '@sentry/react';

// Track user context
Sentry.setUser({
  id: user.$id,
  email: user.email,
  username: user.name,
});

// Track custom errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'post_creation' },
    extra: { postData },
  });
}
```

#### Option 2: LogRocket

**Installation:**
```bash
npm install logrocket
```

**Setup:**
```typescript
// client/src/lib/monitoring/logrocket.ts
import LogRocket from 'logrocket';

export const initLogRocket = () => {
  LogRocket.init('your-app-id/your-project');
  
  // Identify users
  LogRocket.identify(user.$id, {
    name: user.name,
    email: user.email,
  });
  
  // Sanitize sensitive data
  LogRocket.redactTextContent('.password-input');
};
```

**Benefits:**
- 🎥 Session replay with DOM snapshots
- 📊 Performance monitoring
- 🐛 Console logs and network requests
- 🔍 Redux/state inspection

---

## 4. Custom Logging Service

Create a centralized logging utility:

```typescript
// client/src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  userId?: string;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private userId?: string;

  setUser(userId: string) {
    this.userId = userId;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      userId: this.userId,
    };

    // Console output in development
    if (this.isDev) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data);
    }

    // Send to external service in production
    if (!this.isDev && level === 'error') {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, custom endpoint)
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fail silently to avoid infinite loops
      console.error('Failed to send log:', error);
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error: any, data?: any) {
    this.log('error', message, {
      ...data,
      errorMessage: error?.message,
      errorStack: error?.stack,
    });
  }
}

export const logger = new Logger();
```

**Usage:**
```typescript
// In your hooks/services
import { logger } from '@/lib/logger';

try {
  const result = await createPost(data);
  logger.info('Post created successfully', { postId: result.$id });
} catch (error) {
  logger.error('Failed to create post', error, { data });
  throw error;
}
```

---

## 5. Performance Monitoring

### Track API Response Times

```typescript
// client/src/lib/performance.ts
export const measureApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - start;
    
    // Log performance
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'api_performance', {
        event_category: 'API',
        event_label: name,
        value: Math.round(duration),
      });
    }
    
    // Alert on slow requests
    if (duration > 3000) {
      logger.warn(`Slow API call: ${name}`, { duration });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`API call failed: ${name}`, error, { duration });
    throw error;
  }
};
```

**Usage:**
```typescript
const posts = await measureApiCall('fetchPosts', () =>
  databases.listDocuments(databaseId, postsCollectionId)
);
```

### Web Vitals Monitoring

```typescript
// client/src/lib/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export const initWebVitals = () => {
  onCLS(console.log); // Cumulative Layout Shift
  onFID(console.log); // First Input Delay
  onLCP(console.log); // Largest Contentful Paint
  onFCP(console.log); // First Contentful Paint
  onTTFB(console.log); // Time to First Byte
};
```

---

## 6. User Analytics

### Track User Actions

```typescript
// client/src/lib/analytics.ts
type EventName =
  | 'user_signup'
  | 'user_login'
  | 'post_created'
  | 'post_liked'
  | 'message_sent'
  | 'connection_requested'
  | 'project_created';

interface EventProperties {
  [key: string]: string | number | boolean;
}

export const trackEvent = (
  eventName: EventName,
  properties?: EventProperties
) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Custom analytics endpoint
  if (import.meta.env.PROD) {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Fail silently
    });
  }

  // Console in development
  if (import.meta.env.DEV) {
    console.log(`[ANALYTICS] ${eventName}`, properties);
  }
};
```

**Usage:**
```typescript
// Track user actions
trackEvent('post_created', {
  postType: 'skill_offer',
  hasImage: !!imageUrl,
  tagCount: tags.length,
});

trackEvent('message_sent', {
  conversationId,
  messageLength: content.length,
});

trackEvent('user_login', {
  method: 'email',
});
```

---

## 7. Alerting & Notifications

### Set Up Alerts

**Appwrite Console Alerts:**
- Navigate to **Settings** → **Alerts**
- Configure email notifications for:
  - High error rates
  - Storage quota exceeded
  - Bandwidth quota exceeded
  - Unusual traffic patterns

**Custom Alerts (via Slack/Discord):**

```typescript
// server/lib/alerts.ts
export const sendAlert = async (message: string, severity: 'info' | 'warning' | 'critical') => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  const color = severity === 'critical' ? 'danger' :
                severity === 'warning' ? 'warning' : 'good';
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color,
        title: `[${severity.toUpperCase()}] SSM Platform Alert`,
        text: message,
        ts: Math.floor(Date.now() / 1000),
      }],
    }),
  });
};
```

**Usage:**
```typescript
if (errorRate > 0.1) {
  await sendAlert(
    `Error rate exceeded 10%: ${(errorRate * 100).toFixed(2)}%`,
    'critical'
  );
}
```

---

## 8. Dashboard Recommendations

### Recommended Monitoring Dashboard

Create a custom dashboard using:
- **Grafana** + **Prometheus** (self-hosted)
- **Datadog** (SaaS)
- **New Relic** (SaaS)

**Key Metrics to Display:**
1. **User Metrics**
   - Active users (daily/weekly/monthly)
   - New signups
   - Session duration

2. **Application Metrics**
   - API response times (p50, p95, p99)
   - Error rates by endpoint
   - Request throughput

3. **Business Metrics**
   - Posts created per day
   - Messages sent per day
   - Connection requests
   - Project collaborations

4. **Infrastructure Metrics**
   - Appwrite API quota usage
   - Storage usage trends
   - Bandwidth consumption

---

## 9. Best Practices

### ✅ Do's

- ✅ Log all errors with context
- ✅ Track user actions for analytics
- ✅ Monitor API performance
- ✅ Set up alerts for critical issues
- ✅ Use structured logging (JSON format)
- ✅ Sanitize sensitive data before logging
- ✅ Implement log rotation and retention policies

### ❌ Don'ts

- ❌ Log passwords or sensitive data
- ❌ Log excessively in production (performance impact)
- ❌ Ignore error logs
- ❌ Hardcode API keys in logging code
- ❌ Send all logs to external services (cost)

---

## 10. Quick Reference

### Environment Variables

```env
# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_LOGROCKET_APP_ID=your-logrocket-id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

### Useful Commands

```bash
# View Appwrite logs (if self-hosted)
docker logs appwrite-api

# Check function logs
appwrite functions listExecutions --functionId=your-function-id

# Monitor real-time logs
tail -f /var/log/appwrite/api.log
```

---

## Summary

Implementing comprehensive monitoring and logging will help you:
- 🐛 **Debug issues faster** with detailed error logs
- 📊 **Understand user behavior** with analytics
- ⚡ **Optimize performance** by tracking slow operations
- 🚨 **Respond to incidents** with real-time alerts
- 📈 **Make data-driven decisions** with usage metrics

Start with Appwrite Console monitoring, then gradually add client-side error tracking (Sentry) and custom analytics as your application grows.
