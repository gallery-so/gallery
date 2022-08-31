import styled from 'styled-components';
import { TitleXSBold } from 'components/core/Text/Text';
import IconContainer from 'components/core/Markdown/IconContainer';
import { RefreshIcon } from 'icons/RefreshIcon';

const chains = [
  { name: 'Ethereum', shortName: 'ETH', icon: '/icons/ethereum_logo.svg' },
  { name: 'Tezos', shortName: 'TEZ', icon: '/icons/tezos_logo.svg' },
  { name: 'POAP', shortName: 'POAP', icon: '/icons/poap_logo.svg' },
] as const;

export type Chain = typeof chains[number]['name'];

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
};

export function SidebarChains({ selected, onChange }: SidebarChainsProps) {
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
      <IconContainer icon={<RefreshIcon />} />
    </Container>
  );
}

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
