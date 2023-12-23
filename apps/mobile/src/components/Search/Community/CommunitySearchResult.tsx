import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';

import { CommunityProfilePicture } from '~/components/ProfilePicture/CommunityProfilePicture';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { MentionType } from '~/shared/hooks/useMentionableMessage';

import { SearchResult } from '../SearchResult';

type Props = {
  communityRef: CommunitySearchResultFragment$key;
  keyword: string;
  onSelect?: (item: MentionType) => void;
  isMentionSearch?: boolean;
};
export function CommunitySearchResult({ communityRef, keyword, onSelect, isMentionSearch }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunitySearchResultFragment on Community {
        dbid
        name
        description
        ...CommunityProfilePictureFragment
        ...useNavigateToCommunityScreenFragment
      }
    `,
    communityRef
  );

  const navigateToCommunity = useNavigateToCommunityScreen();

  const handlePress = useCallback(() => {
    if (onSelect) {
      onSelect({
        type: 'Community',
        label: community.name ?? '',
        value: community.dbid,
      });
      return;
    }

    navigateToCommunity(community);
  }, [community, navigateToCommunity, onSelect]);

  return (
    <SearchResult
      profilePicture={<CommunityProfilePicture communityRef={community} size="md" />}
      onPress={handlePress}
      title={community?.name ?? ''}
      description={community?.description ?? ''}
      variant="Gallery"
      keyword={keyword}
      isMentionSearch={isMentionSearch}
    />
  );
}
