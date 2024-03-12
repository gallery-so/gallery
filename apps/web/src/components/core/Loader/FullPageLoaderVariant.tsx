import styled from 'styled-components';

import FarcasterIcon from '~/icons/FarcasterIcon';

import CapitalGLoader from './CapitalGLoader';

export default function FullPageLoaderVariant() {
  return (
    <StyledFullPageLoader>
      <CapitalGLoader />
      <FarcasterIcon />
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
