import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Share, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { IconContainer } from '~/components/IconContainer';
import { ProfileViewFragment$key } from '~/generated/ProfileViewFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import { BackIcon } from '../../icons/BackIcon';
import { QRCodeIcon } from '../../icons/QRCodeIcon';
import { ShareIcon } from '../../icons/ShareIcon';

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
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);

  const user = useFragment(
    graphql`
      fragment ProfileViewFragment on GalleryUser {
        __typename

        id
        username

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

  return (
    <View className="flex flex-1 flex-col">
      <View className="flex flex-row justify-between px-4">
        <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />

        <View className="flex flex-row items-center space-x-2">
          {isLoggedInUser && <IconContainer icon={<QRCodeIcon />} onPress={handleQrCode} />}
          <IconContainer icon={<ShareIcon />} onPress={handleShare} />

          {!isLoggedInUser && <FollowButton queryRef={query} userRef={user} />}
        </View>
      </View>
    </View>
  );
}
