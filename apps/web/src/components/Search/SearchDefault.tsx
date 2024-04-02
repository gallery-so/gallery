import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { SearchDefaultQuery } from '~/generated/SearchDefaultQuery.graphql';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { HStack, VStack } from '../core/Spacer/Stack';
import SearchFeaturedCollectionSection from './SearchFeaturedCollectionSection';
import SearchSuggestedUsersSection from './SearchSuggestedUsersSection';
import SearchResultsHeader from './SearchResultsHeader';
import { SearchItemType } from './types';
import UserSearchResult from './User/UserSearchResult';
import SearchDefaultTrendingCuratorsSection from './SearchDefaultTrendingCurators';

type Props = {
  variant?: 'default' | 'compact';

  pageContent: CmsTypes.LandingPage;
  onSelect: (item: SearchItemType) => void;
};

export default function SearchDefault({ variant = 'default', onSelect, pageContent }: Props) {
  const query = useLazyLoadQuery<SearchDefaultQuery>(
    graphql`
      query SearchDefaultQuery {
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
                  }
                  ...SuggestedProfileCardFragment
                }
              }
            }
          }
        }
        ...SearchSuggestedUsersSectionFollowFragment
        ...SearchDefaultTrendingCuratorsSectionFragment
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

  if (query.viewer?.suggestedUsers?.__typename !== 'UsersConnection') {
    return null;
  }

  const { featuredProfiles } = pageContent ?? [];

  const featuredProfilesData = featuredProfiles?.slice(0, 2);

  return (
    <VStack>
      <SearchFeaturedCollectionSection profiles={featuredProfilesData} variant={variant} />
      <SearchSuggestedUsersSection profiles={nonNullProfiles} variant={variant} />
      <SearchDefaultTrendingCuratorsSection
        queryRef={query}
        variant={variant}
        onSelect={onSelect}
      />
    </VStack>
  );
}
