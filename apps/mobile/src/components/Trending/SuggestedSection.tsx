import { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { SuggestedSectionQueryFragment$key } from '~/generated/SuggestedSectionQueryFragment.graphql';

import { Typography } from '../Typography';
import { TrendingUserCard } from './TrendingUserCard';

type Props = {
  title: string;
  description: string;
  queryRef: SuggestedSectionQueryFragment$key;
};

export function SuggestedSection({ title, description, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment SuggestedSectionQueryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 24)
              @connection(key: "ExploreFragment_suggestedUsers")
              @required(action: THROW) {
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    __typename
                    id
                    ...TrendingUserCardFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  // map edge nodes to an array of GalleryUsers
  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.viewer.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer.suggestedUsers?.edges]);

  return (
    <View className="flex-1 px-3">
      <View className="flex flex-row items-end justify-between py-3">
        <View>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-lg text-black"
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
        <TouchableOpacity onPress={() => {}}>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-shadow text-sm underline"
          >
            See all
          </Typography>
        </TouchableOpacity>
      </View>

      {/* TODO: Refactor this tailwind class */}
      <View className="flex flex-row flex-wrap justify-between">
        {nonNullUsers.map((user) => (
          <View className="mb-2 w-[49%]">
            <TrendingUserCard key={user.id} userRef={user} />
          </View>
        ))}
      </View>
    </View>
  );
}
