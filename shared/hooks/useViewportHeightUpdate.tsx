import { useEffect } from 'react';

const isServer = typeof window === 'undefined';

export const useViewportHeightUpdate = () => {
  const setViewportHeight = () => {
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  useEffect(() => {
    if (!isServer) {
      setViewportHeight();
      window.addEventListener('resize', setViewportHeight);
    }
    return () => window.removeEventListener('resize', setViewportHeight);
  }, []);
};
