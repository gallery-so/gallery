import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import CommunityHolderList from '~/components/Community/CommunityHolderList';
import CommunityHolderGrid from '~/components/CommunityHolderGrid/CommunityHolderGrid';
import { DisplayLayout } from '~/components/core/enums';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { CommunityPageCollectorsTabFragment$key } from '~/generated/CommunityPageCollectorsTabFragment.graphql';
import { CommunityPageCollectorsTabQueryFragment$key } from '~/generated/CommunityPageCollectorsTabQueryFragment.graphql';

import LayoutToggleButton from './LayoutToggleButton';

type Props = {
  communityRef: CommunityPageCollectorsTabFragment$key;
  queryRef: CommunityPageCollectorsTabQueryFragment$key;
};

export default function CommunityPageCollectorsTab({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageCollectorsTabFragment on Community {
        ...CommunityHolderGridFragment
        ...CommunityHolderListFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageCollectorsTabQueryFragment on Query {
        ...CommunityHolderGridQueryFragment
      }
    `,
    queryRef
  );

  const [layout, setLayout] = useState<DisplayLayout>(DisplayLayout.GRID);
  const showGrid = useMemo(() => layout === DisplayLayout.GRID, [layout]);

  return (
    <StyledCollectorsTab>
      <HStack align="center" justify="space-between">
        <TitleS>Collectors on Gallery</TitleS>
        <LayoutToggleButton layout={layout} setLayout={setLayout} />
      </HStack>
      {showGrid ? (
        <StyledGridViewContainer gap={24}>
          <StyledListWrapper>
            <CommunityHolderGrid communityRef={community} queryRef={query} />
          </StyledListWrapper>
        </StyledGridViewContainer>
      ) : (
        <VStack gap={32}>
          {/* GAL-3898  we're removing the MemberListFilter, TODO to remove all related code. want to do in a separate PR */}
          {/* <StyledMemberListFilterContainer isMobile={isMobile}>
            <MemberListFilter />
          </StyledMemberListFilterContainer> */}
          <StyledListWrapper>
            <CommunityHolderList communityRef={community} />
          </StyledListWrapper>
        </VStack>
      )}
    </StyledCollectorsTab>
  );
}

const StyledCollectorsTab = styled.div`
  padding-top: 10px;
  padding-bottom: 56px;
`;

const StyledGridViewContainer = styled(VStack)`
  padding-top: 24px;
`;

const StyledListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
