import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { ChainMetadata, chains } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { SidebarChainDropdownFragment$key } from '~/generated/SidebarChainDropdownFragment.graphql';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import isAdminRole from '~/utils/graphql/isAdminRole';

import { SidebarView } from './SidebarViewSelector';

type Props = {
  queryRef: SidebarChainDropdownFragment$key;
  selectedChain: ChainMetadata;
  onSelectChain: (chain: ChainMetadata) => void;
  selectedView: SidebarView;
};

export default function SidebarChainDropdown({
  queryRef,
  selectedChain,
  onSelectChain,
  selectedView,
}: Props) {
  const query = useFragment(
    graphql`
      fragment SidebarChainDropdownFragment on Query {
        ...isAdminRoleFragment
      }
    `,
    queryRef
  );

  const isAdmin = isAdminRole(query);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const track = useTrack();

  const handleSelectChain = useCallback(
    (chain: ChainMetadata) => {
      track('Editor Sidebar Chain Dropdown Clicked', { variant: chain });
      onSelectChain(chain);
      setIsDropdownOpen(false);
    },
    [track, onSelectChain]
  );

  const availableChains = useMemo(() => {
    if (selectedView === 'Created') {
      return chains.filter((chain) => chain.hasCreatorSupport);
    }
    if (isAdmin) {
      return chains;
    }
    return chains.filter((chain) => chain.isEnabled);
  }, [isAdmin, selectedView]);

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <HStack align="center" gap={6}>
          <Image src={selectedChain.icon} width={16} height={16} alt={selectedChain.name} />
          <BaseM>{selectedChain.name}</BaseM>
        </HStack>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <StyledDropdown
        position="right"
        active={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      >
        <DropdownSection>
          {availableChains.map((chain) => (
            <DropdownItem key={chain.name} onClick={() => handleSelectChain(chain)}>
              <HStack align="center" gap={6}>
                <Image src={chain.icon} width={16} height={16} alt={chain.name} />
                <BaseM>{chain.name}</BaseM>
              </HStack>
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
  width: 120px;
`;

// const StyledBlinkingContainer = styled.div`
//   position: absolute;
//   right: 0;
//   top: 10px;
// `;
