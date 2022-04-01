import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

import { Collection } from 'types/Collection';
import { Fragment, useMemo } from 'react';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';
import { DisplayLayout } from 'components/core/enums';

type Props = {
  collections: Collection[];
  isAuthenticatedUsersPage: boolean;
  mobileLayout: DisplayLayout;
  __APRIL_FOOLS__hexEnabled__: boolean;
};

const COLLECTION_SPACING = 48;

function UserGalleryCollections({
  collections,
  isAuthenticatedUsersPage,
  mobileLayout,
  __APRIL_FOOLS__hexEnabled__,
}: Props) {
  const visibleCollections = useMemo(
    () => collections.filter((collection) => !collection.hidden && collection.nfts?.length > 0),
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
          <UserGalleryCollection
            collection={collection}
            mobileLayout={mobileLayout}
            __APRIL_FOOLS__hexEnabled__={__APRIL_FOOLS__hexEnabled__}
          />
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
