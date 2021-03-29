import { memo, ReactNode } from 'react';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import useSwr from 'swr';
import GlobalNavbar from 'components/GlobalNavbar/GlobalNavbar';

type Props = {
  children: ReactNode;
};

function Home({ children }: RouteComponentProps & Props) {
  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  // const { data, error } = useSwr('/test');
  // console.log('the result', data, error);

  return (
    <StyledHome>
      <GlobalNavbar />
      <StyledHeader>GALLERY</StyledHeader>
      {children}
    </StyledHome>
  );
}

// if we wanna do global styling
const StyledHome = styled.div``;

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 30px;
`;

export default memo(Home);
