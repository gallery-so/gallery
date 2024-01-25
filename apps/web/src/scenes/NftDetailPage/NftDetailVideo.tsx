import { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftDetailVideoFragment$key } from '~/generated/NftDetailVideoFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { useIsDesktopWindowWidth } from '~/hooks/useWindowSize';
import isVideoUrl from '~/utils/isVideoUrl';

type Props = {
  mediaRef: NftDetailVideoFragment$key;
  hideControls?: boolean;
  tokenId?: string;
  onLoad: ContentIsLoadedEvent;
};

function NftDetailVideo({ mediaRef, hideControls = false, onLoad, tokenId }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailVideoFragment on VideoMedia {
        contentRenderURLs @required(action: THROW) {
          large @required(action: THROW)
        }
        previewURLs {
          large
        }
        ...useContainedDimensionsForTokenFragment
      }
    `,
    mediaRef
  );

  const [hasFailedToLoadDetailAsset, setHasFailedToLoadDetailAsset] = useState(false);

  const { handleError: handleSeriousError } = useThrowOnMediaFailure('NftDetailVideo');

  const handleVideoLoadError = useCallback((e: SyntheticEvent<HTMLVideoElement, Event>) => {
    if (e.currentTarget.error) {
      setHasFailedToLoadDetailAsset(true);
    }
  }, []);

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

  const resultDimensions = useContainedDimensionsForToken({
    mediaRef: token,
  });

  const { cacheLoadedImageUrls } = useNftPreviewFallbackState();

  const handleLoad = useCallback(() => {
    if (poster && tokenId) {
      cacheLoadedImageUrls(tokenId, 'preview', poster, resultDimensions);
    }
    onLoad();
  }, [poster, cacheLoadedImageUrls, onLoad, tokenId, resultDimensions]);

  // if there's an issue loading the video, controls need to be disabled in order
  // to render the poster fallback
  const shouldHideControls = hideControls || hasFailedToLoadDetailAsset;

  const isDesktop = useIsDesktopWindowWidth();

  if (hasFailedToLoadDetailAsset) {
    return (
      <ImageWithLoading
        alt={tokenId ?? ''}
        src={poster ?? ''}
        heightType={isDesktop ? 'maxHeightMinScreen' : undefined}
        onLoad={onLoad}
        onError={handleSeriousError}
      />
    );
  }

  return (
    <StyledVideo
      src={`${token.contentRenderURLs.large}#t=0.001`}
      muted
      autoPlay
      playsInline
      controls={!shouldHideControls}
      loop
      onLoadedData={handleLoad}
      /**
       * NOTE: As of July 2022, there's a bug on iOS where certain videos will fail to load.
       * Upon inspecting the simulator's logs, the network request for the video asset
       * simply returns "An error occurred trying to load the resource". A few years ago
       * a similar issue occurred on iOS that was solved with a combination of the props
       * used above: `autoPlay`, `playsInline`, and `loop`. Now this bug has resurfaced,
       * and even Opensea itself cannot load videos on iOS. The best we can do is render
       * a static poster in its place.
       */
      onError={handleVideoLoadError}
      poster={poster}
    />
  );
}

export const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  border: none;

  max-height: inherit;
`;

export default NftDetailVideo;
