import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { Redirect, RouteComponentProps } from '@reach/router';
import Page from 'components/core/Page/Page';
import useGalleries from 'hooks/api/useGalleries';
import useUser, { useAuthenticatedUser } from 'hooks/api/useUser';
import styled from 'styled-components';
import UserGallery from './UserGallery';

type Params = {
  username: string;
};

function UserGalleryPage({ username }: RouteComponentProps<Params>) {
  const user = useUser({ username });
  const galleries = useGalleries({ userId: user?.id }) || [];
  const authenticatedUser = useAuthenticatedUser();

  if (!user) {
    return <Redirect to="/404" noThrow />;
  }

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
