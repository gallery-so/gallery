import { useEffect, useState } from 'react';

const INITIAL_HEIGHT = 56;

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

      // when the navbar disappears from view, we don't want it to remove top-padding from pages
      if (entry.borderBoxSize?.[0]?.blockSize === 0) {
        return;
      }
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? INITIAL_HEIGHT);
    });

    const element = document.querySelector('.GlobalNavbar');

    if (element) {
      observer.observe(element);
    }
  }, []);

  return height;
}
