import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { TrendingSectionFragment$key } from '~/generated/TrendingSectionFragment.graphql';
import { TrendingSectionQueryFragment$key } from '~/generated/TrendingSectionQueryFragment.graphql';

import { Typography } from '../Typography';
import { TrendingUserList } from './TrendingUserList';

type Props = {
  title: string;
  description: string;
  queryRef: TrendingSectionQueryFragment$key;
  trendingUsersRef: TrendingSectionFragment$key;
};

export function TrendingSection({ title, description, queryRef, trendingUsersRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TrendingSectionQueryFragment on Query {
        ...TrendingUserListQueryFragment
      }
    `,
    queryRef
  );

  const trendingUsers = useFragment(
    graphql`
      fragment TrendingSectionFragment on TrendingUsersPayload {
        users {
          ...TrendingUserListFragment
        }
      }
    `,
    trendingUsersRef
  );

  return (
    <View className="flex-1 px-3">
      <View className="flex flex-row items-end justify-between py-3">
        <View>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-lg text-black dark:text-white"
          >
            {title}
          </Typography>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-metal text-sm"
          >
            {description}
          </Typography>
        </View>
      </View>

      <TrendingUserList usersRef={trendingUsers.users ?? []} queryRef={query} />
    </View>
  );
}
