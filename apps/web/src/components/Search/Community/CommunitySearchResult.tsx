import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import CommunityProfilePicture from '~/components/ProfilePicture/CommunityProfilePicture';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';

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
        contractAddress @required(action: THROW) {
          address
          chain
        }
        ...CommunityProfilePictureFragment
      }
    `,
    communityRef
  );

  const handleClick = useCallback(() => {
    onSelect({
      type: 'Community',
      label: community.name ?? '',
      value: community.dbid,
      contractAddress: community.contractAddress.address ?? '',
      chain: community.contractAddress.chain ?? '',
    });
    return;
  }, [
    onSelect,
    community.dbid,
    community.name,
    community.contractAddress.address,
    community.contractAddress.chain,
  ]);

  return (
    <SearchResult
      name={community.name ?? ''}
      description={community.description ?? ''}
      profilePicture={<CommunityProfilePicture communityRef={community} size="md" />}
      variant={variant}
      onClick={handleClick}
      keyword={keyword}
    />
  );
}
