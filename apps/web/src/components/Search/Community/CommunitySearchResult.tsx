import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { CommunitySearchResultQueryFragment$key } from '~/generated/CommunitySearchResultQueryFragment.graphql';

import SearchResult from '../SearchResult';

type Props = {
  communityRef: CommunitySearchResultFragment$key;
  queryRef: CommunitySearchResultQueryFragment$key;
};

export default function CommunitySearchResult({ communityRef, queryRef }: Props) {
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

  const query = useFragment(
    graphql`
      fragment CommunitySearchResultQueryFragment on Query {
        ...SearchResultQueryFragment
      }
    `,
    queryRef
  );

  const route = useMemo<Route>(() => {
    const { address, chain } = community.contractAddress;
    const contractAddress = address as string;

    if (chain === 'POAP') {
      return { pathname: '/community/poap/[contractAddress]', query: { contractAddress } };
    } else if (chain === 'Tezos') {
      return { pathname: '/community/tez/[contractAddress]', query: { contractAddress } };
    } else {
      return { pathname: '/community/[contractAddress]', query: { contractAddress } };
    }
  }, [community]);

  return (
    <SearchResult
      name={community.name ?? ''}
      description={community.description ?? ''}
      path={route}
      type="community"
      queryRef={query}
    />
  );
}
