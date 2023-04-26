import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Suspense, useCallback, useMemo } from 'react';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { XMarkIcon } from '~/components/Search/XMarkIcon';
import { USERS_PER_PAGE } from '~/components/Trending/constants';
import { LoadingFollowerList } from '~/components/Trending/LoadingFollowerList';
import { SuggestionUser } from '~/components/Trending/SuggestionUser';
import { Typography } from '~/components/Typography';
import { SuggestionUserFragment$key } from '~/generated/SuggestionUserFragment.graphql';
import { TwitterSuggestionListScreenQuery } from '~/generated/TwitterSuggestionListScreenQuery.graphql';
import { TwitterSuggestionListScreenQueryFragment$key } from '~/generated/TwitterSuggestionListScreenQueryFragment.graphql';
import { TwitterSuggestionListScreenRefetchableQuery } from '~/generated/TwitterSuggestionListScreenRefetchableQuery.graphql';

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

  const renderItem = useCallback<ListRenderItem<SuggestionUserFragment$key>>(
    ({ item, index }) => {
      return <SuggestionUser key={index} userRef={item} queryRef={query} />;
    },
    [query]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNext) {
      loadNext(USERS_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  return (
    <>
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
          We've found {totalFollowing} {totalFollowing ? 'person' : 'people'} you know from Twitter
        </Typography>
      </View>
      <SafeAreaView className="flex-1">
        <FlashList
          data={nonNullUsers}
          renderItem={renderItem}
          keyExtractor={(_, index) => String(index)}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.8}
          estimatedItemSize={100}
        />
      </SafeAreaView>
    </>
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
    <Suspense fallback={<LoadingFollowerList />}>
      <InnerSuggestionListScreen queryRef={query} />
    </Suspense>
  );
}
