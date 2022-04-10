import ActionText from 'components/core/ActionText/ActionText';
import breakpoints from 'components/core/breakpoints';
import Spacer from 'components/core/Spacer/Spacer';
import ManageWallets from 'components/ManageWallets/ManageWallets';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { useModal } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';
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

  const { hideModal } = useModal();
  const { logOut } = useAuthActions();

  const handleLogOut = useCallback(() => {
    void logOut();
    void hideModal();
  }, [hideModal, logOut]);

  return (
    <StyledManageWalletsModal>
      <ManageWallets queryRef={query} newAddress={newAddress} />
      <Spacer height={24}></Spacer>
      <SignOutWrapper>
        <ActionText onClick={handleLogOut}>Sign out</ActionText>
      </SignOutWrapper>
    </StyledManageWalletsModal>
  );
}

const StyledManageWalletsModal = styled.div`
  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const SignOutWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export default ManageWalletsModal;
