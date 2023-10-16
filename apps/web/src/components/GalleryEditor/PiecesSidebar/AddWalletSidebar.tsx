import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { AddWalletSidebarQueryFragment$key } from '~/generated/AddWalletSidebarQueryFragment.graphql';
import ManageWalletsModal from '~/scenes/Modals/ManageWalletsModal';
import { contexts } from '~/shared/analytics/constants';
import { Chain } from '~/shared/utils/chains';

type Props = {
  queryRef: AddWalletSidebarQueryFragment$key;
  selectedChain: Chain;
  handleRefresh: () => void;
};

export function AddWalletSidebar({ handleRefresh, selectedChain, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment AddWalletSidebarQueryFragment on Query {
        ...ManageWalletsModalFragment
      }
    `,
    queryRef
  );

  const { showModal, clearAllModals } = useModalActions();

  const onNewWallectConnected = useCallback(async () => {
    handleRefresh();
    clearAllModals();
  }, [handleRefresh, clearAllModals]);

  const handleManageWalletsClick = useCallback(() => {
    showModal({
      content: (
        <ManageWalletsModal queryRef={query} onConnectWalletSuccess={onNewWallectConnected} />
      ),
      headerText: 'Manage accounts',
    });
  }, [onNewWallectConnected, query, showModal]);

  const ctaButtonText = useMemo(() => {
    const renameEthAccounts = ['Ethereum', 'POAP'];

    let chain: string = selectedChain;
    if (renameEthAccounts.includes(selectedChain)) {
      chain = 'ETH';
    }

    return `Connect ${chain} account`;
  }, [selectedChain]);

  return (
    <VStack align="center" grow justify="center">
      <EmptyState
        title="It's looking empty"
        description={`You do not have any ${selectedChain} pieces`}
      >
        <StyledButtonContainer>
          <Button
            eventElementId="Open Add Wallet Modal Button"
            eventName="Open Add Wallet Modal"
            eventContext={contexts.Editor}
            variant="secondary"
            onClick={handleManageWalletsClick}
          >
            {ctaButtonText}
          </Button>
        </StyledButtonContainer>
      </EmptyState>
    </VStack>
  );
}

const StyledButtonContainer = styled.div`
  padding-top: 8px;
`;
