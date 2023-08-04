import { useCallback } from 'react';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseXL } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

import { CommunityPageTab } from './CommunityPageView';

type Props = {
  onSelectTab: (value: CommunityPageTab) => void;
  activeTab: CommunityPageTab;
};

export default function CommunityPageTabs({ onSelectTab, activeTab }: Props) {
  const handleTabClick = useCallback(
    (tab: CommunityPageTab) => {
      onSelectTab(tab);
    },
    [onSelectTab]
  );

  return (
    <StyledTabsContainer align="center" justify="center" gap={12}>
      <StyledTab isActive={activeTab === 'posts'} onClick={() => handleTabClick('posts')}>
        <StyledTabLabel>Posts</StyledTabLabel>
      </StyledTab>
      {/* COMING SOON */}
      {/* <StyledTab isActive={activeTab === 'galleries'} onClick={() => handleTabClick('galleries')}>
        <StyledTabLabel>Galleries</StyledTabLabel>
      </StyledTab> */}
      <StyledTab isActive={activeTab === 'collectors'} onClick={() => handleTabClick('collectors')}>
        <StyledTabLabel>Collectors</StyledTabLabel>
      </StyledTab>
    </StyledTabsContainer>
  );
}

const StyledTabsContainer = styled(HStack)`
  border-top: 1px solid ${colors.porcelain};
  border-bottom: 1px solid ${colors.porcelain};
  padding: 12px;
`;

const StyledTab = styled.div<{ isActive: boolean }>`
  cursor: pointer;

  color: ${({ isActive }) => (isActive ? colors.black[800] : colors.metal)};
`;

const StyledTabLabel = styled(BaseXL)`
  letter-spacing: -0.04em;
  font-size: 16px;
  color: inherit;
`;
