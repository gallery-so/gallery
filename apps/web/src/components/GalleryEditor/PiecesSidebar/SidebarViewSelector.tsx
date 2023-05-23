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
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

export type SidebarView = 'Collected' | 'Created' | 'Hidden';

type SidebarViewSelectorProps = {
  selectedView: SidebarView;
  setSelectedView: (selectedView: SidebarView) => void;
  queryRef: SidebarViewSelectorFragment$key;
};

export function SidebarViewSelector({
  selectedView,
  setSelectedView,
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

  const onSelectView = useCallback(
    (selectedView: SidebarView) => {
      setSelectedView(selectedView);
      setIsDropdownOpen(false);
    },
    [setSelectedView, setIsDropdownOpen]
  );

  const isCreatedTabEnabled = isFeatureEnabled(FeatureFlag.BIG_EASEL, query);

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{selectedView}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <Dropdown position="right" active={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
        <DropdownSection>
          <DropdownItem onClick={() => onSelectView('Collected')}>COLLECTED</DropdownItem>
          {isCreatedTabEnabled && (
            <DropdownItem onClick={() => onSelectView('Created')}>CREATED</DropdownItem>
          )}
          <DropdownItem onClick={() => onSelectView('Hidden')}>HIDDEN</DropdownItem>
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
