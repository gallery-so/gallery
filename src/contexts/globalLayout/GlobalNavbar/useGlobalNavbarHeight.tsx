import { useContext, useEffect, useState } from 'react';
import { GlobalLayoutStateContext } from 'contexts/globalLayout/GlobalLayoutContext';

const INITIAL_HEIGHT = 64;

export function useGlobalNavbarHeight() {
  const [height, setHeight] = useState(INITIAL_HEIGHT);

  const context = useContext(GlobalLayoutStateContext);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      console.log('Observed', entries);

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

  if (context) {
    if (!context.isNavbarVisible) {
      return 0;
    }

    return height;
  }

  console.log('Non Context path');
  return height;
}
