import breakpoints, {
  contentSize,
  pageGutter,
} from 'components/core/breakpoints';
import styled from 'styled-components';
import { Gallery } from 'types/Gallery';
import { User } from 'types/User';
import UserGalleryCollections from './UserGalleryCollections';
import UserGalleryHeader from './UserGalleryHeader';
import EmptyGallery from './EmptyGallery';
import Spacer from 'components/core/Spacer/Spacer';

type Props = {
  user: User;
  gallery: Gallery;
  isAuthenticatedUsersPage: boolean;
};

function UserGallery({ user, gallery, isAuthenticatedUsersPage }: Props) {
  const collectionsView = gallery ? (
    <UserGalleryCollections
      collections={gallery.collections}
      isAuthenticatedUsersPage={isAuthenticatedUsersPage}
    />
  ) : (
    <EmptyGallery message="This user has not set up their gallery yet." />
  );

  return (
    <StyledUserGallery>
      <Spacer height={112} />
      <UserGalleryHeader
        user={user}
        isAuthenticatedUsersPage={isAuthenticatedUsersPage}
      />
      {collectionsView}
    </StyledUserGallery>
  );
}

const StyledUserGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  max-width: ${contentSize.desktop}px;
`;

export default UserGallery;
