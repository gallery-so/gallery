import breakpoints from 'components/core/breakpoints';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { NftDetailViewFragment$key } from '__generated__/NftDetailViewFragment.graphql';
import NftDetailAsset from './NftDetailAsset';
import NftDetailNote from './NftDetailNote';
import NftDetailText from './NftDetailText';

type Props = {
  authenticatedUserOwnsAsset: boolean;
  queryRef: NftDetailViewFragment$key;
};

export default function NftDetailView({ authenticatedUserOwnsAsset, queryRef }: Props) {
  const collectionNft = useFragment(
    graphql`
      fragment NftDetailViewFragment on CollectionToken {
        token @required(action: THROW) {
          dbid
          name
          description
          contract {
            name
            contractAddress {
              address
            }
          }
          tokenId
          externalUrl
          collectorsNote

          ...NftDetailTextFragment
        }
        collection @required(action: THROW) {
          dbid
        }
        ...NftDetailAssetFragment
      }
    `,
    queryRef
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

        <NftDetailText tokenRef={token} />
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
