import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Share, TouchableOpacity, View } from 'react-native';
import { useFragment, usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { FollowButton } from '~/components/FollowButton';
import {
  createVirtualizedGalleryRows,
  GalleryListItemType,
} from '~/components/Gallery/createVirtualizedGalleryRows';
import { GalleryVirtualizedRow } from '~/components/Gallery/GalleryVirtualizedRow';
import { IconContainer } from '~/components/IconContainer';
import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import { FollowersTabBar } from '~/components/ProfileView/FollowersTabBar';
import { GalleryPreviewCard } from '~/components/ProfileView/GalleryPreviewCard';
import { ProfileTabBar } from '~/components/ProfileView/ProfileTabBar';
import { Typography } from '~/components/Typography';
import { UserFollowCard } from '~/components/UserFollowList/UserFollowCard';
import { GalleryTokenDimensionCacheProvider } from '~/contexts/GalleryTokenDimensionCacheContext';
import { GalleryPreviewCardFragment$key } from '~/generated/GalleryPreviewCardFragment.graphql';
import { ProfileViewFragment$key } from '~/generated/ProfileViewFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { UserFollowCardFragment$key } from '~/generated/UserFollowCardFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import { BackIcon } from '../../icons/BackIcon';
import { QRCodeIcon } from '../../icons/QRCodeIcon';
import { ShareIcon } from '../../icons/ShareIcon';
import { TwitterIcon } from '../../icons/TwitterIcon';

type ListItem = { key: string } & (
  | FeedListItemType
  | GalleryListItemType
  | { kind: 'bio' }
  | { kind: 'twitter' }
  | { kind: 'tab-headers'; selectedTab: string }
  | { kind: 'sub-tab-headers'; selectedTab: string }
  | { kind: 'user-follow-card'; user: UserFollowCardFragment$key }
  | { kind: 'gallery-preview'; isFeatured: boolean; gallery: GalleryPreviewCardFragment$key }
);

type ProfileViewProps = {
  shouldShowBackButton: boolean;
  queryRef: ProfileViewQueryFragment$key;
  userRef: ProfileViewFragment$key;
};

export function ProfileView({ userRef, queryRef, shouldShowBackButton }: ProfileViewProps) {
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const query = useFragment(
    graphql`
      fragment ProfileViewQueryFragment on Query {
        ...useLoggedInUserIdFragment
        ...FollowButtonQueryFragment
        ...UserFollowCardQueryFragment
        ...createVirtualizedFeedEventItemsQueryFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);

  const {
    data: user,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment ProfileViewFragment on GalleryUser
      @refetchable(queryName: "ProfileViewFragmentRefetchableQuery") {
        __typename

        id
        bio
        username

        featuredGallery {
          dbid
          ...createVirtualizedGalleryRows
        }

        socialAccounts {
          twitter {
            username
          }
        }

        feed(last: $feedLast, before: $feedBefore) @connection(key: "ProfileViewFragment_feed") {
          edges {
            node {
              ... on FeedEvent {
                dbid
                ...createVirtualizedFeedEventItemsFragment
              }
            }
          }
        }

        galleries {
          dbid
          ...GalleryPreviewCardFragment
        }

        followers {
          dbid
          ...UserFollowCardFragment
        }

        following {
          dbid
          ...UserFollowCardFragment
        }

        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const isLoggedInUser = loggedInUserId === user.id;

  const handleShare = useCallback(() => {
    Share.share({ url: `https://gallery.so/${user.username}` });
  }, [user.username]);

  const handleQrCode = useCallback(() => {
    if (user.username) {
      navigation.navigate('ProfileQRCode', { username: user.username });
    }
  }, [navigation, user.username]);

  const handleTwitterPress = useCallback(() => {
    if (user.socialAccounts?.twitter?.username) {
      Linking.openURL(`https://twitter.com/${user.socialAccounts.twitter.username}`);
    }
  }, [user.socialAccounts?.twitter?.username]);

  const twitterPill = useMemo(() => {
    if (user.socialAccounts?.twitter?.username) {
      return (
        <TouchableOpacity onPress={handleTwitterPress} className="px-4">
          <Pill className="flex flex-row items-center space-x-2 self-start">
            <TwitterIcon />
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {user.socialAccounts.twitter.username}
            </Typography>
          </Pill>
        </TouchableOpacity>
      );
    }
  }, [handleTwitterPress, user.socialAccounts?.twitter?.username]);

  const { failedEvents, markEventAsFailure } = useFailedEventTracker();

  const [selectedRoute, setSelectedRoute] = useState('Featured');
  const [subTabRoute, setSubTabRoute] = useState('Followers');

  const handleUserPress = useCallback(
    (username: string) => {
      navigation.push('Profile', { username });
    },
    [navigation]
  );

  const handleLoadMore = useCallback(() => {
    if (selectedRoute === 'Activity' && hasPrevious) {
      loadPrevious(24);
    }
  }, [hasPrevious, loadPrevious, selectedRoute]);

  const { items, stickyIndices } = useMemo(() => {
    const items: ListItem[] = [
      { kind: 'bio', key: 'bio' },
      { kind: 'twitter', key: 'twitter' },
      { kind: 'tab-headers', selectedTab: selectedRoute, key: 'tab-headers' },
    ];

    const stickyIndices = [];

    if (selectedRoute === 'Followers') {
      items.push({ kind: 'sub-tab-headers', selectedTab: subTabRoute, key: 'sub-tab-headers' });
    }

    if (selectedRoute === 'Followers' && subTabRoute === 'Followers') {
      const followers = removeNullValues(user.followers);

      items.push(
        ...followers.map(
          (user): ListItem => ({
            user,
            kind: 'user-follow-card',
            key: `user-follow-card-${user.dbid}`,
          })
        )
      );
    } else if (selectedRoute === 'Followers' && subTabRoute === 'Following') {
      const following = removeNullValues(user.following);

      items.push(
        ...following.map(
          (user): ListItem => ({
            user,
            kind: 'user-follow-card',
            key: `user-follow-card-${user.dbid}`,
          })
        )
      );
    } else if (selectedRoute === 'Activity') {
      const feedEvents = [];
      for (const edge of user.feed?.edges ?? []) {
        if (edge?.node) {
          feedEvents.push(edge.node);
        }
      }
      feedEvents.reverse();

      const { items: feedItems, stickyIndices: feedStickyIndices } =
        createVirtualizedFeedEventItems({
          failedEvents,
          queryRef: query,
          eventRefs: feedEvents,
        });

      stickyIndices.push(
        ...feedStickyIndices.map((feedStickyIndex) => feedStickyIndex + items.length)
      );

      items.push(...feedItems);
    } else if (selectedRoute === 'Featured' && user.featuredGallery) {
      const { items: galleryItems, stickyIndices: galleryStickyIndices } =
        createVirtualizedGalleryRows({
          galleryRef: user.featuredGallery,
        });

      stickyIndices.push(
        ...galleryStickyIndices.map((galleryStickyIndex) => galleryStickyIndex + items.length)
      );

      items.push(...galleryItems);
    } else if (selectedRoute === 'Galleries') {
      const galleries = removeNullValues(user.galleries);

      items.push(
        ...galleries.map((gallery): ListItem => {
          return {
            key: `gallery-preview-${gallery.dbid}`,
            kind: 'gallery-preview',
            isFeatured: gallery.dbid === user.featuredGallery?.dbid,
            gallery,
          };
        })
      );
    }

    return { items, stickyIndices };
  }, [
    failedEvents,
    query,
    selectedRoute,
    subTabRoute,
    user.featuredGallery,
    user.feed?.edges,
    user.followers,
    user.following,
    user.galleries,
  ]);

  const ref = useRef<FlashList<ListItem> | null>(null);
  const scrollToFeedEvent = useCallback((item: FeedListItemType) => {
    if (ref.current) {
      ref.current.scrollToItem({ item, animated: true, viewPosition: 0.5, viewOffset: -20 });
    }
  }, []);

  const renderItem = useCallback<ListRenderItem<ListItem>>(
    ({ item, index }) => {
      let inner;
      if (item.kind === 'bio') {
        inner = (
          <View className="mb-4 px-4">
            <Markdown>{user.bio}</Markdown>
          </View>
        );
      } else if (item.kind === 'twitter') {
        inner = twitterPill ?? null;
      } else if (item.kind === 'tab-headers') {
        inner = (
          <ProfileTabBar
            activeRoute={item.selectedTab}
            onRouteChange={setSelectedRoute}
            routes={['Featured', 'Galleries', 'Followers', 'Activity']}
          />
        );
      } else if (item.kind === 'sub-tab-headers') {
        inner = (
          <FollowersTabBar
            routes={['Followers', 'Following']}
            activeRoute={item.selectedTab}
            onRouteChange={setSubTabRoute}
          />
        );
      } else if (item.kind === 'user-follow-card') {
        inner = <UserFollowCard onPress={handleUserPress} userRef={item.user} queryRef={query} />;
      } else if (item.kind === 'gallery-preview') {
        inner = (
          <View className="mb-4 px-4">
            <GalleryPreviewCard isFeatured={item.isFeatured} galleryRef={item.gallery} />
          </View>
        );
      } else if (
        item.kind === 'feed-item-header' ||
        item.kind === 'feed-item-caption' ||
        item.kind === 'feed-item-event' ||
        item.kind === 'feed-item-socialize'
      ) {
        const markFailure = () => markEventAsFailure(item.event.dbid);

        inner = (
          <FeedVirtualizedRow
            item={item}
            onFailure={markFailure}
            onCommentPress={scrollToFeedEvent}
          />
        );
      } else if (
        item.kind === 'collection-row' ||
        item.kind === 'collection-title' ||
        item.kind === 'collection-note' ||
        item.kind === 'gallery-header'
      ) {
        inner = <GalleryVirtualizedRow item={item} />;
      }

      return (
        <View
          className={clsx('bg-white dark:bg-black', {
            'pt-3': index === 0,
          })}
        >
          {inner}
        </View>
      );
    },
    [handleUserPress, markEventAsFailure, query, scrollToFeedEvent, twitterPill, user.bio]
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="flex flex-col p-4 pb-1 z-10">
        <View className="flex flex-row justify-between bg-white dark:bg-black">
          {shouldShowBackButton ? (
            <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />
          ) : (
            <View />
          )}

          <View className="flex flex-row items-center space-x-2">
            {isLoggedInUser && <IconContainer icon={<QRCodeIcon />} onPress={handleQrCode} />}
            <IconContainer icon={<ShareIcon />} onPress={handleShare} />

            {!isLoggedInUser && <FollowButton queryRef={query} userRef={user} />}
          </View>
        </View>
        <Typography
          className="bg-white dark:bg-black text-center text-2xl tracking-tighter"
          font={{ family: 'GTAlpina', weight: 'StandardLight' }}
        >
          {user.username}
        </Typography>
      </View>

      <GalleryTokenDimensionCacheProvider>
        <FlashList
          ref={ref}
          data={items}
          keyExtractor={(item) => item.key}
          getItemType={(item) => item.kind}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.8}
          className="flex-1"
          estimatedItemSize={200}
          renderItem={renderItem}
          stickyHeaderIndices={stickyIndices}
        />
      </GalleryTokenDimensionCacheProvider>
    </View>
  );
}
