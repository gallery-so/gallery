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
import { useMemo } from 'react';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import { GLOBAL_FOOTER_HEIGHT } from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import { StyledImageWithLoading } from 'components/LoadingAsset/ImageWithLoading';

type NftDetailAssetComponentProps = {
  tokenRef: NftDetailAssetComponentFragment$key;
};

function NftDetailAssetComponent({ tokenRef }: NftDetailAssetComponentProps) {
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
      return <NftDetailAnimation mediaRef={token.token} />;
    case 'VideoMedia':
      return <NftDetailVideo mediaRef={token.token.media} />;
    case 'AudioMedia':
      return <NftDetailAudio tokenRef={token.token} />;
    case 'ImageMedia':
      return (
        <NftDetailImage
          tokenRef={token.token}
          // @ts-expect-error: we know contentRenderURL is present within the media field
          // if token type is `ImageMedia`
          onClick={() => window.open(token.token.media.contentRenderURL)}
        />
      );
    case 'GltfMedia':
      return <NftDetailModel mediaRef={token.token.media} />;
    default:
      return <NftDetailAnimation mediaRef={token.token} />;
  }
}

type Props = {
  tokenRef: NftDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

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

  const contractAddress = token.token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(contractAddress),
    [contractAddress]
  );

  const { aspectRatioType } = useContentState();
  const breakpoint = useBreakpoint();

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = token.token.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe &&
    (aspectRatioType !== 'wide' || breakpoint === size.desktop || breakpoint === size.tablet);

  return (
    <StyledAssetContainer
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftDetailAssetComponent tokenRef={token} />
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
