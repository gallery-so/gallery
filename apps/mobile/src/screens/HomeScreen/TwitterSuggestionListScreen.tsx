import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { ModalContainer } from '~/components/ModalContainer';
import { USERS_PER_PAGE } from '~/components/Trending/constants';
import { LoadingFollowerList } from '~/components/Trending/LoadingFollowerList';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { TwitterSuggestionListScreenQuery } from '~/generated/TwitterSuggestionListScreenQuery.graphql';
import { TwitterSuggestionListScreenQueryFragment$key } from '~/generated/TwitterSuggestionListScreenQueryFragment.graphql';
import { TwitterSuggestionListScreenRefetchableQuery } from '~/generated/TwitterSuggestionListScreenRefetchableQuery.graphql';
import { LoggedInStackNavigatorProp, RootStackNavigatorParamList } from '~/navigation/types';

type Props = {
  queryRef: TwitterSuggestionListScreenQueryFragment$key;
};

export function InnerSuggestionListScreen({ queryRef }: Props) {
  const {
    data: query,
    loadNext,
    hasNext,
  } = usePaginationFragment<
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
                    ...UserFollowListFragment
                  }
                }
              }
            }
          }
          pageInfo {
            total
          }
        }

        ...UserFollowListQueryFragment
      }
    `,
    queryRef
  );

  const totalFollowing = query.socialConnections?.pageInfo.total ?? 0;

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.socialConnections?.edges ?? []) {
      if (edge?.node?.__typename === 'SocialConnection' && edge?.node?.galleryUser) {
        users.push(edge.node.galleryUser);
      }
    }

    return users;
  }, [query.socialConnections?.edges]);

  const handleLoadMore = useCallback(() => {
    if (hasNext) {
      loadNext(USERS_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  const navigation = useNavigation<LoggedInStackNavigatorProp>();
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'TwitterSuggestionList'>>();
  const handleUserPress = useCallback(
    (username: string) => {
      navigation.goBack();
      route.params.onUserPress(username);
    },
    [navigation, route.params]
  );

  return (
    <View className="flex flex-1 flex-col">
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Bold',
        }}
        className="text-lg"
      >
        We've found {totalFollowing} {totalFollowing === 1 ? 'person' : 'people'} you know from
        Twitter
      </Typography>
      <View className="-mx-4 flex-grow">
        <UserFollowList
          onUserPress={handleUserPress}
          onLoadMore={handleLoadMore}
          userRefs={nonNullUsers}
          queryRef={query}
        />
      </View>
    </View>
  );
}

export function TwitterSuggestionListScreen() {
  const query = useLazyLoadQuery<TwitterSuggestionListScreenQuery>(
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

  return (
    <ModalContainer withBackButton>
      <Suspense fallback={<LoadingFollowerList />}>
        <InnerSuggestionListScreen queryRef={query} />
      </Suspense>
    </ModalContainer>
  );
}
