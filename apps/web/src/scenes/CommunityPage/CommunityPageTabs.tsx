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
          # Relay doesn't allow @connection w/o edges so we must query for it
          # eslint-disable-next-line relay/unused-fields
          edges {
            __typename
          }
          pageInfo {
            total
          }
        }
        holders(first: $listOwnersFirst, after: $listOwnersAfter)
          @connection(key: "CommunityPageView_holders") {
          # Relay doesn't allow @connection w/o edges so we must query for it
          # eslint-disable-next-line relay/unused-fields
          edges {
            __typename
          }
          pageInfo {
            total
          }
        }
        galleries(first: $listOwnersFirst, after: $listOwnersAfter, maxPreviews: 5)
          @connection(key: "CommunityPageView_galleries") {
          # Relay doesn't allow @connection w/o edges so we must query for it
          # eslint-disable-next-line relay/unused-fields
          edges {
            __typename
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
  const totalOwners = community.holders?.pageInfo.total;
  const totalGalleries = community.galleries?.pageInfo.total;

  const handleTabClick = useCallback(
    (tab: CommunityPageTab) => {
      onSelectTab(tab);
    },
    [onSelectTab]
  );

  return (
    <StyledTabsContainer align="center" justify="center" gap={12}>
      <StyledTab isActive={activeTab === 'collectors'} onClick={() => handleTabClick('collectors')}>
        <HStack gap={3}>
          <StyledTabLabel>Collectors</StyledTabLabel>
          {totalOwners !== 0 && <StyledTabLabelCount>{totalOwners}</StyledTabLabelCount>}
        </HStack>
      </StyledTab>
      <StyledTab isActive={activeTab === 'posts'} onClick={() => handleTabClick('posts')}>
        <HStack gap={3}>
          <StyledTabLabel>Posts</StyledTabLabel>
          {totalPosts !== 0 && <StyledTabLabelCount>{totalPosts}</StyledTabLabelCount>}
        </HStack>
      </StyledTab>
      <StyledTab isActive={activeTab === 'galleries'} onClick={() => handleTabClick('galleries')}>
        <HStack gap={3}>
          <StyledTabLabel>Galleries</StyledTabLabel>
          {totalGalleries !== 0 && <StyledTabLabelCount>{totalGalleries}</StyledTabLabelCount>}
        </HStack>
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
