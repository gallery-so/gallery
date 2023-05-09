import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Share, View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { IconContainer } from '~/components/IconContainer';
import { GalleryProfileNavBarFragment$key } from '~/generated/GalleryProfileNavBarFragment.graphql';
import { GalleryProfileNavBarQueryFragment$key } from '~/generated/GalleryProfileNavBarQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import { BackIcon } from '../../icons/BackIcon';
import { QRCodeIcon } from '../../icons/QRCodeIcon';
import { ShareIcon } from '../../icons/ShareIcon';

type GalleryProfileNavBarProps = {
  style?: ViewProps['style'];
  shouldShowBackButton: boolean;
  queryRef: GalleryProfileNavBarQueryFragment$key;
  userRef: GalleryProfileNavBarFragment$key;
};

export function GalleryProfileNavBar({
  style,
  queryRef,
  userRef,
  shouldShowBackButton,
}: GalleryProfileNavBarProps) {
  const query = useFragment(
    graphql`
      fragment GalleryProfileNavBarQueryFragment on Query {
        ...useLoggedInUserIdFragment
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment GalleryProfileNavBarFragment on GalleryUser {
        __typename
        id
        username

        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const loggedInUserId = useLoggedInUserId(query);

  const isLoggedInUser = loggedInUserId === user.id;

  const handleShare = useCallback(() => {
    Share.share({ url: `https://gallery.so/${user.username}` });
  }, [user.username]);

  const handleQrCode = useCallback(() => {
    if (user.username) {
      navigation.navigate('ProfileQRCode', { username: user.username });
    }
  }, [navigation, user.username]);

  return (
    <View style={style} className="flex flex-row justify-between bg-white dark:bg-black">
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
  );
}
