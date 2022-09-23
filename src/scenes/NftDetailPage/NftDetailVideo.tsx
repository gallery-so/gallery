import { useFragment } from 'react-relay';
import styled from 'styled-components';
import { graphql } from 'relay-runtime';
import { NftDetailVideoFragment$key } from '__generated__/NftDetailVideoFragment.graphql';
import { ContentIsLoadedEvent } from 'contexts/shimmer/ShimmerContext';
import { useThrowOnMediaFailure } from 'hooks/useNftRetry';
import { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import isVideoUrl from 'utils/isVideoUrl';
import { isSafari } from 'utils/browser';

type Props = {
  mediaRef: NftDetailVideoFragment$key;
  hideControls?: boolean;
  onLoad: ContentIsLoadedEvent;
};

function NftDetailVideo({ mediaRef, hideControls = false, onLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailVideoFragment on VideoMedia {
        contentRenderURLs @required(action: THROW) {
          raw @required(action: THROW)
          large @required(action: THROW)
        }
        previewURLs {
          large
        }
      }
    `,
    mediaRef
  );

  const [errored, setErrored] = useState(false);

  const { handleError } = useThrowOnMediaFailure('NftDetailVideo');

  const handleVideoLoadError = useCallback(
    (e: SyntheticEvent<HTMLVideoElement, Event>) => {
      setErrored(true);
      handleError(e);
    },
    [handleError]
  );

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

  return (
    <StyledVideo
      src={`${token.contentRenderURLs.large}#t=0.001`}
      muted
      autoPlay
      playsInline
      controls={!shouldHideControls}
      /**
       * Disable video looping if browser is Safari. As of Sept 2022, there's a bug on Safari
       * where data will continuously download each time the video loops, at worst case leading
       * to several gigabytes being fetched (which is really bad on mobile devices)
       */
      loop={!isSafari()}
      onLoadedData={onLoad}
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
