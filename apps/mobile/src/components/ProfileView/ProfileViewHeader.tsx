import { useCallback, useMemo } from 'react';
import { Linking, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import { ProfileTabBar } from '~/components/ProfileView/ProfileTabBar';
import { Typography } from '~/components/Typography';
import { ProfileViewHeaderFragment$key } from '~/generated/ProfileViewHeaderFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { TwitterIcon } from '../../icons/TwitterIcon';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

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

        galleries {
          __typename
          hidden
        }
        followers {
          __typename
        }

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
        <GalleryTouchableOpacity onPress={handleTwitterPress} className="px-4">
          <Pill className="flex flex-row items-center space-x-2 self-start">
            <TwitterIcon />
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {user.socialAccounts.twitter.username}
            </Typography>
          </Pill>
        </GalleryTouchableOpacity>
      );
    }
  }, [handleTwitterPress, user.socialAccounts?.twitter?.username]);

  const totalFollowers = user.followers?.length ?? 0;
  const totalGalleries = useMemo(() => {
    return (
      removeNullValues(user.galleries?.map((gallery) => (gallery?.hidden ? null : gallery)))
        .length ?? 0
    );
  }, [user.galleries]);

  const routes = useMemo(() => {
    return [
      {
        name: 'Featured',
      },
      {
        name: 'Galleries',
        counter: totalGalleries,
      },
      {
        name: 'Followers',
        counter: totalFollowers,
      },
      {
        name: 'Activity',
      },
    ];
  }, [totalGalleries, totalFollowers]);

  return (
    <View>
      {user.bio && (
        <View className="mb-4 px-4">
          <Markdown>{user.bio}</Markdown>
        </View>
      )}

      {twitterPill ?? null}

      <ProfileTabBar activeRoute={selectedRoute} onRouteChange={onRouteChange} routes={routes} />
    </View>
  );
}