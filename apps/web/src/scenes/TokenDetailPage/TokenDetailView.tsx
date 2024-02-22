import { useCallback, useEffect, useRef, useState } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { TokenDetailViewFragment$key } from '~/generated/TokenDetailViewFragment.graphql';
import { TokenDetailViewQuery } from '~/generated/TokenDetailViewQuery.graphql';
import { TokenDetailViewQueryFragment$key } from '~/generated/TokenDetailViewQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { NoteViewer, StyledContainer } from '~/scenes/NftDetailPage/NftDetailNote';
import NftDetailText from '~/scenes/NftDetailPage/NftDetailText';

import TokenDetailAsset from './TokenDetailAsset';

type LoadableTokenDetailViewProps = {
  tokenId: string;
};

export function LoadableTokenDetailView({ tokenId, ...props }: LoadableTokenDetailViewProps) {
  const query = useLazyLoadQuery<TokenDetailViewQuery>(
    graphql`
      query TokenDetailViewQuery($tokenId: DBID!) {
        token: tokenById(id: $tokenId) {
          ... on ErrTokenNotFound {
            __typename
          }
          ... on Token {
            __typename
            ...TokenDetailViewFragment
          }
        }

        ...TokenDetailViewQueryFragment
      }
    `,
    { tokenId }
  );

  if (!query.token || query.token.__typename !== 'Token') {
    return null;
  }

  return <TokenDetailView tokenRef={query.token} queryRef={query} {...props} />;
}

type Props = {
  tokenRef: TokenDetailViewFragment$key;
  queryRef: TokenDetailViewQueryFragment$key;
};

export default function TokenDetailView({ tokenRef, queryRef }: Props) {
  const token = useFragment(
    graphql`
      fragment TokenDetailViewFragment on Token {
        dbid
        collectorsNote
        owner {
          username
        }

        ...NftDetailTextFragment
        ...TokenDetailAssetFragment
      }
    `,
    tokenRef
  );

  const query = useFragment(
    graphql`
      fragment TokenDetailViewQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              username
            }
          }
        }
        ...NftDetailTextQueryFragment
      }
    `,
    queryRef
  );

  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const authenticatedUserOwnsAsset =
    query.viewer?.__typename === 'Viewer' && query.viewer?.user?.username === token.owner?.username;

  const assetHasNote = Boolean(token.collectorsNote);
  const showCollectorsNoteComponent = assetHasNote || authenticatedUserOwnsAsset;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const toggleLightbox = useCallback(() => {
    setIsLightboxOpen((prev) => !prev);
  }, []);

  return (
    <StyledBody isLightboxOpen={isLightboxOpen}>
      {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
      <StyledContentContainer>
        <StyledAssetAndNoteContainer>
          <Container>
            <TokenDetailAsset
              tokenRef={token}
              hasExtraPaddingForNote={showCollectorsNoteComponent}
              toggleLightbox={toggleLightbox}
              isLightboxOpen={isLightboxOpen}
            />
          </Container>

          {!isMobileOrMobileLarge && token?.collectorsNote && (
            <StyledContainer footerHeight={GLOBAL_FOOTER_HEIGHT}>
              <NoteViewer nftCollectorsNote={token?.collectorsNote || ''} />
            </StyledContainer>
          )}
        </StyledAssetAndNoteContainer>
        <NftDetailText
          queryRef={query}
          tokenRef={token}
          authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
          toggleLightbox={toggleLightbox}
        />

        {isMobileOrMobileLarge && token?.collectorsNote && (
          <StyledContainer footerHeight={GLOBAL_FOOTER_HEIGHT}>
            <NoteViewer nftCollectorsNote={token?.collectorsNote || ''} />
          </StyledContainer>
        )}
      </StyledContentContainer>
      {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
    </StyledBody>
  );
}

const StyledBody = styled.div<{ isLightboxOpen: boolean }>`
  display: flex;
  width: 100%;

  // increase z-index when light box is open so that it sits above the modal close button
  ${({ isLightboxOpen }) => isLightboxOpen && 'overflow:hidden; z-index: 5;'}
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    justify-content: center;
    gap: 0 48px;
  }
`;

const Container = styled.div`
  min-width: 0;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  margin-top: 24px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0;
    margin-top: 0;
  }
`;

const StyledAssetAndNoteContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;

  @media only screen and ${breakpoints.tablet} {
    max-width: min(80vh, 800px);
  }
`;

// We position the arrows using position absolute (so they reach the page bounds)
// But we still want there to be space taken up in the document flow, so that the arrows do not overlap with content
// This container simply creates space for the arrows to be positioned
const StyledNavigationBuffer = styled.div`
  width: 80px;
`;
