import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { Linking, Share, TouchableOpacity, View } from 'react-native';
import { useFragment, usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  createVirtualizedItemsFromFeedEvents,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedItemsFromFeedEvents';
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
import { ProfileTabBar } from '~/components/ProfileView/ProfileTabBar';
import { Typography } from '~/components/Typography';
import { UserFollowCard } from '~/components/UserFollowList/UserFollowCard';
import { GalleryTokenDimensionCacheProvider } from '~/contexts/GalleryTokenDimensionCacheContext';
import { ProfileViewFragment$key } from '~/generated/ProfileViewFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { UserFollowCardFragment$key } from '~/generated/UserFollowCardFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
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
);

type ProfileViewProps = {
  queryRef: ProfileViewQueryFragment$key;
  userRef: ProfileViewFragment$key;
};

export function ProfileView({ userRef, queryRef }: ProfileViewProps) {
  const navigation = useNavigation<RootStackNavigatorProp>();

  const query = useFragment(
    graphql`
      fragment ProfileViewQueryFragment on Query {
        ...useLoggedInUserIdFragment
        ...FollowButtonQueryFragment
        ...UserFollowCardQueryFragment
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
                ...createVirtualizedItemsFromFeedEvents
              }
            }
          }
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
        createVirtualizedItemsFromFeedEvents({
          failedEvents,
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
    }

    return { items, stickyIndices };
  }, [
    failedEvents,
    selectedRoute,
    subTabRoute,
    user.featuredGallery,
    user.feed?.edges,
    user.followers,
    user.following,
  ]);

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
        inner = <UserFollowCard userRef={item.user} queryRef={query} />;
      } else if (
        item.kind === 'feed-item-header' ||
        item.kind === 'feed-item-caption' ||
        item.kind === 'feed-item-event'
      ) {
        const markFailure = () => markEventAsFailure(item.event.dbid);

        inner = <FeedVirtualizedRow item={item} onFailure={markFailure} />;
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
          className={clsx('bg-white', {
            'pt-3': index === 0,
          })}
        >
          {inner}
        </View>
      );
    },
    [markEventAsFailure, query, twitterPill, user.bio]
  );

  return (
    <View className="flex-1">
      <View className="flex flex-col bg-white p-4 pb-1">
        <View className="flex flex-row justify-between bg-white">
          {navigation.canGoBack() ? (
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
          className="bg-white text-center text-2xl"
          font={{ family: 'GTAlpina', weight: 'StandardLight' }}
        >
          {user.username}
        </Typography>
      </View>

      <GalleryTokenDimensionCacheProvider>
        <FlashList
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
