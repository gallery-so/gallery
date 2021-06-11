import { memo } from 'react';

import { RouteComponentProps, Redirect } from '@reach/router';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import Page from 'components/core/Page/Page';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

function Auth(_: RouteComponentProps) {
  // whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();
  // whether the user is web3-authenticated
  const isAuthenticated = useIsAuthenticated();
  // TODO: we need a third hook, `useUser()`, that will determine if the
  // user exists in the database so we can do something like below:
  // const user = useUser();
  // const userExists = !!user;
  // const username = user?.username;
  const userExists = false;
  const username = '0x70d04384b5c3a466ec4d8cfb8213efc31c6a9d15';

  if (isAuthenticated) {
    // if user exists in DB, send them to their profile
    if (userExists) return <Redirect to={`/${username}`} />;
    // if user is authenticated but doesn't have an account with us yet,
    // take them through the welcome flow
    return <Redirect noThrow to="/welcome" />;
  }

  if (!isPasswordValidated) {
    return <Redirect noThrow to="/password" />;
  }

  return (
    <Page centered withRoomForFooter={false}>
      <WalletSelector />
    </Page>
  );
}

export default memo(Auth);
