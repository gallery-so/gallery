import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { XMarkIcon } from '~/components/Search/XMarkIcon';
import { LoadingFollowerList } from '~/components/Trending/LoadingFollowerList';
import { SuggestionUser } from '~/components/Trending/SuggestionUser';
import { Typography } from '~/components/Typography';
import { UserSuggestionListScreenQuery } from '~/generated/UserSuggestionListScreenQuery.graphql';

export function UserSuggestionListScreen() {
  const query = useLazyLoadQuery<UserSuggestionListScreenQuery>(
    graphql`
      query UserSuggestionListScreenQuery {
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
                    ...SuggestionUserFragment
                  }
                }
              }
            }
          }
        }
        ...SuggestionUserQueryFragment
      }
    `,
    {}
  );

  const navigation = useNavigation();

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.viewer.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer.suggestedUsers?.edges]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Suspense fallback={<LoadingFollowerList />}>
      <View className="mx-auto mt-3 h-1 w-20 rounded-md bg-[#d9d9d9]" />
      <View className="p-4">
        <TouchableOpacity
          onPress={handleClose}
          className="bg-porcelain mb-4 flex h-6 w-6 items-center justify-center rounded-full"
        >
          <XMarkIcon />
        </TouchableOpacity>
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-lg"
        >
          Suggested curators for you
        </Typography>
      </View>
      <SafeAreaView className="flex-1">
        <ScrollView>
          {nonNullUsers.map((user, index) => (
            <SuggestionUser key={index} userRef={user} queryRef={query} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </Suspense>
  );
}
