import { useEffect, useRef, useState } from 'react';

import './RecaptchaCheckbox.css';

type RecaptchaParameters = {
  sitekey: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
};

type GrecaptchaApi = {
  render: (
    container: HTMLElement,
    parameters: RecaptchaParameters,
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
  }
}

let loaderPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-portal-recaptcha="true"]',
    );

    if (existing) {
      const wait = window.setInterval(() => {
        if (window.grecaptcha) {
          window.clearInterval(wait);
          resolve();
        }
      }, 50);

      window.setTimeout(() => {
        window.clearInterval(wait);

        if (!window.grecaptcha) {
          loaderPromise = null;
          reject(new Error('Tempo limite ao carregar o reCAPTCHA.'));
        }
      }, 10000);

      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://www.google.com/recaptcha/api.js?render=explicit&hl=pt-BR';
    script.async = true;
    script.defer = true;
    script.dataset.portalRecaptcha = 'true';

    script.onload = () => {
      const wait = window.setInterval(() => {
        if (window.grecaptcha) {
          window.clearInterval(wait);
          resolve();
        }
      }, 40);

      window.setTimeout(() => {
        window.clearInterval(wait);

        if (!window.grecaptcha) {
          loaderPromise = null;
          reject(new Error('A API do reCAPTCHA nao ficou disponivel.'));
        }
      }, 5000);
    };

    script.onerror = () => {
      loaderPromise = null;
      reject(new Error('Nao foi possivel carregar o Google reCAPTCHA.'));
    };

    document.head.appendChild(script);
  });

  return loaderPromise;
}

type RecaptchaCheckboxProps = {
  onChange: (token: string) => void;
  resetSignal?: number;
};

export function RecaptchaCheckbox({
  onChange,
  resetSignal = 0,
}: RecaptchaCheckboxProps) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    if (!siteKey) {
      setLoadError(
        'Chave publica do reCAPTCHA nao configurada. Reinicie o Vite.',
      );
      onChangeRef.current('');
      return;
    }

    setLoadError('');

    void loadRecaptchaScript()
      .then(() => {
        if (
          cancelled ||
          !containerRef.current ||
          !window.grecaptcha ||
          widgetIdRef.current !== null
        ) {
          return;
        }

        const compact = window.matchMedia('(max-width: 380px)').matches;

        widgetIdRef.current = window.grecaptcha.render(
          containerRef.current,
          {
            sitekey: siteKey,
            theme: 'light',
            size: compact ? 'compact' : 'normal',
            callback: (token) => {
              setLoadError('');
              onChangeRef.current(token);
            },
            'expired-callback': () => {
              onChangeRef.current('');
            },
            'error-callback': () => {
              onChangeRef.current('');
              setLoadError(
                'O reCAPTCHA encontrou um problema de conexao. Tente novamente.',
              );
            },
          },
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        onChangeRef.current('');

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar o reCAPTCHA.',
        );
      });

    return () => {
      cancelled = true;

      if (
        widgetIdRef.current !== null &&
        window.grecaptcha
      ) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          // Widget ja desmontado.
        }
      }

      widgetIdRef.current = null;

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (
      resetSignal <= 0 ||
      widgetIdRef.current === null ||
      !window.grecaptcha
    ) {
      return;
    }

    try {
      window.grecaptcha.reset(widgetIdRef.current);
    } catch {
      // O Google pode estar recarregando o iframe.
    }

    onChangeRef.current('');
  }, [resetSignal]);

  return (
    <div className="recaptcha-v36">
      <div className="recaptcha-v36__label">
        Verificação de segurança
      </div>

      <div className="recaptcha-v36__frame">
        <div ref={containerRef} />
      </div>

      {loadError ? (
        <p className="recaptcha-v36__error">{loadError}</p>
      ) : (
        <p className="recaptcha-v36__hint">
          Marque a caixa para confirmar que você é uma pessoa.
        </p>
      )}
    </div>
  );
}
