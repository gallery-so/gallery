import { useCallback, useEffect, useState } from 'react';

export default function useMouseUp() {
  const [isMouseUp, setIsMouseUp] = useState(false);
  const handleMouseUp = useCallback(() => {
    setIsMouseUp(true);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  return isMouseUp;
}
