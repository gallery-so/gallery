import { memo } from 'react';
import styled from 'styled-components';

import { RouteComponentProps, Redirect } from '@reach/router';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

function Auth(_: RouteComponentProps) {
  // whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();
  // whether the user is web3-authenticated
  const isAuthenticated = useIsAuthenticated();
  // TODO: useIsAuthenticated should return the username (or wallet address)
  // if indeed authenticated - we should redirect there
  const username = '0x70d04384b5c3a466ec4d8cfb8213efc31c6a9d15';

  // if (isAuthenticated) {
  //   return <Redirect to={`/${username}`} />;
  // }

  if (!isPasswordValidated) {
    return <Redirect to="/password" />;
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
