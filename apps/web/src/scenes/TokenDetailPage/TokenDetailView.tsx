import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { TokenDetailViewFragment$key } from '~/generated/TokenDetailViewFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { NoteViewer, StyledContainer } from '~/scenes/NftDetailPage/NftDetailNote';
import NftDetailText from '~/scenes/NftDetailPage/NftDetailText';

import TokenDetailAsset from './TokenDetailAsset';

type Props = {
  authenticatedUserOwnsAsset: boolean;
  tokenRef: TokenDetailViewFragment$key;
};

export default function TokenDetailView({ authenticatedUserOwnsAsset, tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment TokenDetailViewFragment on Token {
        collectorsNote

        ...NftDetailTextFragment
        ...TokenDetailAssetFragment
      }
    `,
    tokenRef
  );

  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const assetHasNote = !!token.collectorsNote;
  const showCollectorsNoteComponent = assetHasNote || authenticatedUserOwnsAsset;

  return (
    <StyledBody>
      {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
      <StyledContentContainer>
        <StyledAssetAndNoteContainer>
          <ShimmerProvider>
            <TokenDetailAsset
              tokenRef={token}
              hasExtraPaddingForNote={showCollectorsNoteComponent}
            />
          </ShimmerProvider>
          {token?.collectorsNote && (
            <StyledContainer footerHeight={GLOBAL_FOOTER_HEIGHT}>
              <NoteViewer nftCollectorsNote={token?.collectorsNote || ''} />
            </StyledContainer>
          )}
        </StyledAssetAndNoteContainer>

        <NftDetailText tokenRef={token} authenticatedUserOwnsAsset={authenticatedUserOwnsAsset} />
      </StyledContentContainer>
      {!useIsMobileOrMobileLargeWindowWidth && <StyledNavigationBuffer />}
    </StyledBody>
  );
}

const StyledBody = styled.div`
  display: flex;
  width: 100%;

  @media only screen and ${breakpoints.mobile} {
  }

  @media only screen and ${breakpoints.desktop} {
    width: auto;
  }
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }

  @media only screen and ${breakpoints.desktop} {
    width: initial;
  }
`;

const StyledAssetAndNoteContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

// We position the arrows using position absolute (so they reach the page bounds)
// But we still want there to be space taken up in the document flow, so that the arrows do not overlap with content
// This container simply creates space for the arrows to be positioned
const StyledNavigationBuffer = styled.div`
  width: 80px;
`;
