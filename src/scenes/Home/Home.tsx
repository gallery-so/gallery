import { RouteComponentProps } from '@reach/router';
import { memo } from 'react';
import styled from 'styled-components';

function Home(_: RouteComponentProps) {
  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  // const { data, error } = useSwr('/test');
  // console.log('the result', data, error);

  return (
    <StyledHome>
      <StyledHeader>GALLERY</StyledHeader>
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
