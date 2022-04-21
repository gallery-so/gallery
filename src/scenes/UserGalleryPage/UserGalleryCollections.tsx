import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

import { Fragment, useMemo } from 'react';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';
import { DisplayLayout } from 'components/core/enums';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryCollectionsFragment$key } from '__generated__/UserGalleryCollectionsFragment.graphql';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { UserGalleryCollectionsQueryFragment$key } from '__generated__/UserGalleryCollectionsQueryFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';

type Props = {
  galleryRef: UserGalleryCollectionsFragment$key;
  queryRef: UserGalleryCollectionsQueryFragment$key;
  mobileLayout: DisplayLayout;
};

const COLLECTION_SPACING = 48;

function UserGalleryCollections({ galleryRef, queryRef, mobileLayout }: Props) {
  const query = useFragment(
    graphql`
      fragment UserGalleryCollectionsQueryFragment on Query {
        ...useLoggedInUserIdFragment
        ...UserGalleryCollectionQueryFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);

  const { collections, owner } = useFragment(
    graphql`
      fragment UserGalleryCollectionsFragment on Gallery {
        owner {
          id
        }
        collections {
          id
          hidden
          nfts {
            __typename
          }
          ...UserGalleryCollectionFragment
        }
      }
    `,
    galleryRef
  );

  const isAuthenticatedUsersPage = loggedInUserId === owner?.id;

  const nonNullCollections = removeNullValues(collections);

  const visibleCollections = useMemo(
    () => nonNullCollections.filter((collection) => !collection.hidden && collection.nfts?.length),
    [nonNullCollections]
  );

  if (visibleCollections.length === 0) {
    const emptyGalleryMessage = isAuthenticatedUsersPage
      ? 'Your gallery is empty. Display your NFTs by creating a collection.'
      : 'Curation in progress.';

    return <EmptyGallery message={emptyGalleryMessage} />;
  }

  return (
    <StyledUserGalleryCollections>
      <Spacer height={32} />
      {visibleCollections.map((collection, index) => (
        <Fragment key={collection.id}>
          <Spacer height={index === 0 ? 16 : COLLECTION_SPACING} />
          <UserGalleryCollection
            queryRef={query}
            collectionRef={collection}
            mobileLayout={mobileLayout}
          />
          <Spacer height={index === nonNullCollections.length - 1 ? COLLECTION_SPACING : 0} />
        </Fragment>
      ))}
    </StyledUserGalleryCollections>
  );
}

const StyledUserGalleryCollections = styled.div`
  width: 100%;
`;

export default UserGalleryCollections;
