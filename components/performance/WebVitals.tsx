import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }

  // Send to Google Analytics if available
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      }).catch((error) => {
        console.warn('Failed to send web vitals:', error);
      });
    } catch (error) {
      console.warn('Web vitals reporting error:', error);
    }
  }
}

export default function WebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then((webVitals) => {
        if (webVitals.onCLS) webVitals.onCLS(reportWebVitals);
        if (webVitals.onFID) webVitals.onFID(reportWebVitals);
        if (webVitals.onFCP) webVitals.onFCP(reportWebVitals);
        if (webVitals.onLCP) webVitals.onLCP(reportWebVitals);
        if (webVitals.onTTFB) webVitals.onTTFB(reportWebVitals);
        if (webVitals.onINP) webVitals.onINP(reportWebVitals); // New metric replacing FID
      });
    }
  }, []);

  return null;
} 