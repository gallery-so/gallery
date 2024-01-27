import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Share, View } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment } from 'react-relay';
import { GlobeIcon } from 'src/icons/GlobeIcon';
import { ObjktIcon } from 'src/icons/ObjktIcon';
import { OpenseaIcon } from 'src/icons/OpenseaIcon';
import { ShareIcon } from 'src/icons/ShareIcon';

import { CommunityViewCommunityFragment$key } from '~/generated/CommunityViewCommunityFragment.graphql';
import { CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';

import { BackButton } from '../BackButton';
import { GalleryTabsContainer } from '../GalleryTabs/GalleryTabsContainer';
import { IconContainer } from '../IconContainer';
import { CommunityCollectors } from './CommunityCollectors';
import { CommunityGalleries } from './CommunityGalleries/CommunityGalleries';
import { CommunityHeader } from './CommunityHeader';
import { CommunityMeta } from './CommunityMeta';
import { CommunityTabsHeader } from './CommunityTabsHeader';
import { CommunityViewPostsTab } from './Tabs/CommunityViewPostsTab';

type Props = {
  queryRef: CommunityViewFragment$key;
  communityRef: CommunityViewCommunityFragment$key;
};

export function CommunityView({ queryRef, communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityViewCommunityFragment on Community {
        __typename
        ...CommunityHeaderFragment
        ...CommunityCollectorsFragment
        ...CommunityMetaFragment
        ...CommunityViewPostsTabFragment
        ...CommunityTabsHeaderFragment
        ...extractRelevantMetadataFromCommunityFragment
        ...CommunityGalleriesFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityViewFragment on Query {
        ...CommunityCollectorsQueryFragment
        ...CommunityViewPostsTabQueryFragment
        ...CommunityMetaQueryFragment
      }
    `,
    queryRef
  );

  if (!community) {
    throw new Error(`Unable to fetch the community`);
  }

  const [selectedRoute, setSelectedRoute] = useState('Collectors');

  const containerRef = useRef<CollapsibleRef>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.jumpToTab(selectedRoute);
    }
  }, [selectedRoute]);

  const { openseaUrl, objktUrl, externalAddressUrl, chain, contractAddress } =
    extractRelevantMetadataFromCommunity(community);

  const handleShare = useCallback(() => {
    Share.share({
      url: `https://gallery.so/community/${chain.toLowerCase()}/${contractAddress}`,
    });
  }, [chain, contractAddress]);

  const Header = useCallback(() => {
    return (
      <>
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

        <CommunityTabsHeader
          communityRef={community}
          selectedRoute={selectedRoute}
          onRouteChange={setSelectedRoute}
        />
      </>
    );
  }, [
    community,
    query,
    handleShare,
    externalAddressUrl,
    objktUrl,
    openseaUrl,
    setSelectedRoute,
    selectedRoute,
  ]);

  return (
    <GalleryTabsContainer Header={Header} ref={containerRef} initialTabName={selectedRoute}>
      <Tabs.Tab name="Collectors">
        <CommunityCollectors queryRef={query} communityRef={community} />
      </Tabs.Tab>
      <Tabs.Tab name="Posts">
        <CommunityViewPostsTab communityRef={community} queryRef={query} />
      </Tabs.Tab>
      <Tabs.Tab name="Galleries">
        <CommunityGalleries communityRef={community} />
      </Tabs.Tab>
    </GalleryTabsContainer>
  );
}
