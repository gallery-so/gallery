import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { BaseM } from '~/components/core/Text/Text';
import { TokenFilterType } from '~/components/GalleryEditor/PiecesSidebar/SidebarViewSelector';
import { NftSelectorFilterNetworkFragment$key } from '~/generated/NftSelectorFilterNetworkFragment.graphql';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { Chain, ChainMetadata, chains } from '~/shared/utils/chains';
import isAdminRole from '~/utils/graphql/isAdminRole';

import { Dropdown } from '../../core/Dropdown/Dropdown';
import { DropdownItem } from '../../core/Dropdown/DropdownItem';
import { DropdownSection } from '../../core/Dropdown/DropdownSection';
import IconContainer from '../../core/IconContainer';
import { HStack } from '../../core/Spacer/Stack';

type NetworkDropdownProps = {
  chain: ChainMetadata;
};

const NetworkDropdownByNetwork = ({ chain }: NetworkDropdownProps) => {
  return (
    <HStack align="center" gap={6}>
      <Image src={chain.icon} width={16} height={16} alt={chain.name} />
      <BaseM>{chain.name}</BaseM>
    </HStack>
  );
};

type NftSelectorViewSelectorProps = {
  selectedMode: TokenFilterType;
  selectedNetwork: Chain;
  onSelectedViewChange: (selectedView: Chain) => void;
  queryRef: NftSelectorFilterNetworkFragment$key;
};

export function NftSelectorFilterNetwork({
  selectedMode,
  selectedNetwork,
  onSelectedViewChange,
  queryRef,
}: NftSelectorViewSelectorProps) {
  const query = useFragment(
    graphql`
      fragment NftSelectorFilterNetworkFragment on Query {
        ...isAdminRoleFragment
      }
    `,
    queryRef
  );

  const isAdmin = isAdminRole(query);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const track = useTrack();
  const availableChains = useMemo(() => {
    if (isAdmin) {
      return chains;
    }
    return chains.filter((chain) => chain.isEnabled);
  }, [isAdmin]);

  const selectedChain = useMemo(() => {
    return availableChains.find((chain) => chain.name === selectedNetwork);
  }, [availableChains, selectedNetwork]);

  const onSelectChain = useCallback(
    (chain: ChainMetadata) => {
      track('NFT Selector: Changed Network', { variant: chain.name });
      onSelectedViewChange(chain.name);
      setIsDropdownOpen(false);
    },
    [track, onSelectedViewChange]
  );

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        {selectedChain && <NetworkDropdownByNetwork chain={selectedChain} />}
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <Dropdown position="right" active={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
        <DropdownSection>
          {availableChains.map((chain) => (
            <DropdownItem
              key={chain.name}
              onClick={() => {
                if (selectedMode === 'Created' && chain.hasCreatorSupport) {
                  onSelectChain(chain);
                }
              }}
              disabled={selectedMode === 'Created' && !chain.hasCreatorSupport}
            >
              <NetworkDropdownByNetwork chain={chain} />
            </DropdownItem>
          ))}
        </DropdownSection>
      </Dropdown>
    </Container>
  );
}

const Selector = styled(HStack)`
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    background-color: ${colors.faint};
  }
`;

const Container = styled.div`
  position: relative;
`;
