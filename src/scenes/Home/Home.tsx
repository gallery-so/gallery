import { memo, useCallback } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import Page from 'components/core/Page/Page';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import { useRouter } from 'next/router';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import TextButton from 'components/core/Button/TextButton';
import Spacer from 'components/core/Spacer/Spacer';

function Home() {
  const { push } = useRouter();

  const handleEnterGallery = useCallback(() => {
    // If the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    void push('/auth');
  }, [push]);

  return (
    <Page centered>
      <GalleryIntro />
      <Spacer height={24} />
      <StyledButton text="Sign In" onClick={handleEnterGallery} dataTestId="sign-in-button" />
      <Spacer height={24} />
      <GalleryLink to="/members">
        <TextButton text="explore galleries" dataTestId="explore-button" />
      </GalleryLink>
      <Spacer height={8} />
      <GalleryLink to="/hamsun">
        <TextButton text="gallery of the week" />
      </GalleryLink>
    </Page>
  );
}

const StyledButton = styled(Button)`
  width: 150px;
`;

export default memo(Home);
