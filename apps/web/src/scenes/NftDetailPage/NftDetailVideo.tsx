import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftDetailVideoFragment$key } from '~/generated/NftDetailVideoFragment.graphql';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { isSafari } from '~/utils/browser';
import isVideoUrl from '~/utils/isVideoUrl';

type Props = {
  mediaRef: NftDetailVideoFragment$key;
  hideControls?: boolean;
  onLoad: ContentIsLoadedEvent;
  previewUrl: string | undefined;
};

function NftDetailVideo({ mediaRef, hideControls = false, onLoad, previewUrl }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailVideoFragment on VideoMedia {
        contentRenderURLs @required(action: THROW) {
          large @required(action: THROW)
        }
        previewURLs {
          large
        }
      }
    `,
    mediaRef
  );

  const [isContentRenderUrlLoaded, setContentRenderUrlLoaded] = useState(false);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);

  useEffect(() => {
    // Check if the contentRenderURL is available
    if (token.contentRenderURLs && token.contentRenderURLs.large) {
      // Create a video element to load the contentRenderURL in the background
      const video = document.createElement('video');
      video.onloadeddata = () => {
        // When the contentRenderURL is loaded, update the state
        setContentRenderUrlLoaded(true);
      };

      video.src = token.contentRenderURLs.large; // Start loading the video
    } else {
      // If contentRenderURLs is not available, load the previewUrl image
      if (previewUrl) {
        console.log('previewUrl is avail');
        const img = new Image();
        img.onload = () => {
          // When the previewUrl image is loaded, update the state
          setIsPreviewLoaded(true);
        };

        img.src = previewUrl; // Start loading the preview image
      }
    }
  }, [token.contentRenderURLs, previewUrl]);

  // Determine which URL to display based on the loading state
  const videoUrlToShow = isContentRenderUrlLoaded
    ? token.contentRenderURLs?.large
    : isPreviewLoaded
    ? previewUrl
    : undefined;

  const [errored, setErrored] = useState(false);

  const { handleError } = useThrowOnMediaFailure('NftDetailVideo');

  const handleVideoLoadError = useCallback(
    (e: SyntheticEvent<HTMLVideoElement, Event>) => {
      if (e.currentTarget.error) {
        setErrored(true);
        handleError(e);
      }
    },
    [handleError]
  );

  const handleVideoLoad = () => {
    // Once the video is loaded, we can call the onLoad function
    onLoad();
  };

  // poster image is displayed mid-load, or as a fallback if the load fails
  const poster = useMemo(() => {
    if (!token?.previewURLs?.large) {
      return undefined;
    }

    if (isVideoUrl(token.previewURLs.large)) {
      return undefined;
    }

    return token.previewURLs.large;
  }, [token?.previewURLs?.large]);

  // if there's an issue loading the video, controls need to be disabled in order
  // to render the poster fallback
  const shouldHideControls = hideControls || errored;

  console.log('videoUrlToShow:', videoUrlToShow);
  console.log('previewUrl from video component:', previewUrl);

  return videoUrlToShow ? (
    <StyledVideo
      src={`${videoUrlToShow}#t=0.001`}
      muted
      autoPlay
      playsInline
      controls={!shouldHideControls}
      loop={!isSafari()}
      onLoadedData={handleVideoLoad} // Call the handleVideoLoad function when the video is loaded
      onError={handleVideoLoadError}
      poster={poster}
    />
  ) : (
    // If videoUrlToShow is not available, render the preview image
    <StyledImage src={previewUrl} onLoad={onLoad} />
  );
}
export const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  border: none;

  max-height: inherit;
`;

export const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  border: none;

  max-height: inherit;
`;

export default NftDetailVideo;
