import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { SearchDefaultQuery } from '~/generated/SearchDefaultQuery.graphql';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { HStack, VStack } from '../core/Spacer/Stack';
import SuggestedProfileCard from '../Feed/SuggestedProfileCard';
import SearchFeaturedProfile from './SearchFeaturedProfile';
import SearchResultsHeader from './SearchResultsHeader';
import { SearchItemType } from './types';
import UserSearchResult from './User/UserSearchResult';

type Props = {
  variant?: 'default' | 'compact';

  pageContent: CmsTypes.LandingPage;
  onSelect: (item: SearchItemType) => void;
};

export default function SearchDefault({ variant = 'default', onSelect, pageContent }: Props) {
  const query = useLazyLoadQuery<SearchDefaultQuery>(
    graphql`
      query SearchDefaultQuery {
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            users {
              id
              ...UserSearchResultFragment
            }
          }
        }
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 2) @required(action: THROW) {
              __typename
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    id
                    __typename
                    ...SuggestedProfileCardFragment
                  }
                }
              }
            }
          }
        }
        ...SuggestedProfileCardFollowFragment
      }
    `,
    {}
  );

  // map edge nodes to an array of GalleryUsers
  const nonNullProfiles = useMemo(() => {
    const users = [];

    for (const edge of query.viewer?.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer?.suggestedUsers?.edges]);

  if (
    query.trendingUsers5Days?.__typename !== 'TrendingUsersPayload' ||
    !query.trendingUsers5Days.users
  ) {
    return null;
  }

  if (query.viewer?.suggestedUsers?.__typename !== 'UsersConnection') {
    return null;
  }

  const { featuredProfiles } = pageContent ?? [];

  const { users: trendingUsers } = query.trendingUsers5Days;

  const featuredProfilesData = featuredProfiles.slice(0, 2);

  return (
    <VStack>
      <SearchResultsHeader variant={variant}>Featured Collections</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {featuredProfilesData?.map((profile) => (
          <SearchFeaturedProfile key={profile.id} profile={profile} />
        ))}
      </HStack>
      <SearchResultsHeader variant={variant}>Suggested Collectors and Creators</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {nonNullProfiles?.map((user) => (
          <SuggestedProfileCard
            key={user.id}
            userRef={user}
            queryRef={query}
            showFollowButton={false}
          />
        ))}
      </HStack>
      <SearchResultsHeader variant={variant}>Trending Curators</SearchResultsHeader>
      {trendingUsers.map((user) => (
        <UserSearchResult
          key={user.id}
          userRef={user}
          variant={variant}
          onSelect={onSelect}
          keyword=""
        />
      ))}
    </VStack>
  );
}
