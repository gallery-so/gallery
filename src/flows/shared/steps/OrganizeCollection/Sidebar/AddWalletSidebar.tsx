import { Button } from 'components/core/Button/Button';
import { VStack } from 'components/core/Spacer/Stack';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import { AddWalletSidebarQueryFragment$key } from '__generated__/AddWalletSidebarQueryFragment.graphql';

type Props = {
  queryRef: AddWalletSidebarQueryFragment$key;
};

export function AddWalletSidebar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment AddWalletSidebarQueryFragment on Query {
        ...ManageWalletsModalFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  const handleManageWalletsClick = useCallback(() => {
    showModal({ content: <ManageWalletsModal queryRef={query} />, headerText: 'Manage accounts' });
  }, [query, showModal]);

  return (
    <VStack align="center" grow justify="center">
      <Button variant="secondary" onClick={handleManageWalletsClick}>
        Connect Tezos Wallet
      </Button>
    </VStack>
  );
}
