import { memo } from 'react';
import styled from 'styled-components';
import { RouteComponentProps, Redirect } from '@reach/router';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

function Auth(_: RouteComponentProps) {
  const isAuthenticated = useIsAuthenticated();
  // TODO: useIsAuthenticated should return the username (or wallet address)
  // if indeed authenticated - we should redirect there
  const username = '0x70d04384b5c3a466ec4d8cfb8213efc31c6a9d15';

  // if (isAuthenticated) {
  //   return <Redirect to={`/${username}`} />;
  // }

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
