import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { Redirect, RouteComponentProps } from '@reach/router';
import Page from 'components/core/Page/Page';
import useGalleries from 'hooks/api/galleries/useGalleries';
import useUser, { usePossiblyAuthenticatedUser } from 'hooks/api/users/useUser';
import styled from 'styled-components';
import UserGallery from './UserGallery';

type Params = {
  username: string;
};

function UserGalleryPage({ username }: RouteComponentProps<Params>) {
  const user = useUser({ username });
  const galleries = useGalleries({ userId: user?.id }) || [];
  const authenticatedUser = usePossiblyAuthenticatedUser();

  if (!user) {
    return <Redirect to="/404" noThrow />;
  }

  // Consider turning into a hook
  const isAuthenticatedUsersPage =
    user.username === authenticatedUser?.username;

  return (
    <Page>
      <StyledUserGalleryWrapper>
        <UserGallery
          user={user}
          gallery={galleries[0]}
          isAuthenticatedUsersPage={isAuthenticatedUsersPage}
        />
      </StyledUserGalleryWrapper>
    </Page>
  );
}

const StyledUserGalleryWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default UserGalleryPage;
