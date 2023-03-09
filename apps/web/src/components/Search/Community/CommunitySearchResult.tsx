import Link, { LinkProps } from 'next/link';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { BaseM } from '~/components/core/Text/Text';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';

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
    <StyledResult href={route} onClick={hideDrawer}>
      <StyledResultTitle>{community.name}</StyledResultTitle>
      <BaseM>{community.description}</BaseM>
    </StyledResult>
  );
}

const StyledResult = styled(Link)<LinkProps>`
  color: ${colors.offBlack};
  padding: 16px 12px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: ${colors.faint};
    border-radius: 4px;
  }
`;
const StyledResultTitle = styled(BaseM)`
  font-weight: 700;
`;
