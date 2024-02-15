import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import CommunityProfilePicture from '~/components/ProfilePicture/CommunityProfilePicture';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { getCommunityUrlFromCommunity } from '~/utils/getCommunityUrl';

import SearchResult from '../SearchResult';
import { SearchItemType, SearchResultVariant } from '../types';

type Props = {
  keyword: string;
  communityRef: CommunitySearchResultFragment$key;
  variant: SearchResultVariant;
  onSelect: (item: SearchItemType) => void;
};

export default function CommunitySearchResult({ communityRef, keyword, variant, onSelect }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunitySearchResultFragment on Community {
        dbid
        name
        description
        ...CommunityProfilePictureFragment
        ...getCommunityUrlFromCommunityFragment
      }
    `,
    communityRef
  );

  const communityPageUrl = getCommunityUrlFromCommunity(community);

  const route = useMemo(() => {
    return {
      type: 'Community' as const,
      label: community.name ?? '',
      value: community.dbid,
      communityPageUrl,
    };
  }, [community.name, community.dbid, communityPageUrl]);

  const handleClick = useCallback(() => {
    onSelect(route);
    return;
  }, [onSelect, route]);

  return (
    <SearchResult
      name={community.name ?? ''}
      description={community.description ?? ''}
      profilePicture={<CommunityProfilePicture communityRef={community} size="md" />}
      variant={variant}
      onClick={handleClick}
      keyword={keyword}
      route={JSON.stringify(route)}
    />
  );
}
