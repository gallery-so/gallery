import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { SearchDefaultSuggestedUsersSectionFragment$key } from '~/generated/SearchDefaultSuggestedUsersSectionFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { fadeIn } from '../core/keyframes';
import { HStack, VStack } from '../core/Spacer/Stack';
import SuggestedProfileCard from '../Feed/SuggestedProfileCard';
import SearchResultsHeader from './SearchResultsHeader';
import { SearchItemType } from './types';

type Props = {
  queryRef: SearchDefaultSuggestedUsersSectionFragment$key;
  variant?: 'default' | 'compact';
  onSelect: (item: SearchItemType) => void;
};

export default function SearchDefaultSuggestedUsersSection({ queryRef, variant, onSelect }: Props) {
  const query = useFragment(
    graphql`
      fragment SearchDefaultSuggestedUsersSectionFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 4) @required(action: THROW) {
              __typename
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    username
                    dbid
                    __typename
                    galleries {
                      tokenPreviews {
                        __typename
                      }
                    }
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
    return (query.viewer.suggestedUsers?.edges ?? [])
      .flatMap((edge) => (edge?.node ? [edge.node] : []))
      .filter((user) =>
        user?.galleries?.some((gallery) => removeNullValues(gallery?.tokenPreviews).length > 0)
      )
      ?.slice(0, 2);
  }, [query.viewer.suggestedUsers?.edges]);

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

const StyledWrapper = styled(VStack)`
  animation: ${fadeIn} 0.2s ease-out forwards;
`;
