import styled, { css } from 'styled-components';
import { TitleXSBold } from 'components/core/Text/Text';
import IconContainer from 'components/core/Markdown/IconContainer';
import { RefreshIcon } from 'icons/RefreshIcon';
import { useCallback, useState } from 'react';
import Tooltip from 'components/Tooltip/Tooltip';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql, useFragment } from 'react-relay';
import { SidebarChainSelectorMutation } from '../../../../../../__generated__/SidebarChainSelectorMutation.graphql';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { Severity } from '@sentry/types';
import isViewerId3ac from 'hooks/oneOffs/useIs3ac';
import { SidebarChainSelectorFragment$key } from '../../../../../../__generated__/SidebarChainSelectorFragment.graphql';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';

const chains = [
  { name: 'Ethereum', shortName: 'ETH', icon: '/icons/ethereum_logo.svg' },
  { name: 'POAP', shortName: 'POAP', icon: '/icons/poap_logo.svg' },

  // TODO: Enable this once we launch Tezos
  // { name: 'Tezos', shortName: 'TEZ', icon: '/icons/tezos_logo.svg' },
] as const;

export type Chain = typeof chains[number]['name'];

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
  viewerRef: SidebarChainSelectorFragment$key;
};

export function SidebarChainSelector({ selected, onChange, viewerRef }: SidebarChainsProps) {
  const viewer = useFragment(
    graphql`
      fragment SidebarChainSelectorFragment on Viewer {
        user {
          dbid
        }
      }
    `,
    viewerRef
  );

  const { isRefreshingNfts, setIsRefreshingNfts } = useWizardState();

  /**
   * We're explicitly avoiding using the `isMutating` flag from the hook itself
   * since that state is meant to be managed in the WizardState.
   *
   * This is because this refresh can happen in multiple places and we want
   * to lock this refresh no matter where it originated from
   */
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

  const is3ac = isViewerId3ac(viewer.user?.dbid);
  const selectedChain = chains.find((chain) => chain.name === selected);

  const handleRefresh = useCallback(async () => {
    if (!selectedChain) {
      return;
    }

    setIsRefreshingNfts(true);

    pushToast({
      message: 'We’re retrieving your new pieces. This may take up to a few minutes.',
      autoClose: true,
    });

    try {
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
    } catch (e) {
      if (e instanceof Error) {
        reportError(e);
      } else {
        reportError('Could not run SidebarChainSelectorMutation for an unknown reason');
      }
    } finally {
      setIsRefreshingNfts(false);
    }
  }, [pushToast, refresh, reportError, selectedChain, setIsRefreshingNfts]);

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
      {!is3ac && (
        <IconButton
          refreshing={isRefreshingNfts}
          data-testid="RefreshButton"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={handleRefresh}
        >
          <StyledIconContainer icon={<RefreshIcon />} />
          <RefreshTooltip
            active={showTooltip}
            text={isRefreshingNfts ? `Refreshing...` : `Refresh ${selectedChain.shortName} Wallets`}
          />
        </IconButton>
      )}
    </Container>
  );
}

const StyledIconContainer = styled(IconContainer)``;

const IconButton = styled.button<{ refreshing: boolean }>`
  position: relative;

  // Button Reset
  border: none;
  margin: 0;
  padding: 0;
  background: none;

  cursor: pointer;

  ${({ refreshing }) =>
    refreshing
      ? css`
          cursor: unset;

          ${StyledIconContainer} {
            pointer-events: none;
            opacity: 0.2;
          }
        `
      : ''};
`;

const RefreshTooltip = styled(Tooltip)<{ active: boolean }>`
  bottom: 0;
  z-index: 1;
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
