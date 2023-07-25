import { useEffect, useState } from 'react';

export function useImageLoading(imageUrl: string | undefined | null | false) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
      };

      img.src = imageUrl;
    }
  }, [imageUrl]);

  return isLoaded;
}
