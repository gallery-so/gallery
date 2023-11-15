import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { useIntervalEffectOnAppForeground } from 'src/utils/useIntervalEffectOnAppForeground';

import { NotificationBlueDotFragment$key } from '~/generated/NotificationBlueDotFragment.graphql';
import { NotificationBlueDotQuery } from '~/generated/NotificationBlueDotQuery.graphql';
import { RefetchableNotificationBlueDotFragmentQuery } from '~/generated/RefetchableNotificationBlueDotFragmentQuery.graphql';

export function LazyNotificationBlueDot() {
  const query = useLazyLoadQuery<NotificationBlueDotQuery>(
    graphql`
      query NotificationBlueDotQuery($before: String, $last: Int) {
        ...NotificationBlueDotFragment
      }
    `,
    {
      before: null,
      last: 1,
    }
  );

  return <BlueDot queryRef={query} />;
}

type BlueDotProps = {
  queryRef: NotificationBlueDotFragment$key;
};

function BlueDot({ queryRef }: BlueDotProps) {
  const [query, refetch] = useRefetchableFragment<
    RefetchableNotificationBlueDotFragmentQuery,
    NotificationBlueDotFragment$key
  >(
    graphql`
      fragment NotificationBlueDotFragment on Query
      @refetchable(queryName: "RefetchableNotificationBlueDotFragmentQuery") {
        viewer {
          ... on Viewer {
            __typename
            notifications(before: $before, last: $last)
              @connection(key: "NotificationBlueDot_notifications") {
              unseenCount
              # Relay requires that we grab the edges field if we use the connection directive
              # We're selecting __typename since that shouldn't have a cost
              # eslint-disable-next-line relay/unused-fields
              edges {
                __typename
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const handleNotificationRefresh = useCallback(() => {
    refetch({}, { fetchPolicy: 'network-only' });
  }, [refetch]);

  useIntervalEffectOnAppForeground(handleNotificationRefresh);

  const hasUnreadNotifications = useMemo(() => {
    if (query.viewer && query.viewer.__typename === 'Viewer') {
      return (query.viewer?.notifications?.unseenCount ?? 0) > 0;
    }

    return false;
  }, [query.viewer]);

  if (hasUnreadNotifications) {
    return <View className="bg-activeBlue absolute right-0 top-0 h-2 w-2 rounded-full" />;
  }

  return null;
}
