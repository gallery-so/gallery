import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { XMarkIcon } from '~/components/Search/XMarkIcon';
import { LoadingFollowerList } from '~/components/Trending/LoadingFollowerList';
import { SuggestionUser } from '~/components/Trending/SuggestionUser';
import { Typography } from '~/components/Typography';
import { TwitterSuggestionListScreenQuery } from '~/generated/TwitterSuggestionListScreenQuery.graphql';
import { TwitterSuggestionListScreenQueryFragment$key } from '~/generated/TwitterSuggestionListScreenQueryFragment.graphql';
import { TwitterSuggestionListScreenRefetchableQuery } from '~/generated/TwitterSuggestionListScreenRefetchableQuery.graphql';

export function TwitterSuggestionListScreen() {
  const queryRef = useLazyLoadQuery<TwitterSuggestionListScreenQuery>(
    graphql`
      query TwitterSuggestionListScreenQuery($twitterListFirst: Int!, $twitterListAfter: String) {
        ...TwitterSuggestionListScreenQueryFragment
      }
    `,
    {
      twitterListFirst: 24,
      twitterListAfter: null,
    }
  );

  const { data: query } = usePaginationFragment<
    TwitterSuggestionListScreenRefetchableQuery,
    TwitterSuggestionListScreenQueryFragment$key
  >(
    graphql`
      fragment TwitterSuggestionListScreenQueryFragment on Query
      @refetchable(queryName: "TwitterSuggestionListScreenRefetchableQuery") {
        socialConnections(
          after: $twitterListAfter
          first: $twitterListFirst
          socialAccountType: Twitter
          excludeAlreadyFollowing: false
        ) @connection(key: "TwitterSuggestionListScreen_socialConnections") {
          edges {
            node {
              __typename
              ... on SocialConnection {
                __typename
                galleryUser {
                  ... on GalleryUser {
                    __typename
                    ...SuggestionUserFragment
                  }
                }
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...SuggestionUserQueryFragment
      }
    `,
    queryRef
  );

  const totalFollowing = query.socialConnections?.pageInfo.total ?? 0;

  const navigation = useNavigation();

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.socialConnections?.edges ?? []) {
      if (edge?.node?.__typename === 'SocialConnection' && edge?.node?.galleryUser) {
        users.push(edge.node.galleryUser);
      }
    }

    return users;
  }, [query.socialConnections?.edges]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Suspense fallback={<LoadingFollowerList />}>
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
          We've found {totalFollowing} {totalFollowing ? 'person' : 'people'} you know from Twitter
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
