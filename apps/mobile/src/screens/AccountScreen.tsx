import { Suspense, useMemo } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfileView } from '~/components/ProfileView/ProfileView';
import { Typography } from '~/components/Typography';
import { AccountScreenQuery } from '~/generated/AccountScreenQuery.graphql';

function AccountScreenInner() {
  const query = useLazyLoadQuery<AccountScreenQuery>(
    graphql`
      query AccountScreenQuery($feedLast: Int!, $feedBefore: String) {
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
    { feedLast: 24 }
  );

  const inner = useMemo(() => {
    if (query.viewer?.__typename === 'Viewer' && query.viewer.user) {
      return <ProfileView queryRef={query} userRef={query.viewer.user} />;
    } else {
      return <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Not found</Typography>;
    }
  }, [query]);

  return <View className="flex-1">{inner}</View>;
}

export function AccountScreen() {
  return (
    <Suspense fallback={null}>
      <AccountScreenInner />
    </Suspense>
  );
}
