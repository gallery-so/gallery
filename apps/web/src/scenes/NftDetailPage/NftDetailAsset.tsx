import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '~/components/NftFailureFallback/NftFailureFallback';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useContentState } from '~/contexts/shimmer/ShimmerContext';
import { NftDetailAssetComponentFragment$key } from '~/generated/NftDetailAssetComponentFragment.graphql';
import { NftDetailAssetComponentWithoutFallbackFragment$key } from '~/generated/NftDetailAssetComponentWithoutFallbackFragment.graphql';
import { NftDetailAssetFragment$key } from '~/generated/NftDetailAssetFragment.graphql';
import { NftDetailAssetTokenFragment$key } from '~/generated/NftDetailAssetTokenFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useBreakpoint } from '~/hooks/useWindowSize';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

import NftDetailAnimation from './NftDetailAnimation';
import NftDetailAudio from './NftDetailAudio';
import NftDetailGif from './NftDetailGif';
import NftDetailImage from './NftDetailImage';
import NftDetailModel from './NftDetailModel';
import NftDetailVideo from './NftDetailVideo';

type NftDetailAssetComponentProps = {
  tokenRef: NftDetailAssetComponentFragment$key;
  onLoad: () => void;
};

export function NftDetailAssetComponent({ tokenRef, onLoad }: NftDetailAssetComponentProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetComponentFragment on Token {
        media {
          ... on Media {
            fallbackMedia {
              mediaURL
            }
          }
        }

        ...NftDetailAssetComponentWithoutFallbackFragment
      }
    `,
    tokenRef
  );

  return (
    <ReportingErrorBoundary
      fallback={
        <NftDetailImage
          alt={null}
          onLoad={onLoad}
          imageUrl={token.media?.fallbackMedia?.mediaURL}
        />
      }
    >
      <NftDetailAssetComponentWithouFallback tokenRef={token} onLoad={onLoad} />
    </ReportingErrorBoundary>
  );
}

type NftDetailAssetComponentWithoutFallbackProps = {
  tokenRef: NftDetailAssetComponentWithoutFallbackFragment$key;
  onLoad: () => void;
};

function NftDetailAssetComponentWithouFallback({
  tokenRef,
  onLoad,
}: NftDetailAssetComponentWithoutFallbackProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetComponentWithoutFallbackFragment on Token {
        name

        media @required(action: THROW) {
          ... on VideoMedia {
            __typename
            ...NftDetailVideoFragment
          }
          ... on ImageMedia {
            __typename
            contentRenderURL
          }
          ... on GIFMedia {
            __typename
            contentRenderURL
          }
          ... on HtmlMedia {
            __typename
          }
          ... on AudioMedia {
            __typename
          }
          ... on TextMedia {
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
        ...NftDetailGifFragment
      }
    `,
    tokenRef
  );

  if (token.media.__typename === 'UnknownMedia') {
    // If we're dealing with UnknownMedia, we know the NFT is going to
    // fail to load, so we'll just immediately notify the parent
    // that this NftDetailAsset was unable to render
    throw new CouldNotRenderNftError('NftDetailAsset', 'Token media type was `UnknownMedia`');
  }

  switch (token.media.__typename) {
    case 'HtmlMedia':
      return <NftDetailAnimation onLoad={onLoad} mediaRef={token} />;
    case 'VideoMedia':
      return <NftDetailVideo onLoad={onLoad} mediaRef={token.media} />;
    case 'AudioMedia':
      return <NftDetailAudio onLoad={onLoad} tokenRef={token} />;
    case 'ImageMedia':
      const imageMedia = token.media;

      if (!imageMedia.contentRenderURL) {
        throw new CouldNotRenderNftError(
          'NftDetailAsset',
          'Token media type was `ImageMedia` but contentRenderURL was null'
        );
      }

      return (
        <NftDetailImage
          alt={token.name}
          onLoad={onLoad}
          imageUrl={imageMedia.contentRenderURL}
          onClick={() => {
            if (imageMedia.contentRenderURL) {
              window.open(imageMedia.contentRenderURL);
            }
          }}
        />
      );
    case 'GIFMedia':
      const gifMedia = token.media;

      return (
        <NftDetailGif
          onLoad={onLoad}
          tokenRef={token}
          onClick={() => {
            if (gifMedia.contentRenderURL) {
              window.open(gifMedia.contentRenderURL);
            }
          }}
        />
      );
    case 'GltfMedia':
      return <NftDetailModel onLoad={onLoad} mediaRef={token.media} fullHeight />;
    default:
      return <NftDetailAnimation onLoad={onLoad} mediaRef={token} />;
  }
}

type Props = {
  tokenRef: NftDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

function NftDetailAsset({ tokenRef, hasExtraPaddingForNote }: Props) {
  const collectionToken = useFragment(
    graphql`
      fragment NftDetailAssetFragment on CollectionToken {
        token @required(action: THROW) {
          ...NftDetailAssetTokenFragment
        }
      }
    `,
    tokenRef
  );

  // This is split up, so we can retry
  // this fragment when an NFT fails to load
  const token = useFragment<NftDetailAssetTokenFragment$key>(
    graphql`
      fragment NftDetailAssetTokenFragment on Token {
        dbid
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

        ...NftDetailAssetComponentFragment
      }
    `,
    collectionToken.token
  );

  const breakpoint = useBreakpoint();
  const { aspectRatioType } = useContentState();

  const contractAddress = token.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = token.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe &&
    (aspectRatioType !== 'wide' || breakpoint === size.desktop || breakpoint === size.tablet);

  const { handleNftLoaded } = useNftRetry({
    tokenId: token.dbid,
  });

  return (
    <StyledAssetContainer
      data-tokenid={token.dbid}
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftFailureBoundary tokenId={token.dbid}>
        <NftDetailAssetComponent onLoad={handleNftLoaded} tokenRef={token} />
      </NftFailureBoundary>
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
  width: 100%;

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  @media only screen and ${breakpoints.tablet} {
    width: 450px;
    min-height: 450px;
  }

  @media only screen and ${breakpoints.desktop} {
    width: 600px;
    min-height: 600px;
  }

  // enforce auto width on NFT detail page as to not stretch to shimmer container
  ${StyledImageWithLoading} {
    width: auto;
  }
`;

export default NftDetailAsset;
