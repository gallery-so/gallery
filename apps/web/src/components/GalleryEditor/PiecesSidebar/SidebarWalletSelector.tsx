import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { OnConnectWalletSuccessFn } from '~/components/WalletSelector/multichain/MultichainWalletSelector';
import { SidebarWalletSelectorFragment$key } from '~/generated/SidebarWalletSelectorFragment.graphql';
import useAddWalletModal from '~/hooks/useAddWalletModal';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { ChainMetadata } from '~/shared/utils/chains';
import { chainsMap } from '~/shared/utils/chains';

export type SidebarWallet = { chainAddress: { chain: string; address: string } } | 'All';
const MAX_ALLOWED_ADDRESSES = 15;

type SidebarWalletSelectorProps = {
  isSearching: boolean;
  queryRef: SidebarWalletSelectorFragment$key;
  selectedChain: ChainMetadata;
  selectedWallet: SidebarWallet;
  onSelectedWalletChange: (selectedWallet: SidebarWallet) => void;
  onConnectWalletSuccess?: OnConnectWalletSuccessFn;
};

export default function SidebarWalletSelector({
  queryRef,
  isSearching,
  selectedChain,
  selectedWallet,
  onSelectedWalletChange,
  onConnectWalletSuccess,
}: SidebarWalletSelectorProps) {
  const { viewer } = useFragment(
    graphql`
      fragment SidebarWalletSelectorFragment on Query {
        viewer {
          ... on Viewer {
            user {
              wallets {
                chainAddress @required(action: THROW) {
                  address @required(action: THROW)
                  chain @required(action: THROW)
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const showAddWalletModal = useAddWalletModal();

  const handleSubmit = useCallback(async () => {
    showAddWalletModal({ onConnectWalletSuccess });
  }, [onConnectWalletSuccess, showAddWalletModal]);

  const addWalletDisabled = useMemo(
    () => removeNullValues(viewer?.user?.wallets).length >= MAX_ALLOWED_ADDRESSES,
    [viewer?.user?.wallets]
  );

  const userWalletsOnSelectedNetwork = useMemo(
    () =>
      removeNullValues(viewer?.user?.wallets).filter((wallet) => {
        if (wallet.chainAddress.chain === chainsMap[selectedChain.name].baseChain) {
          return wallet;
        }
      }),
    [viewer?.user?.wallets, selectedChain]
  );

  const track = useTrack();

  const handleSelectWallet = useCallback(
    (selectedWallet: SidebarWallet) => {
      track('Editor Sidebar Wallet Dropdown Clicked', { variant: selectedWallet });
      onSelectedWalletChange(selectedWallet);
      setIsDropdownOpen(false);
    },
    [track, onSelectedWalletChange]
  );

  const truncateWalletAddress = useCallback((wallet: SidebarWallet) => {
    if (wallet !== 'All') {
      const address = wallet?.chainAddress.address;
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return 'All';
  }, []);

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{isSearching ? 'All' : truncateWalletAddress(selectedWallet)}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <StyledDropdown
        position="right"
        active={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      >
        <DropdownSection>
          <DropdownItem onClick={() => handleSelectWallet('All')}>
            <BaseM>All</BaseM>
          </DropdownItem>
          {userWalletsOnSelectedNetwork.map((wallet, index) => (
            <DropdownItem key={index} onClick={() => handleSelectWallet(wallet)}>
              <BaseM>{truncateWalletAddress(wallet)}</BaseM>
            </DropdownItem>
          ))}
          {!addWalletDisabled && (
            <DropdownItem
              onClick={() => {
                handleSubmit();
                handleSelectWallet('All');
              }}
            >
              <BaseM>ADD WALLET</BaseM>
            </DropdownItem>
          )}
        </DropdownSection>
      </StyledDropdown>
    </Container>
  );
}

const Selector = styled(HStack)`
  cursor: pointer;
`;

const Container = styled.div`
  position: relative;
`;

const StyledDropdown = styled(Dropdown)`
  width: 125px;
`;
