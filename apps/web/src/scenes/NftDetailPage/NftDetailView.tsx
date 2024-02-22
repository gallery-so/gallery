import { useCallback, useRef, useState } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { NftFailureFallback } from '~/components/NftFailureFallback/NftFailureFallback';
import ErrorBoundary from '~/contexts/boundary/ErrorBoundary';
import { NftDetailViewFragment$key } from '~/generated/NftDetailViewFragment.graphql';
import { NftDetailViewQuery } from '~/generated/NftDetailViewQuery.graphql';
import { NftDetailViewQueryFragment$key } from '~/generated/NftDetailViewQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import TokenViewEmitter from '~/shared/components/TokenViewEmitter';

import NftDetailAsset from './NftDetailAsset';
import NftDetailNote from './NftDetailNote';
import NftDetailText from './NftDetailText';

type Props = {
  authenticatedUserOwnsAsset: boolean;
  queryRef: NftDetailViewQueryFragment$key;
  collectionTokenRef: NftDetailViewFragment$key;
  visibility?: string;
  toggleLightbox: () => void;
  isLightboxOpen: boolean;
};

type LoadableNftDetailViewProps = {
  tokenId: string;
  collectionId: string;
} & Omit<Props, 'collectionTokenRef'>;

export function LoadableNftDetailView({
  tokenId,
  collectionId,
  ...props
}: LoadableNftDetailViewProps) {
  const query = useLazyLoadQuery<NftDetailViewQuery>(
    graphql`
      query NftDetailViewQuery($tokenId: DBID!, $collectionId: DBID!) {
        collectionTokenById(tokenId: $tokenId, collectionId: $collectionId) {
          ...NftDetailViewFragment
        }
        ...NftDetailViewQueryFragment
      }
    `,
    { tokenId: tokenId, collectionId: collectionId }
  );

  if (!query.collectionTokenById) {
    return null;
  }

  return <NftDetailView collectionTokenRef={query.collectionTokenById} {...props} />;
}

export default function NftDetailView({
  authenticatedUserOwnsAsset,
  queryRef,
  collectionTokenRef,
  visibility = 'visible',
  toggleLightbox,
  isLightboxOpen,
}: Props) {
  const collectionNft = useFragment(
    graphql`
      fragment NftDetailViewFragment on CollectionToken {
        token @required(action: THROW) {
          dbid
          collectorsNote

          ...NftDetailTextFragment
        }
        collection @required(action: THROW) {
          dbid
        }
        ...NftDetailAssetFragment
      }
    `,
    collectionTokenRef
  );

  const query = useFragment(
    graphql`
      fragment NftDetailViewQueryFragment on Query {
        ...NftDetailTextQueryFragment
      }
    `,
    queryRef
  );

  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const { token, collection } = collectionNft;

  const assetHasNote = Boolean(token.collectorsNote);
  const showCollectorsNoteComponent = assetHasNote || authenticatedUserOwnsAsset;

  return (
    <StyledBody>
      <TokenViewEmitter collectionID={collection.dbid} tokenID={token.dbid} />
      {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
      <StyledContentContainer id="detail-view-content">
        <StyledVStack>
          <StyledAssetAndNoteContainer>
            <Container>
              <ErrorBoundary fallback={<NftFailureFallback tokenId={token.dbid} />}>
                <NftDetailAsset
                  tokenRef={collectionNft}
                  hasExtraPaddingForNote={showCollectorsNoteComponent}
                  visibility={visibility}
                  toggleLightbox={toggleLightbox}
                  isLightboxOpen={isLightboxOpen}
                />
              </ErrorBoundary>
            </Container>
          </StyledAssetAndNoteContainer>
          {!isMobileOrMobileLarge && showCollectorsNoteComponent && (
            <NotePositionWrapper>
              <NftDetailNote
                tokenId={token.dbid}
                authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
                nftCollectorsNote={token.collectorsNote ?? ''}
                collectionId={collection.dbid}
              />
            </NotePositionWrapper>
          )}
        </StyledVStack>

        <NftDetailText
          queryRef={query}
          tokenRef={token}
          authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
          toggleLightbox={toggleLightbox}
        />
        {isMobileOrMobileLarge && showCollectorsNoteComponent && (
          <NftDetailNote
            tokenId={token.dbid}
            authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
            nftCollectorsNote={token.collectorsNote ?? ''}
            collectionId={collection.dbid}
          />
        )}
      </StyledContentContainer>
      {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
    </StyledBody>
  );
}

const StyledBody = styled.div`
  display: flex;
  width: 100%;
`;

const StyledVStack = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  width: 100%;
  max-width: min(80vh, 800px);
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
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  margin-top: 24px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0;
    margin: 0;
  }
`;

const StyledAssetAndNoteContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NotePositionWrapper = styled.div`
  @media only screen and ${breakpoints.tablet} {
    position: relative;
    height: 0;
  }
`;

// We position the arrows using position absolute (so they reach the page bounds)
// But we still want there to be space taken up in the document flow, so that the arrows do not overlap with content
// This container simply creates space for the arrows to be positioned
const StyledNavigationBuffer = styled.div`
  width: 80px;
`;
