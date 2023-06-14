import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { InteractiveLink } from '~/components/InteractiveLink';
import { Typography } from '~/components/Typography';
import { ProfileViewMutualFollowersFragment$key } from '~/generated/ProfileViewMutualFollowersFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { ProfileViewMutualFollowersSheet } from './ProfileViewMutualFollowersSheet';

export const MUTUAL_FOLLOWERS_PER_PAGE = 20;

type Props = {
  userRef: ProfileViewMutualFollowersFragment$key;
  queryRef;
};

export default function ProfileViewMutualFollowers({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewMutualFollowersFragment on GalleryUser {
        __typename
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "UserSharedInfoFragment_sharedFollowers") {
          edges {
            node {
              __typename
              ... on GalleryUser {
                __typename
                username
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...ProfileViewMutualFollowersSheetFragment
      }
    `,
    userRef
  );

  // console.log({ user });

  const sharedFollowers = useMemo(() => {
    const list = user.sharedFollowers?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [user.sharedFollowers?.edges]);

  const totalSharedFollowers = user.sharedFollowers?.pageInfo?.total ?? 0;

  // Determine how many users to display by username
  const followersToDisplay = useMemo(() => {
    // In most cases we display a max of 2 usernames. ie "username1, username2 and 3 others you follow"
    // But if there are exactly 3 shared followers, we display all 3 usernames. ie "username1, username2 and username3"
    const maxUsernamesToDisplay = totalSharedFollowers === 3 ? 3 : 2;
    return sharedFollowers.slice(0, maxUsernamesToDisplay);
  }, [sharedFollowers, totalSharedFollowers]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleUsernamePress = useCallback(
    (username: string) => {
      // if (token.owner?.username) {
      navigation.push('Profile', { username: username });
      // }
    },
    [navigation]
  );
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const [bottomSectionHeight, setBottomSectionHeight] = useState(200);

  const handleSeeAllPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const content = useMemo(() => {
    // Display up to 3 usernames
    const result = followersToDisplay.map((user) => (
      <InteractiveLink onPress={() => handleUsernamePress(user.username)}>
        <Typography
          className="text-xs underline text-shadow"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {user.username}
        </Typography>
      </InteractiveLink>
    ));

    // If there are more than 3 usernames, add a link to show all in a popover
    if (totalSharedFollowers > 3) {
      result.push(
        <GalleryTouchableOpacity
          onPress={handleSeeAllPress}
          eventElementId="See All Mutual Followers Button"
          eventName="See All Mutual Followers Clicked"
        >
          <Typography
            className="text-xs underline text-shadow"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {totalSharedFollowers - 2} others
          </Typography>
        </GalleryTouchableOpacity>
      );
    }

    // Add punctuation: "," and "and"
    if (result.length === 3) {
      result.splice(
        1,
        0,
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          ,&nbsp;
        </Typography>
      );
    }
    if (result.length > 1) {
      result.splice(
        -1,
        0,
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          &nbsp;and&nbsp;
        </Typography>
      );
    }

    return result;
  }, [followersToDisplay, handleSeeAllPress, handleUsernamePress, totalSharedFollowers]);

  if (totalSharedFollowers === 0) {
    return null;
  }

  return (
    <View className="flex flex-row">
      <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        Followed by&nbsp;
      </Typography>
      {content}
      <ProfileViewMutualFollowersSheet ref={bottomSheetRef} userRef={user} />
    </View>
  );
}
