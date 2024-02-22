import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { TokenDetailAssetFragment$key } from '~/generated/TokenDetailAssetFragment.graphql';
import { useBreakpoint, useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import ExpandIcon from '~/icons/ExpandIcon';
import { StyledLightboxButton } from '~/scenes/NftDetailPage/NftDetailAsset';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

import NftDetailAssetContainer from '../NftDetailPage/NftDetailAssetContainer';
import NftDetailLightbox, { getLightboxPortalElementId } from '../NftDetailPage/NftDetailLightbox';

type Props = {
  tokenRef: TokenDetailAssetFragment$key;
  hasExtraPaddingForNote: boolean;
  isLightboxOpen: boolean;
  toggleLightbox: () => void;
};

function TokenDetailAsset({
  tokenRef,
  hasExtraPaddingForNote,
  isLightboxOpen,
  toggleLightbox,
}: Props) {
  // This is split up, so we can retry
  // this fragment when an NFT fails to load
  const token = useFragment<TokenDetailAssetFragment$key>(
    graphql`
      fragment TokenDetailAssetFragment on Token {
        dbid
        definition {
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

        ...NftDetailAssetContainerFragment
      }
    `,
    tokenRef
  );

  const breakpoint = useBreakpoint();

  const contractAddress = token.definition.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  // We do not want to enforce square aspect ratio for iframes https://github.com/gallery-so/gallery/pull/536
  const isIframe = token.definition.media.__typename === 'HtmlMedia';
  const shouldEnforceSquareAspectRatio =
    !isIframe && (breakpoint === size.desktop || breakpoint === size.tablet);

  const [lightboxContainer, setLightboxContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setLightboxContainer(document.getElementById(getLightboxPortalElementId(token.dbid)));
    // only need to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledAssetContainer
      data-tokenid={token.dbid}
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      shouldEnforceSquareAspectRatio={shouldEnforceSquareAspectRatio}
      hasExtraPaddingForNote={hasExtraPaddingForNote}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftFailureBoundary tokenId={token.dbid}>
        <VisibilityContainer>
          {!isMobile && !isLightboxOpen && (
            <StyledLightboxButton onClick={toggleLightbox}>
              <ExpandIcon />
            </StyledLightboxButton>
          )}
          {lightboxContainer &&
            createPortal(
              <NftDetailAssetContainer tokenRef={token} toggleLightbox={toggleLightbox} />,
              lightboxContainer
            )}
        </VisibilityContainer>
      </NftFailureBoundary>
      <NftDetailLightbox
        isLightboxOpen={isLightboxOpen}
        toggleLightbox={toggleLightbox}
        tokenId={token.dbid}
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
  width: 100%;

  ${({ shouldEnforceSquareAspectRatio }) =>
    shouldEnforceSquareAspectRatio ? 'aspect-ratio: 1' : ''};

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  @media only screen and ${breakpoints.desktop} {
    max-width: 800px;
  }

  // enforce auto width on NFT detail page as to not stretch to shimmer container
  ${StyledImageWithLoading} {
    width: auto;
  }

  &:hover {
    ${StyledLightboxButton} {
      opacity: 1;
    }
  }
`;

const VisibilityContainer = styled.div`
  position: relative;
  width: inherit;
  padding-top: 100%; /* This creates a square container based on aspect ratio */
`;
export default TokenDetailAsset;
