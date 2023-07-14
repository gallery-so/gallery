import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { Chain } from '~/generated/enums';

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

    /* The returned chain is usually uppercase, so we have to make sure we always convert
     them to lowercase, otherwise user's will see the inconsistent routes.

     TODO: we could probablly think of a better way to handle this, so we don't have to do this manually everytime.
    */
    const chain = uppercaseChain?.toLocaleLowerCase() as Chain;
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
