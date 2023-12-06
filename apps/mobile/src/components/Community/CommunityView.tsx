import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Share, View } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment } from 'react-relay';
import { GlobeIcon } from 'src/icons/GlobeIcon';
import { ObjktIcon } from 'src/icons/ObjktIcon';
import { OpenseaIcon } from 'src/icons/OpenseaIcon';
import { ShareIcon } from 'src/icons/ShareIcon';

import { CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';

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
          ...extractRelevantMetadataFromCommunityFragment
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

  if (!community) {
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
      <CommunityTabsHeader
        communityRef={community}
        selectedRoute={selectedRoute}
        onRouteChange={setSelectedRoute}
      />
    );
  }, [community, setSelectedRoute, selectedRoute]);

  const { openseaUrl, objktUrl, externalAddressUrl } =
    extractRelevantMetadataFromCommunity(community);

  return (
    <View className="flex-1">
      <View className="flex flex-col px-4 py-4 z-10">
        <View className="flex flex-row justify-between">
          <BackButton />

          <View className="flex flex-row space-x-2">
            {externalAddressUrl && (
              <IconContainer
                eventElementId="Community Globe Icon"
                eventName="Community Globe Icon Clicked"
                eventContext={contexts.Community}
                icon={<GlobeIcon />}
                onPress={() => Linking.openURL(externalAddressUrl)}
              />
            )}
            {objktUrl && (
              <IconContainer
                eventElementId="Community Objkt Icon"
                eventName="Community Objkt Icon Clicked"
                eventContext={contexts.Community}
                icon={<ObjktIcon />}
                onPress={() => Linking.openURL(objktUrl)}
              />
            )}
            {openseaUrl && (
              <IconContainer
                eventElementId="Community Opensea Icon"
                eventName="Community Opensea Icon Clicked"
                eventContext={contexts.Community}
                icon={<OpenseaIcon />}
                onPress={() => Linking.openURL(openseaUrl)}
              />
            )}
            <IconContainer
              eventElementId="Community Share Icon"
              eventName="Community Share Icon Clicked"
              eventContext={contexts.Community}
              icon={<ShareIcon />}
              onPress={handleShare}
            />
          </View>
        </View>
      </View>

      <View className="px-4">
        <CommunityHeader communityRef={community} />
        <CommunityMeta communityRef={community} queryRef={query} />
      </View>

      <View className="flex-grow">
        <GalleryTabsContainer TabBar={TabBar} ref={containerRef} initialTabName={selectedRoute}>
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
