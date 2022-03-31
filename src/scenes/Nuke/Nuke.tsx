import { memo, useEffect } from 'react';
import styled from 'styled-components';
import { BaseXL } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import Page from 'components/core/Page/Page';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { useSWRConfig } from 'swr';

// Suggest a user visit this page if they're in a seriously broken state
function Nuke() {
  const { logOut } = useAuthActions();
  const { cache } = useSWRConfig();

  useEffect(() => {
    // @ts-expect-error `clear` method not described in SWR types, but it's available
    cache.clear();
    logOut();
  }, [logOut, cache]);

  return (
    <Page centered>
      <BaseXL>Your local cache has been nuked</BaseXL>
      <Spacer height={32} />
      <GalleryLink to="/">
        <StyledButton text="Take me home" />
      </GalleryLink>
    </Page>
  );
}

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default memo(Nuke);
