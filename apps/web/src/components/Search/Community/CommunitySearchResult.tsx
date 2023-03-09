import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { BaseM } from '~/components/core/Text/Text';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';

import { StyledSearchResult, StyledSearchResultTitle } from '../SearchStyles';

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

  const { hideDrawer } = useDrawerActions();

  const route = useMemo(() => {
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
    <StyledSearchResult href={route} onClick={hideDrawer}>
      <StyledSearchResultTitle>{community.name}</StyledSearchResultTitle>
      <BaseM>{community.description}</BaseM>
    </StyledSearchResult>
  );
}
