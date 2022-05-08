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

  // the following ensures the loader appears above the nav/footer;
  // without this, the nav/footer would appear before the main content
  // if the content takes a while to load.
  position: relative;
  z-index: 4;
  background: white;
`;
