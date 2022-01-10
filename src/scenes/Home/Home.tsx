import { memo, useCallback } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import Page from 'components/core/Page/Page';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import { useRouter } from 'next/router';

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
      <StyledButton text="Enter" onClick={handleEnterGallery} />
    </Page>
  );
}

const StyledButton = styled(Button)`
  width: 200px;
`;

export default memo(Home);
