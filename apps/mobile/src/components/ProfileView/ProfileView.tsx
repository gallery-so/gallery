import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Linking, Share, TouchableOpacity, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { IconContainer } from '~/components/IconContainer';
import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import { Typography } from '~/components/Typography';
import { ProfileViewFragment$key } from '~/generated/ProfileViewFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { ProfileTabNavigator } from '~/navigation/ProfileTabNavigator/ProfileTabNavigator';
import { RootStackNavigatorProp } from '~/navigation/types';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import { BackIcon } from '../../icons/BackIcon';
import { QRCodeIcon } from '../../icons/QRCodeIcon';
import { ShareIcon } from '../../icons/ShareIcon';
import { TwitterIcon } from '../../icons/TwitterIcon';

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
        bio
        username

        socialAccounts {
          twitter {
            username
          }
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

  return (
    <View className="flex flex-1 flex-col space-y-4">
      <View className="flex flex-col">
        <View className="flex flex-row justify-between p-4">
          <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />

          <View className="flex flex-row items-center space-x-2">
            {isLoggedInUser && <IconContainer icon={<QRCodeIcon />} onPress={handleQrCode} />}
            <IconContainer icon={<ShareIcon />} onPress={handleShare} />

            {!isLoggedInUser && <FollowButton queryRef={query} userRef={user} />}
          </View>
        </View>

        <View className="flex flex-col space-y-4 px-4">
          <Typography
            className="text-center text-2xl"
            font={{ family: 'GTAlpina', weight: 'StandardLight' }}
          >
            {user.username}
          </Typography>

          <Markdown>{user.bio}</Markdown>

          {user.socialAccounts?.twitter?.username && (
            <TouchableOpacity onPress={handleTwitterPress}>
              <Pill className="flex flex-row items-center space-x-2 self-start">
                <TwitterIcon />
                <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                  {user.socialAccounts.twitter.username}
                </Typography>
              </Pill>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-grow">
        <ProfileTabNavigator />
      </View>
    </View>
  );
}
