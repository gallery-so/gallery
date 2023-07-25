import { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftDetailVideoFragment$key } from '~/generated/NftDetailVideoFragment.graphql';
import { useImageLoading } from '~/hooks/useImageLoading';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { useVideoLoading } from '~/hooks/useVideoLoading';
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

  const isPreviewImageLoaded = useImageLoading(previewUrl);

  const isContentRenderUrlLoaded = useVideoLoading(token.contentRenderURLs.large, previewUrl);

  // Determine which URL to display based on the loading state
  const videoUrlToShow = isContentRenderUrlLoaded
    ? token.contentRenderURLs?.large
    : isPreviewImageLoaded && previewUrl;

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

  return isContentRenderUrlLoaded ? (
    <StyledVideo
      src={`${videoUrlToShow}#t=0.001`}
      muted
      autoPlay
      playsInline
      controls={!shouldHideControls}
      loop={!isSafari()}
      onLoadedData={handleVideoLoad}
      onError={handleVideoLoadError}
      poster={poster}
    />
  ) : (
    <StyledImage src={previewUrl} onLoad={onLoad} />
  );
}
export const StyledImage = styled.img`
  width: 100%;
  border: none;
`;

export const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  border: none;

  max-height: inherit;
`;

export default NftDetailVideo;
