import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { Chain, chains } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { SidebarChainButton } from '~/components/GalleryEditor/PiecesSidebar/SidebarChainButton';
import { SidebarChainSelectorNewFragment$key } from '~/generated/SidebarChainSelectorNewFragment.graphql';

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
  queryRef: SidebarChainSelectorNewFragment$key;
};

export function SidebarChainSelector({ selected, onChange, queryRef }: SidebarChainsProps) {
  const query = useFragment(
    graphql`
      fragment SidebarChainSelectorNewFragment on Query {
        ...SidebarChainButtonFragment
      }
    `,
    queryRef
  );

  const selectedChain = chains.find((chain) => chain.name === selected);

  const handleChainClick = useCallback(
    (chain: Chain) => {
      onChange(chain);
    },
    [onChange]
  );

  if (!selectedChain) {
    throw new Error(`Could not find a chain for selected value '${selected}'`);
  }

  return (
    <Container>
      <HStack gap={4}>
        {chains.map((chain) => {
          const isSelected = chain.name === selected;

          return (
            <SidebarChainButton
              key={chain.name}
              isSelected={isSelected}
              onClick={() => handleChainClick(chain.name)}
              queryRef={query}
              chain={chain}
            />
          );
        })}
      </HStack>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 8px 12px;
`;
