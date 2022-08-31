import styled from 'styled-components';
import { TitleXSBold } from 'components/core/Text/Text';
import IconContainer from 'components/core/Markdown/IconContainer';
import { RefreshIcon } from 'icons/RefreshIcon';
import { useCallback, useState } from 'react';
import Tooltip from 'components/Tooltip/Tooltip';

const chains = [
  { name: 'Ethereum', shortName: 'ETH', icon: '/icons/ethereum_logo.svg' },
  // { name: 'Tezos', shortName: 'TEZ', icon: '/icons/tezos_logo.svg' },
  { name: 'POAP', shortName: 'POAP', icon: '/icons/poap_logo.svg' },
] as const;

export type Chain = typeof chains[number]['name'];

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
};

export function SidebarChains({ selected, onChange }: SidebarChainsProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRefresh = useCallback(() => {}, []);

  const selectedChain = chains.find((chain) => chain.name === selected);

  if (!selectedChain) {
    throw new Error('Yikes bud');
  }

  return (
    <Container>
      <Chains>
        {chains.map((chain) => {
          const isSelected = chain.name === selected;

          return (
            <ChainButton
              selected={isSelected}
              role="button"
              key={chain.name}
              onClick={() => onChange(chain.name)}
            >
              <ChainLogo src={chain.icon} />
              <TitleXSBold>{chain.shortName}</TitleXSBold>
            </ChainButton>
          );
        })}
      </Chains>
      <IconButton
        data-testid="RefreshButton"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        refreshing={refreshing}
        onClick={handleRefresh}
      >
        <IconContainer icon={<RefreshIcon />} />
        <RefreshTooltip active={showTooltip} text={`Refresh ${selectedChain.shortName} Wallets`} />
      </IconButton>
    </Container>
  );
}

const IconButton = styled.button<{ refreshing: boolean }>`
  position: relative;

  // Button Reset
  border: none;
  margin: 0;
  padding: 0;
  background: none;

  cursor: pointer;
`;

const RefreshTooltip = styled(Tooltip)<{ active: boolean }>`
  bottom: 0;
  opacity: ${({ active }) => (active ? 1 : 0)};
  transform: translateY(calc(100% + ${({ active }) => (active ? 4 : 0)}px));
`;

const Chains = styled.div`
  display: flex;
`;

const ChainLogo = styled.img`
  width: 16px;
  height: 16px;

  margin-right: 4px;
`;

const ChainButton = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-right: 16px;
  }

  cursor: pointer;
  opacity: ${({ selected }) => (selected ? '1' : '.5')};
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 16px 0;
`;
