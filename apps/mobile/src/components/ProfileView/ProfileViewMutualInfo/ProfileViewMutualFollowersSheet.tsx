import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { ProfileViewMutualFollowersSheetFragment$key } from '~/generated/ProfileViewMutualFollowersSheetFragment.graphql';
import { ProfileViewMutualFollowersSheetQuery } from '~/generated/ProfileViewMutualFollowersSheetQuery.graphql';

import { useListContentStyle } from '../Tabs/useListContentStyle';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const snapPoints = ['50%'];

type ListItem = { kind: 'user'; user: ProfileViewMutualFollowersSheetFragment$key };

function ProfileViewMutualFollowersSheet(
  props: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment ProfileViewMutualFollowersSheetFragment on GalleryUser
      @refetchable(queryName: "ProfileViewMutualFollowersSheetRefetchableFragment") {
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "UserSharedInfoFragment_sharedFollowers") {
          edges {
            node {
              ... on GalleryUser {
                #   __typename
                # ...UserFollowCardFragment
                username
                bio
                id
                dbid
              }
            }
          }
        }
      }
    `,
    props.userRef
  );

  // const query = useLazyLoadQuery<ProfileViewMutualFollowersSheetQuery>(
  //   graphql`
  //     query ProfileViewMutualFollowersSheetQuery {
  //       ...UserFollowListQueryFragment
  //     }
  //   `,
  //   {}
  // );

  // const sorted

  const sharedFollowers = useMemo(
    () => data.sharedFollowers?.edges ?? [],
    [data.sharedFollowers?.edges]
  );

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of sharedFollowers) {
      // console.log(edge.node);
      // if (edge?.node?.__typename === 'SocialConnection' && edge?.node?.galleryUser) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    // console.log({ sharedFollowers });

    return users;
  }, [sharedFollowers]);
  // console.log({ sharedFollowers });

  // const loadMore = useCallback(() => {
  //   if (hasPrevious) {
  //     loadPrevious(NOTES_PER_PAGE);
  //   }
  // }, [hasPrevious, loadPrevious]);

  // const renderItem = useCallback<ListRenderItem<ListItem>>(({ item }) => {
  //   console.log(item.node.username);
  //   return (
  //     <View className="py-3">
  //       <Typography
  //         className="text-sm"
  //         font={{
  //           family: 'ABCDiatype',
  //           weight: 'Bold',
  //         }}
  //       >
  //         {item.node.username}
  //       </Typography>
  //     </View>
  //   );
  // }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNext) {
      loadNext(20);
    }
  }, [hasNext, loadNext]);
  const contentContainerStyle = useListContentStyle();

  const handleUserPress = useCallback((username: string) => {
    // navigation.goBack();
    // route.params.onUserPress(username);
  }, []);

  console.log({ nonNullUsers });

  return (
    <GalleryBottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
      <View className="px-4" style={contentContainerStyle}>
        <Typography
          className="text-sm mb-4"
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          Followers
        </Typography>

        <View className="mx-4 flex-grow">
          {/* <UserFollowList
            onUserPress={handleUserPress}
            // onLoadMore={handleLoadMore}
            userRefs={nonNullUsers}
            queryRef={query}
          /> */}
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedProfileViewMutualFollowersSheet = forwardRef<GalleryBottomSheetModalType, Props>(
  ProfileViewMutualFollowersSheet
);

export { ForwardedProfileViewMutualFollowersSheet as ProfileViewMutualFollowersSheet };
