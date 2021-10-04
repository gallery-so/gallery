import { navigate, RouteComponentProps } from '@reach/router';
import { memo, useCallback } from 'react';
import styled from 'styled-components';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import Button from 'components/core/Button/Button';
import Page from 'components/core/Page/Page';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

function Home(_: RouteComponentProps) {
  // Whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();

  const handleEnterGallery = useCallback(() => {
    // If the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    void navigate('/auth');
  }, []);

  if (!isPasswordValidated) {
    return <GalleryRedirect to="/password" />;
  }

  return (
    <Page centered>
      <GalleryIntro />
      <StyledButton text="Enter" onClick={handleEnterGallery} />
    </Page>
  );
}

const StyledButton = styled(Button)`
  width: 200px;
`;

export default memo(Home);
