import { useEffect, useState } from 'react';

export enum MediaType {
  Image,
  Video,
  Html,
}

export function useMediaLoading(
  mediaType: MediaType,
  mediaUrl: string | false | null | undefined,
  previewUrl: string | undefined
) {
  const [isMediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => {
    let isLoading = false;

    if (mediaUrl && mediaUrl !== null) {
      switch (mediaType) {
        case MediaType.Image:
          isLoading = true;
          const img = new Image();
          img.onload = () => {
            setMediaLoaded(true);
          };
          img.src = mediaUrl;
          break;
        case MediaType.Video:
          isLoading = true;
          const video = document.createElement('video');
          video.onloadeddata = () => {
            setMediaLoaded(true);
          };
          video.src = mediaUrl;
          break;
        case MediaType.Html:
          isLoading = true;
          const iframe = document.createElement('iframe');
          iframe.onload = () => {
            setMediaLoaded(true);
          };
          iframe.src = mediaUrl;
          document.body.appendChild(iframe); // Append the iframe to the DOM to trigger loading
          break;
        default:
          break;
      }
    }

    // If the mediaUrl is false or null, consider the media as loaded
    if (!isLoading) {
      setMediaLoaded(true);
    }
  }, [mediaType, mediaUrl, previewUrl]);

  return isMediaLoaded;
}
