import { useEffect } from 'react';

type useImageUrlLoaderArgs = {
  url?: string | null;
  onLoad?: () => void;
  onError?: () => void;
};

/**
 * This hook should be used to if you want to detect success / failure of loading
 * an image url, but you're not using an `img` element.
 */
export function useImageFailureCheck({ url, onLoad, onError }: useImageUrlLoaderArgs) {
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
