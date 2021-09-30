import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

import { Collection } from 'types/Collection';
import { Fragment, useMemo } from 'react';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';

type Props = {
  collections: Collection[];
  isAuthenticatedUsersPage: boolean;
};

const COLLECTION_SPACING = 48;

function UserGalleryCollections({
  collections,
  isAuthenticatedUsersPage,
}: Props) {
  const filteredCollections = useMemo(() => collections.filter(collection => !collection.hidden), [collections]);

  if (collections.length === 0) {
    const noCollectionsMessage = isAuthenticatedUsersPage
      ? 'Your gallery is empty. Display your NFTs by creating a collection.'
      : 'This user has not added any collections to their gallery yet.';

    return <EmptyGallery message={noCollectionsMessage} />;
  }

  return (
    <StyledUserGalleryCollections>
      {filteredCollections.map((collection, index) => (
        <Fragment key={collection.id}>
          <Spacer height={COLLECTION_SPACING} />
          <UserGalleryCollection collection={collection} />
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
