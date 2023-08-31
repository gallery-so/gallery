import { useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { IsMemberOfCommunityProvider } from '~/contexts/communityPage/IsMemberOfCommunityContext';
import MemberListPageProvider from '~/contexts/memberListPage/MemberListPageContext';
import { CommunityPageViewFragment$key } from '~/generated/CommunityPageViewFragment.graphql';
import { CommunityPageViewQueryFragment$key } from '~/generated/CommunityPageViewQueryFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import CommunityPageCollectorsTab from './CommunityPageCollectorsTab';
import CommunityPagePostsTab from './CommunityPagePostsTab';
import CommunityPageTabs from './CommunityPageTabs';
import CommunityPageViewHeader from './CommunityPageViewHeader';

type Props = {
  communityRef: CommunityPageViewFragment$key;
  queryRef: CommunityPageViewQueryFragment$key;
};

export type CommunityPageTab = 'posts' | 'galleries' | 'collectors';

export default function CommunityPageView({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageViewFragment on Community {
        name
        dbid

        contractAddress {
          address
        }

        ...CommunityPageCollectorsTabFragment
        ...CommunityPageTabsFragment
        ...CommunityPagePostsTabFragment

        ...CommunityPageViewHeaderFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageViewQueryFragment on Query {
        ...CommunityPagePostsTabQueryFragment
        ...CommunityPageViewHeaderQueryFragment
        ...isFeatureEnabledFragment
        ...CommunityPageCollectorsTabQueryFragment
      }
    `,
    queryRef
  );

  const { contractAddress } = community;

  if (!contractAddress) {
    throw new Error('CommunityPageView: contractAddress not found on community');
  }

  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);
  const [activeTab, setActiveTab] = useState<CommunityPageTab>(
    isKoalaEnabled ? 'posts' : 'collectors'
  );

  return (
    <MemberListPageProvider>
      <IsMemberOfCommunityProvider communityDbid={community.dbid}>
        <StyledCommunityPageContainer>
          <VStack gap={16}>
            <CommunityPageViewHeader communityRef={community} queryRef={query} />

            {isKoalaEnabled && (
              <CommunityPageTabs
                onSelectTab={setActiveTab}
                activeTab={activeTab}
                communityRef={community}
              />
            )}

            {activeTab === 'posts' && (
              <CommunityPagePostsTab communityRef={community} queryRef={query} />
            )}
            {activeTab === 'collectors' && (
              <CommunityPageCollectorsTab communityRef={community} queryRef={query} />
            )}
          </VStack>
        </StyledCommunityPageContainer>
      </IsMemberOfCommunityProvider>
    </MemberListPageProvider>
  );
}

const StyledCommunityPageContainer = styled.div`
  padding: 0;
  @media only screen and ${breakpoints.tablet} {
    padding: 80px 0 64px;
  }
`;
