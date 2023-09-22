import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { Chain, chains } from '~/shared/utils/chains';

import { Dropdown } from '../../core/Dropdown/Dropdown';
import { DropdownItem } from '../../core/Dropdown/DropdownItem';
import { DropdownSection } from '../../core/Dropdown/DropdownSection';
import IconContainer from '../../core/IconContainer';
import { HStack } from '../../core/Spacer/Stack';
import { BaseM } from '../../core/Text/Text';
import { TokenFilterType } from '../../GalleryEditor/PiecesSidebar/SidebarViewSelector';

type NftSelectorViewSelectorProps = {
  isSearching: boolean;
  selectedView: TokenFilterType;
  onSelectedViewChange: (selectedView: TokenFilterType) => void;
  selectedNetwork: Chain;
};

export function NftSelectorViewSelector({
  isSearching,
  selectedView,
  onSelectedViewChange,
  selectedNetwork,
}: NftSelectorViewSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const track = useTrack();

  const onSelectView = useCallback(
    (selectedView: TokenFilterType) => {
      track('NFT Selector: Changed View Filter', { variant: selectedView });
      onSelectedViewChange(selectedView);
      setIsDropdownOpen(false);
    },
    [track, onSelectedViewChange]
  );

  const isCreatorSupportEnabledForChain = useMemo(() => {
    const selectedChain = chains.find((chain) => chain.name === selectedNetwork);
    return selectedChain?.hasCreatorSupport;
  }, [selectedNetwork]);

  return (
    <Container>
      <Selector
        gap={10}
        justify="space-between"
        align="center"
        onClick={() => setIsDropdownOpen(true)}
      >
        <BaseM>{isSearching ? 'All' : selectedView}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <Dropdown position="right" active={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
        <DropdownSection>
          <DropdownItem onClick={() => onSelectView('Collected')}>
            <BaseM>Collected</BaseM>
          </DropdownItem>
          <DropdownItem
            onClick={() => onSelectView('Created')}
            disabled={!isCreatorSupportEnabledForChain}
          >
            <BaseM>Created</BaseM>
          </DropdownItem>
        </DropdownSection>
      </Dropdown>
    </Container>
  );
}

const Selector = styled(HStack)`
  cursor: pointer;
  padding: 4px 8px;
  width: 100%;

  &:hover {
    background-color: ${colors.faint};
  }
`;

const Container = styled.div`
  position: relative;
  width: 110px;
`;
