import { useEffect, useRef } from 'react';

export const useSmokeWebGL = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cleanup: VoidFunction | undefined;
    let isDisposed = false;

    const mount = async () => {
      const canvas = canvasRef.current;

      if (canvas == null) {
        return;
      }

      const { initSmokeWebGL } = await import('./initSmokeWebGL');

      if (isDisposed) {
        return;
      }

      cleanup = initSmokeWebGL(canvas);
    };

    const handleLoad = () => {
      void mount();
    };

    if (document.readyState === 'complete') {
      void mount();
    } else {
      window.addEventListener('load', handleLoad, { once: true });
    }

    return () => {
      isDisposed = true;
      window.removeEventListener('load', handleLoad);
      cleanup?.();
    };
  }, []);

  return {
    canvasRef,
  };
};
