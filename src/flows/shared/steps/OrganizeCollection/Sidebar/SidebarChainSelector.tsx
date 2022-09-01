import styled from 'styled-components';
import { TitleXSBold } from 'components/core/Text/Text';
import IconContainer from 'components/core/Markdown/IconContainer';
import { RefreshIcon } from 'icons/RefreshIcon';
import { useCallback, useState } from 'react';
import Tooltip from 'components/Tooltip/Tooltip';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql } from 'react-relay';
import { SidebarChainSelectorMutation } from '../../../../../../__generated__/SidebarChainSelectorMutation.graphql';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { Severity } from '@sentry/types';

const chains = [
  { name: 'Ethereum', shortName: 'ETH', icon: '/icons/ethereum_logo.svg' },
  // TODO: Enable this once we launch Tezos
  // { name: 'Tezos', shortName: 'TEZ', icon: '/icons/tezos_logo.svg' },
  { name: 'POAP', shortName: 'POAP', icon: '/icons/poap_logo.svg' },
] as const;

export type Chain = typeof chains[number]['name'];

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
};

export function SidebarChains({ selected, onChange }: SidebarChainsProps) {
  const [refresh] = usePromisifiedMutation<SidebarChainSelectorMutation>(graphql`
    mutation SidebarChainSelectorMutation($chain: Chain!) {
      syncTokens(chains: [$chain]) {
        __typename
        ... on SyncTokensPayload {
          viewer {
            ...CollectionEditorFragment
          }
        }
      }
    }
  `);

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const [showTooltip, setShowTooltip] = useState(false);

  const selectedChain = chains.find((chain) => chain.name === selected);

  const handleRefresh = useCallback(async () => {
    if (!selectedChain) {
      return;
    }

    pushToast({
      message: 'We’re retrieving your new pieces. This may take up to a few minutes.',
      autoClose: true,
    });
    const response = await refresh({
      variables: {
        chain: selectedChain.name,
      },
    });

    if (response.syncTokens?.__typename !== 'SyncTokensPayload') {
      pushToast({
        autoClose: false,
        message:
          'There was an error while trying to sync your tokens. We have been notified and are looking into it.',
      });

      reportError('Error while syncing tokens for chain. Typename was not `SyncTokensPayload`', {
        level: Severity.Error,
        tags: {
          chain: selectedChain.name,
          responseTypename: response.syncTokens?.__typename,
        },
      });
    }
  }, [pushToast, refresh, reportError, selectedChain]);

  if (!selectedChain) {
    throw new Error(`Could not find a chain for selected value '${selected}'`);
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
        onClick={handleRefresh}
      >
        <IconContainer icon={<RefreshIcon />} />
        <RefreshTooltip active={showTooltip} text={`Refresh ${selectedChain.shortName} Wallets`} />
      </IconButton>
    </Container>
  );
}

const IconButton = styled.button`
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
