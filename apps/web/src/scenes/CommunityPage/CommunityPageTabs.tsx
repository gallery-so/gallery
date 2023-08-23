import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseXL } from '~/components/core/Text/Text';
import { CommunityPageTabsFragment$key } from '~/generated/CommunityPageTabsFragment.graphql';
import colors from '~/shared/theme/colors';

import { CommunityPageTab } from './CommunityPageView';
type Props = {
  onSelectTab: (value: CommunityPageTab) => void;
  activeTab: CommunityPageTab;
  communityRef: CommunityPageTabsFragment$key;
};

export default function CommunityPageTabs({ onSelectTab, activeTab, communityRef }: Props) {
  const community = useFragment<CommunityPageTabsFragment$key>(
    graphql`
      fragment CommunityPageTabsFragment on Community {
        posts(before: $communityPostsBefore, last: $communityPostsLast)
          @connection(key: "CommunityFeed_posts") {
          edges {
            node {
              ... on Post {
                __typename
              }
            }
          }
          pageInfo {
            total
          }
        }
      }
    `,
    communityRef
  );

  const totalPosts = community.posts?.pageInfo.total;

  const handleTabClick = useCallback(
    (tab: CommunityPageTab) => {
      onSelectTab(tab);
    },
    [onSelectTab]
  );

  return (
    <StyledTabsContainer align="center" justify="center" gap={12}>
      <StyledTab isActive={activeTab === 'posts'} onClick={() => handleTabClick('posts')}>
        <HStack gap={3}>
          <StyledTabLabel>Posts</StyledTabLabel>
          {totalPosts !== 0 && <StyledTabLabelCount>{totalPosts}</StyledTabLabelCount>}
        </HStack>
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
  font-weight: 500;
  color: inherit;
`;

const StyledTabLabelCount = styled(BaseXL)`
  letter-spacing: -0.04em;
  font-size: 14px;
  color: inherit;
`;
