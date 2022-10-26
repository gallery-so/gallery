import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import { useBreakpoint } from 'hooks/useWindowSize';
import { useContentState } from 'contexts/shimmer/ShimmerContext';
import { graphql, useFragment } from 'react-relay';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import { GLOBAL_FOOTER_HEIGHT } from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import { StyledImageWithLoading } from 'components/LoadingAsset/ImageWithLoading';
import { useNftRetry } from 'hooks/useNftRetry';
import { NftFailureBoundary } from 'components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from 'components/NftFailureFallback/NftFailureFallback';
import { NftDetailAssetComponent } from 'scenes/NftDetailPage/NftDetailAsset';
import { TokenDetailAssetFragment$key } from '__generated__/TokenDetailAssetFragment.graphql';

type Props = {
  tokenRef: TokenDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
};

function TokenDetailAsset({ tokenRef, hasExtraPaddingForNote }: Props) {
  // This is split up, so we can retry
  // this fragment when an NFT fails to load
  const token = useFragment<TokenDetailAssetFragment$key>(
    graphql`
      fragment TokenDetailAssetFragment on Token {
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
    tokenRef
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

  const {
    retryKey,
    handleNftLoaded,
    refreshMetadata,
    refreshingMetadata,
    handleNftError,
  } = useNftRetry({
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

export default TokenDetailAsset;
