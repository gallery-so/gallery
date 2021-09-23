import ManageWallets from 'components/ManageWallets/ManageWallets';
import styled from 'styled-components';

function ManageWalletsModal() {
  return (
    <StyledManageWalletsModal>
      <ManageWallets/>
    </StyledManageWalletsModal>
  );
}

const StyledManageWalletsModal = styled.div`
  width: 480px;
`;

export default ManageWalletsModal;
