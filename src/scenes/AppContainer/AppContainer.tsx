import { memo, ReactNode } from 'react';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import GlobalNavbar from 'components/GlobalNavbar/GlobalNavbar';

type Props = {
  children: ReactNode;
};

function AppContainer({ children }: RouteComponentProps & Props) {
  return (
    <StyledAppContainer>
      <GlobalNavbar />
      {children}
    </StyledAppContainer>
  );
}

// if we wanna do global styling
const StyledAppContainer = styled.div`
  padding: 80px;
`;

export default memo(AppContainer);
