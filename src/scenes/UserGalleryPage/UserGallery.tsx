import { contentSize } from 'components/core/breakpoints';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import useUser, { usePossiblyAuthenticatedUser } from 'hooks/api/users/useUser';
import useGalleries from 'hooks/api/galleries/useGalleries';
import NotFound from 'scenes/NotFound/NotFound';
import UserGalleryCollections from './UserGalleryCollections';
import UserGalleryHeader from './UserGalleryHeader';
import EmptyGallery from './EmptyGallery';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useMobileLayout from 'hooks/useMobileLayout';
import useKeyDown from 'hooks/useKeyDown';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

type Props = {
  username?: string;
};

function UserGallery({ username }: Props) {
  const user = useUser({ username });
  const [gallery] = useGalleries({ userId: user?.id ?? '' }) ?? [];
  const authenticatedUser = usePossiblyAuthenticatedUser();
  const isMobile = useIsMobileWindowWidth();
  const showMobileLayoutToggle = isMobile && gallery?.collections?.length > 0;
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const ePress = useKeyDown('e');

  const { push } = useRouter();
  const navigateToEdit = function () {
    void push(`/edit`);
  };

  useEffect(() => {
    if (ePress) {
      navigateToEdit();
    }
  }, [ePress]);

  if (!user) {
    return <NotFound />;
  }

  const isAuthenticatedUsersPage = user.username === authenticatedUser?.username;

  const collectionsView = gallery ? (
    <UserGalleryCollections
      collections={gallery.collections}
      isAuthenticatedUsersPage={isAuthenticatedUsersPage}
      mobileLayout={mobileLayout}
    />
  ) : (
    <EmptyGallery message="This user has not set up their gallery yet." />
  );

  return (
    <StyledUserGallery>
      <Spacer height={32} />
      <UserGalleryHeader
        username={user.username}
        bio={user.bio}
        showMobileLayoutToggle={showMobileLayoutToggle}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      {collectionsView}
      <Spacer height={32} />
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
