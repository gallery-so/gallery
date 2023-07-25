import { useEffect, useState } from 'react';

export function useVideoLoading(contentRenderURLs: string, previewUrl: string | undefined) {
  const [isContentRenderUrlLoaded, setContentRenderUrlLoaded] = useState(false);

  useEffect(() => {
    // Check if the contentRenderURL is available
    if (contentRenderURLs) {
      // Create a video element to load the contentRenderURL in the background
      const video = document.createElement('video');
      video.onloadeddata = () => {
        // When the contentRenderURL is loaded, update the state
        setContentRenderUrlLoaded(true);
      };

      video.src = contentRenderURLs;
    }
  }, [contentRenderURLs, previewUrl]);

  return isContentRenderUrlLoaded;
}
