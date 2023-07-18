import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { NftDetailViewFragment$key } from '~/generated/NftDetailViewFragment.graphql';
import { NftDetailViewQuery } from '~/generated/NftDetailViewQuery.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import NftDetailAsset from './NftDetailAsset';
import NftDetailNote from './NftDetailNote';
import NftDetailText from './NftDetailText';

type Props = {
  authenticatedUserOwnsAsset: boolean;
  collectionTokenRef: NftDetailViewFragment$key;
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
      }
    `,
    { tokenId: tokenId, collectionId: collectionId }
  );

  if (!query.collectionTokenById) {
    return null;
  }

  return <NftDetailView collectionTokenRef={query.collectionTokenById} {...props} />;
}

export default function NftDetailView({ authenticatedUserOwnsAsset, collectionTokenRef }: Props) {
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

  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const { token, collection } = collectionNft;

  const assetHasNote = !!token.collectorsNote;
  const showCollectorsNoteComponent = assetHasNote || authenticatedUserOwnsAsset;

  return (
    <StyledBody>
      {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
      <StyledContentContainer>
        <StyledAssetAndNoteContainer>
          <ShimmerProvider>
            <NftDetailAsset
              tokenRef={collectionNft}
              hasExtraPaddingForNote={showCollectorsNoteComponent}
            />
          </ShimmerProvider>
          {showCollectorsNoteComponent && (
            <NftDetailNote
              tokenId={token.dbid}
              authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
              nftCollectorsNote={token.collectorsNote ?? ''}
              collectionId={collection.dbid}
            />
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
