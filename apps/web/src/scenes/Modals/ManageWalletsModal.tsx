import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import ManageWallets from '~/components/ManageWallets/ManageWallets';
import { OnConnectWalletSuccessFn } from '~/components/WalletSelector/multichain/MultichainWalletSelector';
import { ManageWalletsModalFragment$key } from '~/generated/ManageWalletsModalFragment.graphql';

type Props = {
  queryRef: ManageWalletsModalFragment$key;
  newAddress?: string;
  onConnectWalletSuccess?: OnConnectWalletSuccessFn;
};

function ManageWalletsModal({ newAddress, queryRef, onConnectWalletSuccess }: Props) {
  const query = useFragment(
    graphql`
      fragment ManageWalletsModalFragment on Query {
        ...ManageWalletsFragment
      }
    `,
    queryRef
  );

  return (
    <StyledManageWalletsModal>
      <ManageWallets
        queryRef={query}
        newAddress={newAddress}
        onConnectWalletSuccess={onConnectWalletSuccess}
      />
    </StyledManageWalletsModal>
  );
}

const StyledManageWalletsModal = styled.div`
  width: 300px;

  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

export default ManageWalletsModal;
