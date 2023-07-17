import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { LowercaseChain } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';

import SearchResult from '../SearchResult';

type Props = {
  communityRef: CommunitySearchResultFragment$key;
};

export default function CommunitySearchResult({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunitySearchResultFragment on Community {
        name
        description
        contractAddress @required(action: THROW) {
          address
          chain
        }
      }
    `,
    communityRef
  );

  const route = useMemo<Route>(() => {
    const { address, chain: uppercaseChain } = community.contractAddress;

    const chain = uppercaseChain?.toLocaleLowerCase() as LowercaseChain;
    const contractAddress = address as string;

    return {
      pathname: `/community/[chain]/[contractAddress]`,
      query: { contractAddress, chain },
    };
  }, [community]);

  return (
    <SearchResult
      name={community.name ?? ''}
      description={community.description ?? ''}
      path={route}
      type="community"
    />
  );
}
