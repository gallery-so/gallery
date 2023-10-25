import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Markdown } from '~/components/Markdown';
import { ProfileViewHeaderFragment$key } from '~/generated/ProfileViewHeaderFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useIsChristinaFromLens } from '~/shared/hooks/useIsChristinaFromLens';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import { GalleryTabBar } from '../GalleryTabs/GalleryTabBar';
import ProfileViewSharedInfo from './ProfileViewSharedInfo/ProfileViewSharedInfo';
import ProfileViewFarcasterPill from './SocialPills/ProfileViewFarcasterPill';
import ProfileViewLensPill from './SocialPills/ProfileViewLensPill';
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

            socialAccounts {
              farcaster {
                username
              }
              lens {
                username
              }
              twitter {
                username
              }
            }

            feed(before: $feedBefore, last: $feedLast)
              @connection(key: "ProfileViewHeaderFragment_feed") {
              # Relay doesn't allow @connection w/o edges so we must query for it
              # eslint-disable-next-line relay/unused-fields
              edges {
                __typename
              }
              pageInfo {
                total
              }
            }

            ...ProfileViewSharedInfoFragment
            ...ProfileViewFarcasterPillFragment
            ...ProfileViewTwitterPillFragment
            ...ProfileViewLensPillFragment
            ...useIsChristinaFromLensFragment
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
  const isChristinaFromLens = useIsChristinaFromLens(user);

  const totalFollowers = user.followers?.length ?? 0;
  const totalGalleries = useMemo(() => {
    return (
      removeNullValues(user.galleries?.map((gallery) => (gallery?.hidden ? null : gallery)))
        .length ?? 0
    );
  }, [user.galleries]);
  const totalPosts = user.feed?.pageInfo?.total ?? 0;

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
        name: 'Posts',
        counter: totalPosts,
      },
      {
        name: 'Followers',
        counter: totalFollowers,
      },
    ];
  }, [totalGalleries, totalPosts, totalFollowers]);

  const numPills = useMemo(() => {
    return [
      user.socialAccounts?.farcaster?.username,
      user.socialAccounts?.lens?.username,
      user.socialAccounts?.twitter?.username,
    ].filter((username) => Boolean(username)).length;
  }, [
    user.socialAccounts?.farcaster?.username,
    user.socialAccounts?.lens?.username,
    user.socialAccounts?.twitter?.username,
  ]);

  const maxPillWidth = 90 / numPills + '%';

  return (
    <View>
      {user.bio && (
        <View className="px-4">
          <Markdown>{user.bio}</Markdown>
        </View>
      )}
      {!isLoggedInUser && <ProfileViewSharedInfo userRef={user} />}
      {numPills > 0 && (
        <View className={`flex flex-row mx-4 mt-4 w-full ml-2`}>
          <ProfileViewTwitterPill userRef={user} maxWidth={maxPillWidth} />
          {isChristinaFromLens ? null : (
            <ProfileViewFarcasterPill userRef={user} maxWidth={maxPillWidth} />
          )}
          <ProfileViewLensPill userRef={user} maxWidth={maxPillWidth} />
        </View>
      )}

      <GalleryTabBar
        activeRoute={selectedRoute}
        onRouteChange={onRouteChange}
        routes={routes}
        eventElementId="Profile Tab"
        eventName="Profile Tab Clicked"
        eventContext={contexts.UserGallery}
      />
    </View>
  );
}
