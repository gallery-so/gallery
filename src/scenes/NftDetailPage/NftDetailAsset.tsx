import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_NAVBAR_HEIGHT } from 'components/core/Page/constants';
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
import { getBackgroundColorOverrideForContract } from 'utils/nft';

type NftDetailAssetComponentProps = {
  nftRef: NftDetailAssetComponentFragment$key;
  maxHeight: number;
};

function NftDetailAssetComponent({ nftRef, maxHeight }: NftDetailAssetComponentProps) {
  const nft = useFragment(
    graphql`
      fragment NftDetailAssetComponentFragment on CollectionNft {
        id
        nft @required(action: THROW) {
          media @required(action: THROW) {
            ... on VideoMedia {
              __typename
              ...NftDetailVideoFragment
            }
            ... on ImageMedia {
              __typename
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
    nftRef
  );

  switch (nft.nft.media.__typename) {
    case 'HtmlMedia':
      return <NftDetailAnimation mediaRef={nft.nft} />;
    case 'VideoMedia':
      return <NftDetailVideo mediaRef={nft.nft.media} maxHeight={maxHeight} />;
    case 'AudioMedia':
      return <NftDetailAudio nftRef={nft.nft} />;
    case 'ImageMedia':
      return <NftDetailImage nftRef={nft.nft} maxHeight={maxHeight} />;
    case 'GltfMedia':
      return <NftDetailModel mediaRef={nft.nft.media} />;
    default:
      return <NftDetailAnimation mediaRef={nft.nft} />;
  }
}

type Props = {
  nftRef: NftDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

// number that determines a reasonable max height for the displayed NFT
let heightWithoutNavAndFooterGutters: number;

if (typeof window !== 'undefined') {
  // NOTE: don't need to handle MOBILE footer height here, since this logic only applies to desktop + tablet
  heightWithoutNavAndFooterGutters =
    window.screen.availHeight - 2 * (GLOBAL_NAVBAR_HEIGHT + GLOBAL_FOOTER_HEIGHT);
}

function NftDetailAsset({ nftRef, hasExtraPaddingForNote }: Props) {
  const nft = useFragment(
    graphql`
      fragment NftDetailAssetFragment on CollectionNft {
        id
        nft @required(action: THROW) {
          contractAddress
          media @required(action: THROW) {
            ... on HtmlMedia {
              __typename
            }
          }
        }
        ...NftDetailAssetComponentFragment
      }
    `,
    nftRef
  );

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(nft.nft.contractAddress ?? ''),
    [nft.nft.contractAddress]
  );

  const maxHeight = Math.min(
    heightWithoutNavAndFooterGutters,
    // TODO: this number should be determined by the dimensions of the media itself. once the media is fetched,
    // we should grab its dimensions and set it on the shimmer context. this will allow us to display very large
    // NFTs on very large screens
    600
  );

  const { aspectRatioType } = useContentState();
  const breakpoint = useBreakpoint();

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = nft.nft.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe &&
    (aspectRatioType !== 'wide' || breakpoint === size.desktop || breakpoint === size.tablet);

  return (
    <StyledAssetContainer
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      maxHeight={maxHeight}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftDetailAssetComponent nftRef={nft} maxHeight={maxHeight} />
    </StyledAssetContainer>
  );
}

type AssetContainerProps = {
  footerHeight: number;
  maxHeight: number;
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
    width: 100%;

    ${({ hasExtraPaddingForNote, footerHeight }) =>
      hasExtraPaddingForNote ? `max-height: calc(85vh - 46px - ${footerHeight}px)` : ''};
  }

  @media only screen and ${breakpoints.desktop} {
    width: ${({ maxHeight }) => maxHeight}px;
    height: ${({ maxHeight }) => maxHeight}px;
  }
`;

export default NftDetailAsset;
