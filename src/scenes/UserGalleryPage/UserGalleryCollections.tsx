import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

import { Collection } from 'types/Collection';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';

type Props = {
  collections: Collection[];
  isAuthenticatedUsersPage: boolean;
};

function UserGalleryCollections({
  collections,
  isAuthenticatedUsersPage,
}: Props) {
  if (!collections.length) {
    const noCollectionsMessage = isAuthenticatedUsersPage
      ? 'Your gallery is empty. Display your NFTs by creating a collection.'
      : 'This user has not added any collections to their gallery yet.';

    return <EmptyGallery message={noCollectionsMessage} />;
  }

  // TODO: Consider extracting 48 and 108 into unit consts
  return (
    <StyledUserGalleryCollections>
      {collections.map((collection, index) => (
        <>
          <Spacer height={index === 0 ? 48 : 108} />
          <UserGalleryCollection collection={collection} />
          <Spacer height={index === collections.length - 1 ? 108 : 0} />
        </>
      ))}
    </StyledUserGalleryCollections>
  );
}

const StyledUserGalleryCollections = styled.div`
  width: 100%;
`;

export default UserGalleryCollections;
