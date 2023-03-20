import styled from 'styled-components';

import CapitalGLoader from './CapitalGLoader';

export default function FullPageLoader() {
  return (
    <StyledFullPageLoader>
      <CapitalGLoader />
    </StyledFullPageLoader>
  );
}

const StyledFullPageLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`;
