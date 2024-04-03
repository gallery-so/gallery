import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { SearchSuggestedUsersSectionFragment$key } from '~/generated/SearchSuggestedUsersSectionFragment.graphql';

import { HStack, VStack } from '../core/Spacer/Stack';
import SuggestedProfileCard from '../Feed/SuggestedProfileCard';
import SearchResultsHeader from './SearchResultsHeader';
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

  const nonNullProfiles = useMemo(() => {
    const users = [];

    for (const edge of query.viewer?.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer?.suggestedUsers?.edges]);

  if (query.viewer?.suggestedUsers?.__typename !== 'UsersConnection' || !nonNullProfiles) {
    return null;
  }

  return (
    <StyledWrapper gap={8}>
      <HeaderWrapper>
        <SearchResultsHeader variant={variant}>
          Suggested Collectors and Creators
        </SearchResultsHeader>
      </HeaderWrapper>
      <HStack gap={4}>
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

const HeaderWrapper = styled(HStack)`
  padding: 0px 12px;

  @media only screen and ${breakpoints.desktop} {
    padding-right: 12px;
    padding-left: 8px;
  }
`;

const fadeIn = keyframes`
    from { opacity: 0 };
    to { opacity: 0.96 };
`;

const StyledWrapper = styled(VStack)`
  animation: ${fadeIn} 0.2s ease-out forwards;
`;
