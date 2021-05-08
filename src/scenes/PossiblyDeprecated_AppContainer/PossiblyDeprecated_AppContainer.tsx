import { memo, ReactNode, useMemo } from 'react';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import GlobalNavbar from 'components/GlobalNavbar/GlobalNavbar';

type Props = {
  children: ReactNode;
};

const ROUTES_WITHOUT_NAVBAR = ['/create'];

function AppContainer({ children, location }: RouteComponentProps & Props) {
  const shouldDisplayNavbar = useMemo(() => {
    return !ROUTES_WITHOUT_NAVBAR.includes(location?.pathname ?? '');
  }, [location?.pathname]);

  return (
    <StyledAppContainer>
      {shouldDisplayNavbar && <GlobalNavbar />}
      {children}
    </StyledAppContainer>
  );
}

// if we wanna do global styling
const StyledAppContainer = styled.div``;

export default memo(AppContainer);
