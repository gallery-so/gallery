import { memo } from 'react';
import styled from 'styled-components';

import { RouteComponentProps, Redirect } from '@reach/router';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import { useAuthenticatedUser } from 'hooks/api/useUser';

function Auth(_: RouteComponentProps) {
  // whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();
  // whether the user is web3-authenticated
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthenticatedUser();
  const userExists = !!user;

  if (isAuthenticated) {
    // if user exists in DB, send them to their profile
    if (userExists) return <Redirect to={`/${user?.username}`} />;
    // if user is authenticated but doesn't have an account with us yet,
    // take them through the welcome flow
    return <Redirect noThrow to="/welcome" />;
  }

  if (!isPasswordValidated) {
    return <Redirect noThrow to="/password" />;
  }

  return (
    <StyledAuth>
      <WalletSelector />
    </StyledAuth>
  );
}

const StyledAuth = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export default memo(Auth);
