import { useEffect, useState } from 'react';

export function useHtmlMediaLoading(contentRenderURL: string | undefined) {
  const [isContentRenderUrlLoaded, setContentRenderUrlLoaded] = useState(false);

  useEffect(() => {
    if (contentRenderURL) {
      // Create an iframe element to load the contentRenderURL in the background
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        // When the contentRenderURL is loaded, update the state
        setContentRenderUrlLoaded(true);
      };

      // Set the iframe src to the contentRenderURL
      iframe.src = contentRenderURL;

      // Set the iframe style to hide it from the user
      iframe.style.display = 'none';

      // Append the iframe to the document body to start loading the contentRenderURL
      document.body.appendChild(iframe);

      // Clean up the iframe when the component unmounts
      return () => {
        document.body.removeChild(iframe);
      };
    }
  }, [contentRenderURL]);

  return isContentRenderUrlLoaded;
}
