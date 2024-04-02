import { graphql, useFragment } from 'react-relay';
import { useMemo } from 'react';

import { SearchSuggestedUsersSectionFragment$key } from '~/generated/SearchSuggestedUsersSectionFragment.graphql';
import { HStack } from '../core/Spacer/Stack';
import SearchResultsHeader from './SearchResultsHeader';
import SuggestedProfileCard from '../Feed/SuggestedProfileCard';

type Props = {
  queryRef: SearchSuggestedUsersSectionFragment$key;
  variant?: 'default' | 'compact';
};

export default function SearchSuggestedUsersSection({ queryRef, variant }: Props) {
  const query = useFragment(
    graphql`
      fragment SearchSuggestedUsersSectionFragment on Query {
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

        ...SuggestedProfileCardFollowFragment
      }
    `,
    queryRef
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
  if (!nonNullProfiles) {
    return null;
  }

  return (
    <>
      <SearchResultsHeader variant={variant}>Suggested Collectors and Creators</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {nonNullProfiles?.map((profile) => (
          <SuggestedProfileCard
            key={profile.id}
            userRef={profile}
            queryRef={query}
            showFollowButton={false}
          />
        ))}
      </HStack>
    </>
  );
}
