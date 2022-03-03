import { useEffect, useMemo, useState } from 'react';
import { size } from 'components/core/breakpoints';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

export function useBreakpoint(): size {
  const { width } = useWindowSize();

  const breakpoint = useMemo(() => {
    if (width >= size.desktop) {
      return size.desktop;
    }

    if (width >= size.tablet) {
      return size.tablet;
    }

    if (width >= size.mobileLarge) {
      return size.mobileLarge;
    }

    return size.mobile;
  }, [width]);

  return breakpoint;
}

export function useIsMobileWindowWidth() {
  return useBreakpoint() === size.mobile;
}

export function useIsMobileOrMobileLargeWindowWidth() {
  const breakpoint = useBreakpoint();
  return breakpoint === size.mobileLarge || breakpoint === size.mobile;
}
