import { memo } from 'react';
import styled from 'styled-components';
import useSwr from 'swr';
import './Home.css';

function Home() {
  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  const { data, error } = useSwr('/test');
  console.log('the result', data, error);

  return (
    <StyledHome>
      <StyledHeader>GALLERY</StyledHeader>
    </StyledHome>
  );
}

const StyledHome = styled.div`
  text-align: center;
`;

const StyledHeader = styled.p`
  color: white;
  font-size: 30px;
`;

export default memo(Home);
