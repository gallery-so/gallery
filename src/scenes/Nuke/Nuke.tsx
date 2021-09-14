import { memo, useEffect } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Heading } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import Page from 'components/core/Page/Page';
import { useAuthActions } from 'contexts/auth/AuthContext';

// Suggest a user visit this page if they're in a seriously broken state
function Nuke(_: RouteComponentProps) {
  const { logOut } = useAuthActions();

  useEffect(logOut, [logOut]);

  return (
    <Page centered>
      <Heading>Your local cache has been nuked</Heading>
      <Spacer height={32} />
      <Link to="/">
        <StyledButton text="Take me home" />
      </Link>
    </Page>
  );
}

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default memo(Nuke);
