import { Suspense, useMemo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
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
    { feedLast: 24, interactionsFirst: NOTES_PER_PAGE }
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
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <Suspense fallback={<ProfileViewFallback />}>
        <AccountScreenInner />
      </Suspense>
    </View>
  );
}
