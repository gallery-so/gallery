import { useCallback, useEffect, useState } from 'react';

// Custom hook to load the contentRenderURL and handle errors
export function useLoadContentRenderUrl(contentRenderUrl: string | null | undefined) {
  const [isContentRenderUrlLoaded, setContentRenderUrlLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleLoadError = useCallback(() => {
    setErrored(true);
    // Handle the error here, e.g., log or show an error message
    console.error('Error loading contentRenderURL');
  }, []);

  useEffect(() => {
    if (contentRenderUrl) {
      // Create an element (e.g., an image or video) to load the contentRenderURL in the background
      const element = document.createElement('img'); // Use 'img' for images or 'video' for videos

      element.onload = () => {
        // When the contentRenderURL is loaded, update the state
        setContentRenderUrlLoaded(true);
      };

      element.onerror = handleLoadError;

      element.src = contentRenderUrl; // Start loading the high-definition contentRenderURL
    }
  }, [contentRenderUrl, handleLoadError]);

  return {
    isContentRenderUrlLoaded,
    errored,
  };
}
