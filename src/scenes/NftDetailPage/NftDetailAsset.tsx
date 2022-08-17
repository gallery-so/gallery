import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import NftDetailAnimation from './NftDetailAnimation';
import NftDetailVideo from './NftDetailVideo';
import NftDetailAudio from './NftDetailAudio';
import { useBreakpoint } from 'hooks/useWindowSize';
import { useContentState, useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { graphql, useFragment } from 'react-relay';
import { NftDetailAssetFragment$key } from '__generated__/NftDetailAssetFragment.graphql';
import { NftDetailAssetComponentFragment$key } from '__generated__/NftDetailAssetComponentFragment.graphql';
import NftDetailImage from './NftDetailImage';
import NftDetailModel from './NftDetailModel';
import { useCallback, useEffect, useState } from 'react';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import { GLOBAL_FOOTER_HEIGHT } from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import { StyledImageWithLoading } from 'components/LoadingAsset/ImageWithLoading';

type NftDetailAssetComponentProps = {
  tokenRef: NftDetailAssetComponentFragment$key;
  onLoad: () => void;
  onError: () => void;
};

function NftDetailAssetComponent({ tokenRef, onLoad, onError }: NftDetailAssetComponentProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetComponentFragment on CollectionToken {
        id
        token @required(action: THROW) {
          media @required(action: THROW) {
            ... on VideoMedia {
              __typename
              ...NftDetailVideoFragment
            }
            ... on ImageMedia {
              __typename
              contentRenderURL
            }
            ... on HtmlMedia {
              __typename
            }
            ... on AudioMedia {
              __typename
            }
            ... on GltfMedia {
              __typename
              ...NftDetailModelFragment
            }
            ... on UnknownMedia {
              __typename
            }
          }
          ...NftDetailAnimationFragment
          ...NftDetailAudioFragment
          ...NftDetailImageFragment
        }
      }
    `,
    tokenRef
  );

  switch (token.token.media.__typename) {
    case 'HtmlMedia':
      return <NftDetailAnimation onLoad={onLoad} mediaRef={token.token} />;
    case 'VideoMedia':
      return <NftDetailVideo onLoad={onLoad} onError={onError} mediaRef={token.token.media} />;
    case 'AudioMedia':
      return <NftDetailAudio onLoad={onLoad} onError={onError} tokenRef={token.token} />;
    case 'ImageMedia':
      return (
        <NftDetailImage
          onLoad={onLoad}
          onError={onError}
          tokenRef={token.token}
          // @ts-expect-error: we know contentRenderURL is present within the media field
          // if token type is `ImageMedia`
          onClick={() => window.open(token.token.media.contentRenderURL)}
        />
      );
    case 'GltfMedia':
      return <NftDetailModel onLoad={onLoad} onError={onError} mediaRef={token.token.media} />;
    default:
      return <NftDetailAnimation onLoad={onLoad} mediaRef={token.token} />;
  }
}

type Props = {
  tokenRef: NftDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

type FailureState =
  | {
      type: 'retries-exhausted';
    }
  | { type: 'timeout'; retry: number };

function NftDetailAsset({ tokenRef, hasExtraPaddingForNote }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetFragment on CollectionToken {
        id
        token @required(action: THROW) {
          contract {
            contractAddress {
              address
            }
          }
          media @required(action: THROW) {
            ... on HtmlMedia {
              __typename
            }
          }
        }
        ...NftDetailAssetComponentFragment
      }
    `,
    tokenRef
  );

  const breakpoint = useBreakpoint();
  const { aspectRatioType } = useContentState();

  const contractAddress = token.token.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = token.token.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe &&
    (aspectRatioType !== 'wide' || breakpoint === size.desktop || breakpoint === size.tablet);

  const setContentIsLoaded = useSetContentIsLoaded();
  const [failure, setFailure] = useState<FailureState | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleLoad = useCallback(() => {
    setContentIsLoaded();

    // If we "successfully" loaded, we never
    // want to show the failure state
    setFailure(null);
  }, [setContentIsLoaded]);

  const handleError = useCallback(() => {
    if (retryKey >= 3) {
      // Give up and show the failure state
      setContentIsLoaded();
      setFailure({ type: 'retries-exhausted' });
    } else {
      // Queue a retry in a second
      setTimeout(() => {
        setRetryKey((previous) => previous + 1);
      }, 1000);
    }
  }, [retryKey, setContentIsLoaded]);

  useEffect(
    function startLoadTimeout() {
      const timeoutId = setTimeout(() => {
        setFailure((existingFailure) => {
          // If we already failed from something else
          // we don't want to override that failure with a timeout failure
          if (existingFailure) {
            return existingFailure;
          }

          // Including the retry key is important here so we
          // can include it as a dependency in the useEffect.
          // This way, every time we retry, we reset the timeout
          // so the current retry has adequate time to load
          return { type: 'timeout', retry: retryKey };
        });
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      };
    },
    [retryKey]
  );

  return (
    <StyledAssetContainer
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftDetailAssetComponent
        key={retryKey}
        onError={handleError}
        onLoad={handleLoad}
        tokenRef={token}
      />
    </StyledAssetContainer>
  );
}

type AssetContainerProps = {
  footerHeight: number;
  shouldEnforceSquareAspectRatio: boolean;
  hasExtraPaddingForNote: boolean;
  backgroundColorOverride: string;
};

const StyledAssetContainer = styled.div<AssetContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2; /* Above footer in event they overlap */

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  @media only screen and ${breakpoints.tablet} {
    width: 600px;
    min-height: 600px;
    height: 100%;
  }
  
  // enforce auto width on NFT detail page as to not stretch to shimmer container
  ${StyledImageWithLoading} {
    width: auto;
  }
`;

export default NftDetailAsset;
