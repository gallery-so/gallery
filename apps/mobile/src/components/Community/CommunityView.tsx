import { useCallback, useEffect, useRef, useState } from 'react';
import { Share, View } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment } from 'react-relay';
import { ShareIcon } from 'src/icons/ShareIcon';

import { CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';

import { BackButton } from '../BackButton';
import { GalleryTabsContainer } from '../GalleryTabs/GalleryTabsContainer';
import { IconContainer } from '../IconContainer';
import { CommunityCollectors } from './CommunityCollectors';
import { CommunityHeader } from './CommunityHeader';
import { CommunityMeta } from './CommunityMeta';
import { CommunityTabsHeader } from './CommunityTabsHeader';
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
            ...CommunityTabsHeaderFragment
            chain
            contractAddress {
              address
            }
          }
        }
        ...CommunityCollectorsQueryFragment
        ...CommunityCollectorsListQueryFragment
        ...CommunityViewPostsTabQueryFragment
        ...CommunityMetaQueryFragment
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

  const handleShare = useCallback(() => {
    Share.share({
      url: `https://gallery.so/community/${community.chain?.toLowerCase()}/${
        community.contractAddress?.address
      }`,
    });
  }, [community.chain, community.contractAddress?.address]);

  const TabBar = useCallback(() => {
    return (
      <View>
        <View className="px-4">
          <CommunityMeta communityRef={community} queryRef={query} />
        </View>
        <CommunityTabsHeader
          communityRef={community}
          selectedRoute={selectedRoute}
          onRouteChange={setSelectedRoute}
        />
      </View>
    );
  }, [community, query, selectedRoute]);

  const Header = useCallback(() => {
    return <CommunityHeader communityRef={community} />;
  }, [community]);

  return (
    <View className="flex-1">
      <View className="flex flex-col px-4 py-4 z-10 bg-white dark:bg-black-900">
        <View className="flex flex-row justify-between">
          <BackButton />

          <IconContainer
            eventElementId="Community Share Icon"
            eventName="Community Share Icon Clicked"
            icon={<ShareIcon />}
            onPress={handleShare}
          />
        </View>
      </View>

      <View className="flex-grow">
        <GalleryTabsContainer
          TabBar={TabBar}
          Header={Header}
          ref={containerRef}
          initialTabName={selectedRoute}
        >
          <Tabs.Tab name="Posts">
            <CommunityViewPostsTab communityRef={community} queryRef={query} />
          </Tabs.Tab>
          <Tabs.Tab name="Collectors">
            <CommunityCollectors queryRef={query} communityRef={community} />
          </Tabs.Tab>
        </GalleryTabsContainer>
      </View>
    </View>
  );
}
