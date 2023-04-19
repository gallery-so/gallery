import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { XMarkIcon } from '~/components/Search/XMarkIcon';
import { SuggestionUser } from '~/components/Trending/SuggestionUser';
import { Typography } from '~/components/Typography';
import { TwitterSuggestionListScreenQuery } from '~/generated/TwitterSuggestionListScreenQuery.graphql';

export function TwitterSuggestionListScreen() {
  const query = useLazyLoadQuery<TwitterSuggestionListScreenQuery>(
    graphql`
      query TwitterSuggestionListScreenQuery($twitterListFirst: Int!, $twitterListAfter: String) {
        socialConnections(
          after: $twitterListAfter
          first: $twitterListFirst
          socialAccountType: Twitter
          excludeAlreadyFollowing: false
        ) {
          edges {
            node {
              __typename
              ... on SocialConnection {
                __typename
                galleryUser {
                  ... on GalleryUser {
                    __typename
                    ...TrendingUserListFragment
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
    {
      twitterListFirst: 24,
      twitterListAfter: null,
    }
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
    <View>
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
      <ScrollView>
        {nonNullUsers.map((user, index) => (
          <SuggestionUser key={index} userRef={user} queryRef={query} />
        ))}
      </ScrollView>
    </View>
  );
}
