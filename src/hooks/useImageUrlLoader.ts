import { useEffect } from 'react';

type useImageUrlLoaderArgs = {
  url?: string | null;
  onLoad?: () => void;
  onError?: () => void;
};

export function useImageUrlLoader({ url, onLoad, onError }: useImageUrlLoaderArgs) {
  useEffect(() => {
    if (!url) {
      onError?.();

      return;
    }

    const image = new Image();

    image.addEventListener('load', () => {
      onLoad?.();
    });

    image.addEventListener('error', () => {
      onError?.();
    });

    image.src = url;
  }, [onError, onLoad, url]);
}
