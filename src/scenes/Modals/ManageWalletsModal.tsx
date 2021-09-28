import ManageWallets from 'components/ManageWallets/ManageWallets';
import styled from 'styled-components';

type Props = {
  newAddress?: string;
};

function ManageWalletsModal({ newAddress }: Props) {
  return (
    <StyledManageWalletsModal>
      <ManageWallets newAddress={newAddress}/>
    </StyledManageWalletsModal>
  );
}

const StyledManageWalletsModal = styled.div`
  width: 480px;
`;

export default ManageWalletsModal;
