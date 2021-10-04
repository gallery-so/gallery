import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { RouteComponentProps } from '@reach/router';
import Page from 'components/core/Page/Page';
import styled from 'styled-components';
import UserGallery from './UserGallery';
import UserGalleryPageErrorBoundary from './UserGalleryPageErrorBoundary';

type Props = {
  username: string;
};

function UserGalleryPage({ username }: RouteComponentProps<Props>) {
  return (
    <UserGalleryPageErrorBoundary>
      <Page>
        <StyledUserGalleryWrapper>
          <UserGallery username={username} />
        </StyledUserGalleryWrapper>
      </Page>
    </UserGalleryPageErrorBoundary>
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
