import { useEffect, useState } from 'react';

export default function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const observeTarget = ref.current;

    if (!observeTarget) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const [firstEntry] = entries;

      if (!firstEntry) {
        return;
      }

      const { width, height } = firstEntry.contentRect;
      setDimensions({ width, height });
    });
    observer.observe(observeTarget);

    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
}
