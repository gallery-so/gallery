import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import { POSTS_PER_PAGE } from 'src/constants/feed';

import { Button } from '~/components/Button';
import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { CommunityViewPostsTabFragment$key } from '~/generated/CommunityViewPostsTabFragment.graphql';
import { CommunityViewPostsTabQueryFragment$key } from '~/generated/CommunityViewPostsTabQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';
import { noop } from '~/shared/utils/noop';

import CommunityPostBottomSheet from '../CommunityPostBottomSheet';

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
        ...extractRelevantMetadataFromCommunityFragment
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

      const markFailure = () => (itemId ? markEventAsFailure(itemId) : noop);

      return <FeedVirtualizedRow item={item} onFailure={markFailure} />;
    },
    [markEventAsFailure]
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const { contractAddress } = extractRelevantMetadataFromCommunity(community);

  const { showBottomSheetModal } = useBottomSheetModalActions();
  const handleCreatePost = useCallback(() => {
    if (!isMemberOfCommunity) {
      showBottomSheetModal({
        content: <CommunityPostBottomSheet communityRef={community} onRefresh={noop} />,
      });
      return;
    }

    if (!contractAddress) return;
    navigation.navigate('NftSelectorContractScreen', {
      contractAddress,
      page: 'Community',
    });
  }, [isMemberOfCommunity, contractAddress, navigation, showBottomSheetModal, community]);

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
            eventElementId="Empty View Create Post Button"
            eventName="Empty View Create Post Button Press"
            eventContext={contexts.Posts}
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
