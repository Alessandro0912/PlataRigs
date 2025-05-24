import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    function onMediaQueryChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mediaQuery.addEventListener('change', onMediaQueryChange);
    return () => mediaQuery.removeEventListener('change', onMediaQueryChange);
  }, []);

  return isMobile;
} 