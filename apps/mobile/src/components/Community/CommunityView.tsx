import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment } from 'react-relay';

import { CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';

import { BackButton } from '../BackButton';
import { GalleryTabBar } from '../GalleryTabs/GalleryTabBar';
import { GalleryTabsContainer } from '../GalleryTabs/GalleryTabsContainer';
import { CommunityCollectors } from './CommunityCollectors';
import { CommunityHeader } from './CommunityHeader';
import { CommunityMeta } from './CommunityMeta';
import { CommunityViewPostsTab } from './Tabs/CommunityViewPostsTab';

type Props = {
  queryRef: CommunityViewFragment$key;
};

export function CommunityView({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityViewFragment on Query {
        community: communityByAddress(communityAddress: $communityAddress)
          @required(action: THROW) {
          ... on ErrCommunityNotFound {
            __typename
          }
          ... on Community {
            __typename
            ...CommunityCollectorsListFragment
            ...CommunityHeaderFragment
            ...CommunityCollectorsFragment
            ...CommunityMetaFragment
            ...CommunityViewPostsTabFragment
          }
        }
        ...CommunityCollectorsQueryFragment
        ...CommunityCollectorsListQueryFragment
        ...CommunityViewPostsTabQueryFragment
      }
    `,
    queryRef
  );

  const { community } = query;

  if (!community || community.__typename !== 'Community') {
    throw new Error(`Unable to fetch the community`);
  }

  const [selectedRoute, setSelectedRoute] = useState('Posts');

  const containerRef = useRef<CollapsibleRef>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.jumpToTab(selectedRoute);
    }
  }, [selectedRoute]);

  const routes = useMemo(() => {
    return [
      {
        name: 'Posts',
      },
      {
        name: 'Collectors',
      },
    ];
  }, []);

  const Header = useCallback(() => {
    return (
      <GalleryTabBar
        activeRoute={selectedRoute}
        onRouteChange={setSelectedRoute}
        routes={routes}
        eventElementId="Community Tab"
        eventName="Community Tab Clicked"
      />
    );
  }, [routes, setSelectedRoute, selectedRoute]);

  return (
    <View className="flex-1">
      <View className="flex flex-col px-4 pb-4 z-10 bg-white dark:bg-black">
        <View className="flex flex-row justify-between bg-white dark:bg-black">
          <BackButton />
        </View>
      </View>

      <View className="flex-grow">
        <View className="px-4">
          <CommunityHeader communityRef={community} />
          <CommunityMeta communityRef={community} />
        </View>

        <View className="flex-grow">
          <GalleryTabsContainer Header={Header} ref={containerRef}>
            <Tabs.Tab name="Posts">
              <CommunityViewPostsTab communityRef={community} queryRef={query} />
            </Tabs.Tab>
            <Tabs.Tab name="Collectors">
              <CommunityCollectors queryRef={query} communityRef={community} />
            </Tabs.Tab>
          </GalleryTabsContainer>
        </View>
      </View>
    </View>
  );
}
