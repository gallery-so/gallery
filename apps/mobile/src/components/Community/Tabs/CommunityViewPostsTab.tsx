import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { Button } from '~/components/Button';
import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { Typography } from '~/components/Typography';
import { CommunityViewPostsTabFragment$key } from '~/generated/CommunityViewPostsTabFragment.graphql';
import { CommunityViewPostsTabQueryFragment$key } from '~/generated/CommunityViewPostsTabQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { POSTS_PER_PAGE } from '~/screens/CommunityScreen/CommunityScreen';

import { CommunityPostBottomSheet } from '../CommunityPostBottomSheet';

type Props = {
  communityRef: CommunityViewPostsTabFragment$key;
  queryRef: CommunityViewPostsTabQueryFragment$key;
};

export function CommunityViewPostsTab({ communityRef, queryRef }: Props) {
  const {
    data: community,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment CommunityViewPostsTabFragment on Community
      @refetchable(queryName: "CommunityViewPostsTabFragmentPaginationQuery") {
        dbid
        name
        contractAddress {
          address
        }
        posts(last: $postLast, before: $postBefore)
          @connection(key: "CommunityViewPostsTabFragment_posts") {
          edges {
            node {
              ...createVirtualizedFeedEventItemsPostFragment
            }
          }
          pageInfo {
            total
          }
        }
        ...CommunityPostBottomSheetFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityViewPostsTabQueryFragment on Query {
        ...createVirtualizedFeedEventItemsQueryFragment
        viewer {
          ... on Viewer {
            user {
              isMemberOfCommunity(communityID: $communityID)
            }
          }
        }
      }
    `,
    queryRef
  );

  const isMemberOfCommunity = query.viewer?.user?.isMemberOfCommunity ?? false;

  const contentContainerStyle = useListContentStyle();

  const totalPosts = community?.posts?.pageInfo?.total ?? 0;

  const { markEventAsFailure, failedEvents } = useFailedEventTracker();

  const posts = useMemo(() => {
    const postNodes = [];

    for (const edge of community?.posts?.edges ?? []) {
      if (edge?.node) {
        postNodes.push(edge.node);
      }
    }

    return postNodes.reverse();
  }, [community?.posts?.edges]);

  const ref = useRef<FlashList<FeedListItemType> | null>(null);
  const { items } = createVirtualizedFeedEventItems({
    itemRefs: posts,
    listRef: ref,
    failedEvents,
    queryRef: query,
  });

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      // Set a default for feed navigation pill
      let itemId: string | null = null;

      if (item.post) {
        itemId = item.post.dbid;
      } else if (item.event) {
        itemId = item.event.dbid;
      } else {
        itemId = item.eventId;
      }

      const markFailure = () => (itemId ? markEventAsFailure(itemId) : () => {});

      return <FeedVirtualizedRow item={item} onFailure={markFailure} />;
    },
    [markEventAsFailure]
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleCreatePost = useCallback(() => {
    if (!isMemberOfCommunity) {
      bottomSheetRef.current?.present();
      return;
    }

    if (!community?.contractAddress?.address) return;
    navigation.navigate('NftSelectorContractScreen', {
      contractAddress: community?.contractAddress?.address,
      page: 'Community',
    });
  }, [isMemberOfCommunity, navigation, community?.contractAddress?.address]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(POSTS_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  if (totalPosts === 0) {
    return (
      <View className="flex-1 pt-16 justify-center">
        <View className="space-y-6 px-8">
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-lg text-center"
          >
            We're still early... be the first to post about{' '}
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              className="text-lg text-center"
            >
              {community?.name}
            </Typography>{' '}
            and inspire others!
          </Typography>

          <Button
            text={'CREATE A POST'}
            onPress={handleCreatePost}
            eventElementId={null}
            eventName={null}
          />

          <CommunityPostBottomSheet
            ref={bottomSheetRef}
            communityRef={community}
            onRefresh={() => {}}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList
        ref={ref}
        getItemType={(item) => item.kind}
        keyExtractor={(item) => item.key}
        estimatedItemSize={400}
        data={items}
        renderItem={renderItem}
        onEndReached={loadMore}
      />
    </View>
  );
}
