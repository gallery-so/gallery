import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import CommunityProfilePicture from '~/components/ProfilePicture/CommunityProfilePicture';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { MentionType } from '~/shared/hooks/useMentionableMessage';
import { LowercaseChain } from '~/shared/utils/chains';

import SearchResult from '../SearchResult';
import { SearchResultVariant } from '../SearchResults';

type Props = {
  keyword: string;
  communityRef: CommunitySearchResultFragment$key;
  variant: SearchResultVariant;

  onSelect?: (item: MentionType) => void;
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

  const router = useRouter();

  const route = useMemo<Route>(() => {
    const { address, chain: uppercaseChain } = community.contractAddress;

    const chain = uppercaseChain?.toLocaleLowerCase() as LowercaseChain;
    const contractAddress = address as string;

    return {
      pathname: `/community/[chain]/[contractAddress]`,
      query: { contractAddress, chain },
    };
  }, [community]);

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect({
        type: 'Community',
        label: community.name ?? '',
        value: community.dbid,
      });
      return;
    }

    router.push(route);
  }, [onSelect, route, router, community.dbid, community.name]);

  return (
    <SearchResult
      name={community.name ?? ''}
      description={community.description ?? ''}
      path={route}
      type="community"
      profilePicture={<CommunityProfilePicture communityRef={community} size="md" />}
      variant={variant}
      onClick={handleClick}
      keyword={keyword}
    />
  );
}
