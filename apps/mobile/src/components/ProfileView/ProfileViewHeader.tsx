import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Markdown } from '~/components/Markdown';
import { ProfileTabBar } from '~/components/ProfileView/ProfileTabBar';
import { ProfileViewHeaderFragment$key } from '~/generated/ProfileViewHeaderFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import ProfileViewSharedInfo from './ProfileViewSharedInfo/ProfileViewSharedInfo';
import ProfileViewFarcasterPill from './SocialPills/ProfileViewFarcasterPill';
import ProfileViewTwitterPill from './SocialPills/ProfileViewTwitterPill';

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

            ...ProfileViewSharedInfoFragment
            ...ProfileViewFarcasterPillFragment
            ...ProfileViewTwitterPillFragment
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
        <View className="px-4">
          <Markdown>{user.bio}</Markdown>
        </View>
      )}
      {!isLoggedInUser && <ProfileViewSharedInfo userRef={user} />}
      <View className={`flex flex-row mx-4 space-x-12 mt-4`}>
        <ProfileViewTwitterPill userRef={user} />
        <ProfileViewFarcasterPill userRef={user} />
      </View>

      <ProfileTabBar activeRoute={selectedRoute} onRouteChange={onRouteChange} routes={routes} />
    </View>
  );
}
