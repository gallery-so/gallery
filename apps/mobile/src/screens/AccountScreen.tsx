import { Suspense, useMemo } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesList';
import { ProfileView } from '~/components/ProfileView/ProfileView';
import { ProfileViewFallback } from '~/components/ProfileView/ProfileViewFallback';
import { Typography } from '~/components/Typography';
import { AccountScreenQuery } from '~/generated/AccountScreenQuery.graphql';

function AccountScreenInner() {
  const query = useLazyLoadQuery<AccountScreenQuery>(
    graphql`
      query AccountScreenQuery(
        $feedLast: Int!
        $feedBefore: String
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        viewer {
          ... on Viewer {
            __typename

            user {
              ...ProfileViewFragment
            }
          }
        }

        ...ProfileViewQueryFragment
      }
    `,
    {
      feedLast: 24,
      interactionsFirst: NOTES_PER_PAGE,
    },
    {
      fetchPolicy: 'network-only',
    }
  );

  const inner = useMemo(() => {
    if (query.viewer?.__typename === 'Viewer' && query.viewer.user) {
      return (
        <ProfileView shouldShowBackButton={false} queryRef={query} userRef={query.viewer.user} />
      );
    } else {
      return <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Not found</Typography>;
    }
  }, [query]);

  return <View className="flex-1">{inner}</View>;
}

export function AccountScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Suspense fallback={<ProfileViewFallback />}>
        <AccountScreenInner />
      </Suspense>
    </View>
  );
}
