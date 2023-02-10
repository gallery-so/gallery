import { LayoutGroup } from 'framer-motion';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { Chain, chains } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { SidebarChainButton } from '~/components/GalleryEditor/PiecesSidebar/SidebarChainButton';
import { SidebarChainSelectorFragment$key } from '~/generated/SidebarChainSelectorFragment.graphql';

import Blinking from '../GalleryOnboardingGuide/Blinking';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
  queryRef: SidebarChainSelectorFragment$key;
};

export function SidebarChainSelector({ selected, onChange, queryRef }: SidebarChainsProps) {
  const query = useFragment(
    graphql`
      fragment SidebarChainSelectorFragment on Query {
        ...SidebarChainButtonFragment
      }
    `,
    queryRef
  );

  const { step } = useOnboardingDialogContext();

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
      <StyledSidebarChainButtonContainer gap={4}>
        <LayoutGroup>
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
          {step === 3 && (
            <StyledBlinkingContainer>
              <Blinking />
            </StyledBlinkingContainer>
          )}
        </LayoutGroup>
      </StyledSidebarChainButtonContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 8px 12px;
`;
const StyledSidebarChainButtonContainer = styled(HStack)`
  position: relative;
`;
const StyledBlinkingContainer = styled.div`
  position: absolute;
  right: 0;
  top: 10px;
`;
