import { memo } from 'react';

import { RouteComponentProps, Redirect } from '@reach/router';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import Page from 'components/core/Page/Page';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import { useAuthenticatedUser } from 'hooks/api/useUser';

function Auth(_: RouteComponentProps) {
  // whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();
  // whether the user is web3-authenticated
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthenticatedUser();
  const username = user?.username;

  if (!isPasswordValidated) {
    return <Redirect noThrow to="/password" />;
  }

  if (isAuthenticated) {
    // if user exists in DB, send them to their profile
    if (username) return <Redirect to={`/${username}`} />;
    // if user is authenticated but hasn't set their username yet.
    // we should continue to take them through the welcome flow. 
    // this can happen if a user signs up and has a valid jwt but 
    // hasn't set their username yet.
    return <Redirect noThrow to="/welcome" />;
  }

  return (
    <Page centered withRoomForFooter={false}>
      <WalletSelector />
    </Page>
  );
}

export default memo(Auth);
