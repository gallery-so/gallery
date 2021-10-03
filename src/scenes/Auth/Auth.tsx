import { memo } from 'react';

import { RouteComponentProps, Redirect } from '@reach/router';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import Page from 'components/core/Page/Page';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import { usePossiblyAuthenticatedUser } from 'hooks/api/users/useUser';
import { Caption } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

function Auth(_: RouteComponentProps) {
  // Whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();
  // Whether the user is web3-authenticated
  const isAuthenticated = useIsAuthenticated();
  const user = usePossiblyAuthenticatedUser();
  const username = user?.username;

  if (!isPasswordValidated) {
    return <Redirect noThrow to="/password" />;
  }

  if (isAuthenticated) {
    // If user exists in DB, send them to their profile
    if (username) {
      return <Redirect to={`/${username}`} />;
    }

    // If user is authenticated but hasn't set their username yet.
    // we should continue to take them through the welcome flow.
    // this can happen if a user signs up and has a valid jwt but
    // hasn't set their username yet.
    return <Redirect noThrow to="/welcome" />;
  }

  return (
    <Page centered withNavbarInView={false} withFooterInView={false}>
      <StyledWalletSelectorWrapper>
        <WalletSelector />
      </StyledWalletSelectorWrapper>
      <Caption color={colors.gray50}>
        Gallery is non-custodial and secure. We will never request access to
        your NFTs.
      </Caption>
      <Spacer height={16} />
    </Page>
  );
}

const StyledWalletSelectorWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`;

export default memo(Auth);
