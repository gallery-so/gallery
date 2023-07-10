import { useCallback, useMemo } from 'react';
import { Linking, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import { ProfileTabBar } from '~/components/ProfileView/ProfileTabBar';
import { Typography } from '~/components/Typography';
import { ProfileViewHeaderFragment$key } from '~/generated/ProfileViewHeaderFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import { TwitterIcon } from '../../icons/TwitterIcon';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import ProfileViewSharedInfo from './ProfileViewSharedInfo/ProfileViewSharedInfo';

type Props = {
  selectedRoute: string;
  onRouteChange: (value: string) => void;

  queryRef: ProfileViewHeaderFragment$key;
};

export function ProfileViewHeader({ queryRef, selectedRoute, onRouteChange }: Props) {
  const query = useFragment(
    graphql`
      fragment ProfileViewHeaderFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            __typename
            id
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
            ...ProfileViewSharedInfoFragment
          }
        }

        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const user = query?.userByUsername;
  const loggedInUserId = useLoggedInUserId(query);

  if (user?.__typename !== 'GalleryUser') {
    throw new Error(`Unable to fetch the current user`);
  }

  const isLoggedInUser = loggedInUserId === user.id;

  const handleTwitterPress = useCallback(() => {
    if (user.socialAccounts?.twitter?.username) {
      Linking.openURL(`https://twitter.com/${user.socialAccounts.twitter.username}`);
    }
  }, [user.socialAccounts?.twitter?.username]);

  const twitterPill = useMemo(() => {
    if (user.socialAccounts?.twitter?.username) {
      return (
        <GalleryTouchableOpacity
          onPress={handleTwitterPress}
          className="px-4"
          eventElementId="Social Pill"
          eventName="Social Pill Clicked"
          properties={{ variant: 'Twitter' }}
        >
          <Pill className="flex flex-row items-center space-x-2 self-start">
            <TwitterIcon width={14} />
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
      {!isLoggedInUser && <ProfileViewSharedInfo userRef={user} />}

      {twitterPill ?? null}

      <ProfileTabBar activeRoute={selectedRoute} onRouteChange={onRouteChange} routes={routes} />
    </View>
  );
}
