import { useEffect } from 'react';

const ANALYTICS_MEASUREMENT_ID = 'G-NTC960VCPK';
const ANALYTICS_SCRIPT_ID = 'google-analytics-script';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

export const AnalyticsProvider = () => {
  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    let timeoutId: number | null = null;

    const removeInteractionListeners = () => {
      window.removeEventListener('pointerdown', loadOnInteraction);
      window.removeEventListener('keydown', loadOnInteraction);
      window.removeEventListener('touchstart', loadOnInteraction);
    };

    const loadAnalytics = () => {
      window.removeEventListener('load', scheduleAnalyticsLoad);

      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (document.getElementById(ANALYTICS_SCRIPT_ID) != null) {
        removeInteractionListeners();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.id = ANALYTICS_SCRIPT_ID;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer ?? [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', ANALYTICS_MEASUREMENT_ID);

      removeInteractionListeners();
    };

    const scheduleAnalyticsLoad = () => {
      timeoutId = window.setTimeout(loadAnalytics, 1500);
    };

    const loadOnInteraction = () => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      loadAnalytics();
    };

    window.addEventListener('pointerdown', loadOnInteraction, {
      passive: true,
    });
    window.addEventListener('keydown', loadOnInteraction);
    window.addEventListener('touchstart', loadOnInteraction, {
      passive: true,
    });

    if (document.readyState === 'complete') {
      scheduleAnalyticsLoad();
    } else {
      window.addEventListener('load', scheduleAnalyticsLoad, { once: true });
    }

    return () => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }

      removeInteractionListeners();
      window.removeEventListener('load', scheduleAnalyticsLoad);
    };
  }, []);

  return null;
};
