import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import NftDetailAnimation from './NftDetailAnimation';
import NftDetailVideo from './NftDetailVideo';
import NftDetailAudio from './NftDetailAudio';
import { useBreakpoint } from 'hooks/useWindowSize';
import { useContentState } from 'contexts/shimmer/ShimmerContext';
import { graphql, useFragment } from 'react-relay';
import { NftDetailAssetFragment$key } from '__generated__/NftDetailAssetFragment.graphql';
import { NftDetailAssetComponentFragment$key } from '__generated__/NftDetailAssetComponentFragment.graphql';
import NftDetailImage from './NftDetailImage';
import NftDetailModel from './NftDetailModel';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import { GLOBAL_FOOTER_HEIGHT } from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import { StyledImageWithLoading } from 'components/LoadingAsset/ImageWithLoading';
import { useNftRetry } from 'hooks/useNftRetry';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { NftFailureBoundary } from 'components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from 'components/NftFailureFallback/NftFailureFallback';
import { NftDetailAssetTokenFragment$key } from '../../../__generated__/NftDetailAssetTokenFragment.graphql';
import NftDetailGif from './NftDetailGif';

type NftDetailAssetComponentProps = {
  tokenRef: NftDetailAssetComponentFragment$key;
  onLoad: () => void;
};

function NftDetailAssetComponent({ tokenRef, onLoad }: NftDetailAssetComponentProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetComponentFragment on Token {
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
      return (
        <NftDetailImage
          onLoad={onLoad}
          tokenRef={token}
          // @ts-expect-error: we know contentRenderURL is present within the media field
          // if token type is `ImageMedia`
          onClick={() => window.open(token.media.contentRenderURL)}
        />
      );
    case 'GIFMedia':
      return (
        <NftDetailGif
          onLoad={onLoad}
          tokenRef={token}
          // @ts-expect-error: we know contentRenderURL is present within the media field
          // if token type is `GifMedia`
          onClick={() => window.open(token.media.contentRenderURL)}
        />
      );
    case 'GltfMedia':
      return <NftDetailModel onLoad={onLoad} mediaRef={token.media} />;
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
        id
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

  const { retryKey, handleNftLoaded, refreshMetadata, refreshingMetadata, handleNftError } =
    useNftRetry({
      tokenId: token.dbid,
    });

  return (
    <StyledAssetContainer
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftFailureBoundary
        key={retryKey}
        onError={handleNftError}
        fallback={<NftFailureFallback onRetry={refreshMetadata} refreshing={refreshingMetadata} />}
      >
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

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  @media only screen and ${breakpoints.tablet} {
    width: 600px;
    min-height: 600px;
  }

  // enforce auto width on NFT detail page as to not stretch to shimmer container
  ${StyledImageWithLoading} {
    width: auto;
  }
`;

export default NftDetailAsset;
