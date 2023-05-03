import { useCallback, useMemo } from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import { ProfileTabBar } from '~/components/ProfileView/ProfileTabBar';
import { Typography } from '~/components/Typography';
import { ProfileViewHeaderFragment$key } from '~/generated/ProfileViewHeaderFragment.graphql';

import { TwitterIcon } from '../../icons/TwitterIcon';

type Props = {
  selectedRoute: string;
  onRouteChange: (value: string) => void;

  userRef: ProfileViewHeaderFragment$key;
};

export function ProfileViewHeader({ userRef, selectedRoute, onRouteChange }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewHeaderFragment on GalleryUser {
        bio

        socialAccounts {
          twitter {
            __typename
            username
          }
        }
      }
    `,
    userRef
  );

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

  return (
    <View>
      <View className="mb-4 px-4">
        <Markdown>{user.bio}</Markdown>
      </View>

      {twitterPill ?? null}

      <ProfileTabBar
        activeRoute={selectedRoute}
        onRouteChange={onRouteChange}
        routes={['Featured', 'Galleries', 'Followers', 'Activity']}
      />
    </View>
  );
}
