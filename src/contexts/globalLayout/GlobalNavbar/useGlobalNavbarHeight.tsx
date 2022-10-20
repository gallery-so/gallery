import { useEffect, useState } from 'react';

const INITIAL_HEIGHT = 64;

export function useGlobalNavbarHeight() {
  const [height, setHeight] = useState(INITIAL_HEIGHT);

  useEffect(() => {
    if (!global.ResizeObserver) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;

      if (!entry) {
        return;
      }

      setHeight(entry.borderBoxSize[0]?.blockSize ?? INITIAL_HEIGHT);
    });

    const element = document.querySelector('.GlobalNavbar');

    if (element) {
      observer.observe(element);
    }
  }, []);

  return height;
}
