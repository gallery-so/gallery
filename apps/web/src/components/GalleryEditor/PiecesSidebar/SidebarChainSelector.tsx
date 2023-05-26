import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { Chain, chains } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { SidebarChainButton } from '~/components/GalleryEditor/PiecesSidebar/SidebarChainButton';

import Blinking from '../GalleryOnboardingGuide/Blinking';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';
import { SidebarView } from './SidebarViewSelector';

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
  selectedView: SidebarView;
};

export function SidebarChainSelector({ selected, onChange, selectedView }: SidebarChainsProps) {
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

  const availableChains = useMemo(() => {
    if (selectedView === 'Created') {
      return chains.filter((chain) => chain.name === 'Ethereum');
    }
    return chains;
  }, [selectedView]);

  return (
    <Container>
      <StyledSidebarChainButtonContainer>
        {availableChains.map((chain) => {
          const isSelected = chain.name === selected;

          return (
            <SidebarChainButton
              key={chain.name}
              isSelected={isSelected}
              onClick={() => handleChainClick(chain.name)}
              chain={chain}
            />
          );
        })}
        {step === 3 && (
          <StyledBlinkingContainer>
            <Blinking />
          </StyledBlinkingContainer>
        )}
      </StyledSidebarChainButtonContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 4px 12px;
`;

const StyledSidebarChainButtonContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  gap: 4px;
`;

const StyledBlinkingContainer = styled.div`
  position: absolute;
  right: 0;
  top: 10px;
`;
