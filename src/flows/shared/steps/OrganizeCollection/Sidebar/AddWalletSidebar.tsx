import { Button } from 'components/core/Button/Button';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from 'components/core/Text/Text';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import { AddWalletSidebarQueryFragment$key } from '__generated__/AddWalletSidebarQueryFragment.graphql';
import { Chain } from 'flows/shared/steps/OrganizeCollection/Sidebar/chains';

type Props = {
  queryRef: AddWalletSidebarQueryFragment$key;
  selectedChain: Chain;
};

export function AddWalletSidebar({ selectedChain, queryRef }: Props) {
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

  const ctaButtonText = useMemo(() => {
    const renameEthAccounts = ['Ethereum', 'POAP'];

    let chain: string = selectedChain;
    if (renameEthAccounts.includes(selectedChain)) {
      chain = 'ETH';
    }

    return `Connect ${chain} account`;
  }, [selectedChain]);

  return (
    <VStack gap={8} align="center" grow justify="center">
      <VStack align="center">
        <TitleDiatypeL>It&apos;s looking empty</TitleDiatypeL>
        <BaseM>You do not have any {selectedChain} NFTs</BaseM>
      </VStack>
      <Button variant="secondary" onClick={handleManageWalletsClick}>
        {ctaButtonText}
      </Button>
    </VStack>
  );
}
