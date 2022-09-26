import breakpoints from 'components/core/breakpoints';
import ManageWallets from 'components/ManageWallets/ManageWallets';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { ManageWalletsModalFragment$key } from '__generated__/ManageWalletsModalFragment.graphql';

type Props = {
  queryRef: ManageWalletsModalFragment$key;
  newAddress?: string;
  onTezosAddWalletSuccess?: () => void;
};

function ManageWalletsModal({ newAddress, queryRef, onTezosAddWalletSuccess }: Props) {
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
        onTezosAddWalletSuccess={onTezosAddWalletSuccess}
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
