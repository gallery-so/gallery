import breakpoints from 'components/core/breakpoints';
import ManageWallets from 'components/ManageWallets/ManageWallets';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { ManageWalletsModalFragment$key } from '__generated__/ManageWalletsModalFragment.graphql';

type Props = {
  queryRef: ManageWalletsModalFragment$key;
  newAddress?: string;
};

function ManageWalletsModal({ newAddress, queryRef }: Props) {
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
      <ManageWallets queryRef={query} newAddress={newAddress} />
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
