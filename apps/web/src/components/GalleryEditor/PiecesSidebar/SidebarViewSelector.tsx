import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { SidebarViewSelectorFragment$key } from '~/generated/SidebarViewSelectorFragment.graphql';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

export type SidebarView = 'Collected' | 'Created' | 'Hidden';

type SidebarViewSelectorProps = {
  selectedView: SidebarView;
  onSelectedViewChange: (selectedView: SidebarView) => void;
  queryRef: SidebarViewSelectorFragment$key;
};

export function SidebarViewSelector({
  selectedView,
  onSelectedViewChange,
  queryRef,
}: SidebarViewSelectorProps) {
  const query = useFragment(
    graphql`
      fragment SidebarViewSelectorFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isCreatedTabEnabled = isFeatureEnabled(FeatureFlag.BIG_EASEL, query);

  const track = useTrack();

  const onSelectView = useCallback(
    (selectedView: SidebarView) => {
      track('Editor Sidebar Dropdown Clicked', { variant: selectedView });
      if (selectedView === 'Created' && !isCreatedTabEnabled) {
        return;
      }
      onSelectedViewChange(selectedView);
      setIsDropdownOpen(false);
    },
    [track, isCreatedTabEnabled, onSelectedViewChange]
  );

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{selectedView}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <Dropdown position="right" active={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
        <DropdownSection>
          <DropdownItem onClick={() => onSelectView('Collected')}>COLLECTED</DropdownItem>
          <DropdownItem onClick={() => onSelectView('Hidden')}>HIDDEN</DropdownItem>
          <DropdownItem onClick={() => onSelectView('Created')} disabled={!isCreatedTabEnabled}>
            CREATED (SOON)
          </DropdownItem>
        </DropdownSection>
      </Dropdown>
    </Container>
  );
}

const Selector = styled(HStack)`
  cursor: pointer;
`;

const Container = styled.div`
  position: relative;
`;
