import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileHandle {
  getToken: () => string | null;
  reset: () => void;
}

interface Props {
  onExpire?: () => void;
}

const TurnstileWidget = forwardRef<TurnstileHandle, Props>(({ onExpire }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    getToken: () => tokenRef.current,
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        tokenRef.current = null;
      }
    },
  }));

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey || !containerRef.current) return;

    const render = () => {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (token: string) => {
          tokenRef.current = token;
        },
        'expired-callback': () => {
          tokenRef.current = null;
          onExpire?.();
        },
        'error-callback': () => {
          tokenRef.current = null;
        },
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onExpire]);

  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) {
    return (
      <p className="text-xs text-deep-red/80 text-center">
        Turnstile is not configured. Set VITE_TURNSTILE_SITE_KEY in your environment.
      </p>
    );
  }

  return <div ref={containerRef} className="flex justify-center min-h-[65px]" />;
});

TurnstileWidget.displayName = 'TurnstileWidget';
export default TurnstileWidget;
