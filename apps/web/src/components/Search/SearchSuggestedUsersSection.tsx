import { graphql, useFragment } from 'react-relay';

import { SearchSuggestedUsersSectionFragment$key } from '~/generated/SearchSuggestedUsersSectionFragment.graphql';
import { SearchSuggestedUsersSectionFollowFragment$key } from '~/generated/SearchSuggestedUsersSectionFollowFragment.graphql';
import { HStack } from '../core/Spacer/Stack';
import SearchResultsHeader from './SearchResultsHeader';
import SuggestedProfileCard from '../Feed/SuggestedProfileCard';

type Props = {
  queryRef: SearchSuggestedUsersSectionFragment$key;
  userRef: SearchSuggestedUsersSectionFollowFragment$key;
  profiles: any[];
  variant?: 'default' | 'compact';
};

export default function SearchSuggestedUsersSection({
  queryRef,
  userRef,
  profiles,
  variant,
}: Props) {
  const query = useFragment(
    graphql`
      fragment SearchSuggestedUsersSectionFollowFragment on Query {
        ...SuggestedProfileCardFollowFragment
      }
    `,
    queryRef
  );

  if (!profiles) {
    return;
  }

  return (
    <>
      <SearchResultsHeader variant={variant}>Suggested Collectors and Creators</SearchResultsHeader>
      <HStack justify="space-between" style={{ paddingBottom: '12px' }}>
        {profiles?.map((profile) => (
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
