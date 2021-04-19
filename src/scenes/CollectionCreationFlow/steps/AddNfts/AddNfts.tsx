import styled from 'styled-components';

import Sidebar from './Sidebar';
import Editor from './Editor';

function AddNfts() {
  return (
    <StyledAddNfts>
      <Sidebar />
      <Editor />
    </StyledAddNfts>
  );
}

const StyledAddNfts = styled.div`
  display: flex;
`;

export default AddNfts;
