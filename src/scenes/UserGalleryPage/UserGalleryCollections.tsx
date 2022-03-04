import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

import { Fragment, useMemo } from 'react';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';
import { DisplayLayout } from 'components/core/enums';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryCollectionsFragment$key } from '../../../__generated__/UserGalleryCollectionsFragment.graphql';

type Props = {
  collectionRefs: UserGalleryCollectionsFragment$key;
  isAuthenticatedUsersPage: boolean;
  mobileLayout: DisplayLayout;
};

const COLLECTION_SPACING = 48;

function UserGalleryCollections({ collectionRefs, isAuthenticatedUsersPage, mobileLayout }: Props) {
  const collections = useFragment(
    graphql`
      fragment UserGalleryCollectionsFragment on GalleryCollection @relay(plural: true) {
        id
        hidden
        nfts {
          __typename
        }
        ...UserGalleryCollectionFragment
      }
    `,
    collectionRefs
  );

  const visibleCollections = useMemo(
    () => collections.filter((collection) => !collection.hidden && collection.nfts?.length),
    [collections]
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
          <UserGalleryCollection collectionRef={collection} mobileLayout={mobileLayout} />
          <Spacer height={index === collections.length - 1 ? COLLECTION_SPACING : 0} />
        </Fragment>
      ))}
    </StyledUserGalleryCollections>
  );
}

const StyledUserGalleryCollections = styled.div`
  width: 100%;
`;

export default UserGalleryCollections;
