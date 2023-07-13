import { useCallback, useState, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { ChainMetadata } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { SidebarWalletSelectorFragment$key } from '~/generated/SidebarWalletSelectorFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { chainsMap } from '~/components/GalleryEditor/PiecesSidebar/chains';

export type SidebarWallet = "Abitrum" | "Ethereum" | "Optimism" | "POAP" | "Polygon" | "Tezos" | "Zora";

type SidebarWalletSelectorProps = {
  queryRef: SidebarWalletSelectorFragment$key;
  selectedChain: ChainMetadata;
  selectedWallet: SidebarWallet;
  onSelectedWalletChange: (selectedWallet: any) => void;
};

export default function SidebarWalletSelector({
  queryRef,
  selectedChain,
  selectedWallet,
  onSelectedWalletChange,
}: SidebarWalletSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { viewer } = useFragment(
    graphql`
      fragment SidebarWalletSelectorFragment on Query {
        viewer {
          ... on Viewer {
            user {
              wallets {
                dbid @required(action: THROW)
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
  console.log('viewer', viewer);
  const userWalletsOnSelectedNetwork = useMemo(
    () =>
      removeNullValues(viewer?.user?.wallets).filter((wallet) => {
        if (wallet.chainAddress.chain === chainsMap[selectedChain.name].baseChain) {
          return wallet;
        }
      }),
    [viewer?.user?.wallets, selectedChain]
  );

  console.log('userWalletsOnSelectedNetwork', userWalletsOnSelectedNetwork);
  const track = useTrack();

  const onSelectWallet = useCallback(
    (selectedWallet: SidebarWallet) => {
      track('Editor Sidebar Wallet Dropdown Clicked', { variant: selectedWallet });
      onSelectedWalletChange(selectedWallet);
      setIsDropdownOpen(false);
    },
    [track, onSelectedWalletChange]
  );
  const dispVal = () => {
    if (typeof selectedWallet === 'string') {
      return 'All';
    } else if (selectedWallet) {
      return selectedWallet.chainAddress.address.slice(0, 6);
    }
    return 'All';
  };

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{dispVal()}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <StyledDropdown
        position="right"
        active={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      >
        <DropdownSection>
          <DropdownItem onClick={() => onSelectWallet('ALL')}>
            <BaseM>All</BaseM>
          </DropdownItem>
          {userWalletsOnSelectedNetwork.map((wallet) => (
            <DropdownItem onClick={() => onSelectWallet(wallet)}>
              <BaseM>{wallet.chainAddress.address.slice(0, 6)}</BaseM>
            </DropdownItem>
          ))}
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
  width: 100px;
`;
