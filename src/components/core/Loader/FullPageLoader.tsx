import styled from 'styled-components';
import Loader from './Loader';

export default function FullPageLoader() {
  return (
    <StyledFullPageLoader>
      <Loader size="large" extraThicc />
    </StyledFullPageLoader>
  );
}

const StyledFullPageLoader = styled.div`
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
`;
