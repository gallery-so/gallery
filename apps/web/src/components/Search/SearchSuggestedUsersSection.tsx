import { graphql, useFragment } from 'react-relay';
import { useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

import { SearchSuggestedUsersSectionFragment$key } from '~/generated/SearchSuggestedUsersSectionFragment.graphql';
import { VStack, HStack } from '../core/Spacer/Stack';
import SearchResultsHeader from './SearchResultsHeader';
import SuggestedProfileCard from '../Feed/SuggestedProfileCard';
import { SearchItemType } from './types';

type Props = {
  queryRef: SearchSuggestedUsersSectionFragment$key;
  variant?: 'default' | 'compact';
  onSelect: (item: SearchItemType) => void;
};

export default function SearchSuggestedUsersSection({ queryRef, variant, onSelect }: Props) {
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
                    username
                    dbid
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
    <StyledWrapper gap={8}>
      <SearchResultsHeader variant={variant}>Suggested Collectors and Creators</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {nonNullProfiles?.map((profile) => (
          <SuggestedProfileCard
            key={profile.dbid}
            userRef={profile}
            queryRef={query}
            onClick={() =>
              onSelect({
                type: 'User' as const,
                label: profile.username ?? '',
                value: profile.dbid,
              })
            }
            showFollowButton={false}
          />
        ))}
      </HStack>
    </StyledWrapper>
  );
}

const fadeIn = keyframes`
    from { opacity: 0 };
    to { opacity: 0.96 };
`;

const StyledWrapper = styled(VStack)`
  animation: ${fadeIn} 0.2s ease-out forwards;
  padding-bottom: 12px;
`;
