import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useMemo } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesList';
import { ProfileView } from '~/components/ProfileView/ProfileView';
import { ProfileViewFallback } from '~/components/ProfileView/ProfileViewFallback';
import { Typography } from '~/components/Typography';
import { ProfileScreenQuery } from '~/generated/ProfileScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

function ProfileScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Profile'>>();

  const query = useLazyLoadQuery<ProfileScreenQuery>(
    graphql`
      query ProfileScreenQuery(
        $username: String!
        $feedLast: Int!
        $feedBefore: String
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
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
    {
      username: route.params.username,
      feedLast: 24,
      interactionsFirst: NOTES_PER_PAGE,
    },
    { fetchPolicy: 'network-only' }
  );

  const inner = useMemo(() => {
    if (query.userByUsername?.__typename === 'GalleryUser') {
      return <ProfileView shouldShowBackButton queryRef={query} userRef={query.userByUsername} />;
    } else {
      return <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Not found</Typography>;
    }
  }, [query]);

  return inner;
}

export function ProfileScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Suspense fallback={<ProfileViewFallback />}>
        <ProfileScreenInner />
      </Suspense>
    </View>
  );
}
