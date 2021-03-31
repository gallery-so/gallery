import { memo, ReactNode } from 'react';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import GlobalNavbar from 'components/GlobalNavbar/GlobalNavbar';

type Props = {
  children: ReactNode;
};

function AppContainer({ children }: RouteComponentProps & Props) {
  return (
    <StyledHome>
      <GlobalNavbar />
      {children}
    </StyledHome>
  );
}

// if we wanna do global styling
const StyledHome = styled.div``;

export default memo(AppContainer);
