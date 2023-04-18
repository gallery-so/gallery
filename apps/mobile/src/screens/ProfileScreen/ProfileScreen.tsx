import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useMemo } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfileView } from '~/components/ProfileView/ProfileView';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { ProfileScreenQuery } from '~/generated/ProfileScreenQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';

function ProfileScreenInner() {
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'Profile'>>();

  const query = useLazyLoadQuery<ProfileScreenQuery>(
    graphql`
      query ProfileScreenQuery($username: String!) {
        userByUsername(username: $username) {
          ... on GalleryUser {
            ...ProfileViewFragment
          }

          ... on ErrUserNotFound {
            __typename
          }

          ... on Error {
            __typename
          }
        }

        ...ProfileViewQueryFragment
      }
    `,
    { username: route.params.username }
  );

  const inner = useMemo(() => {
    if (query.userByUsername?.__typename === 'GalleryUser') {
      return <ProfileView queryRef={query} userRef={query.userByUsername} />;
    } else {
      return <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Not found</Typography>;
    }
  }, [query]);

  return <SafeAreaViewWithPadding className="flex-1 bg-white">{inner}</SafeAreaViewWithPadding>;
}

export function ProfileScreen() {
  return (
    <Suspense fallback={null}>
      <ProfileScreenInner />
    </Suspense>
  );
}
