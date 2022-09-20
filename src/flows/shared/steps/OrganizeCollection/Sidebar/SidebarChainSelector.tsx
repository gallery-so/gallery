import styled, { css } from 'styled-components';
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
import { SidebarChainSelectorFragment$key } from '../../../../../../__generated__/SidebarChainSelectorFragment.graphql';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import { SidebarChainButton } from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarChainButton';
import { Chain, chains } from 'flows/shared/steps/OrganizeCollection/Sidebar/chains';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { FeatureFlag } from 'components/core/enums';
import usePersistedState from 'hooks/usePersistedState';
import { TEZOS_EARLY_ACCESS_LOCAL_STORAGE_KEY } from 'utils/tezosEarlyAccess';
import noop from 'utils/noop';
import isRefreshDisabledForUser from './isRefreshDisabledForUser';

type SidebarChainsProps = {
  selected: Chain;
  onChange: (chain: Chain) => void;
  queryRef: SidebarChainSelectorFragment$key;
};

export function SidebarChainSelector({ selected, onChange, queryRef }: SidebarChainsProps) {
  const query = useFragment(
    graphql`
      fragment SidebarChainSelectorFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }

        ...isFeatureEnabledFragment
      }
    `,
    queryRef
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
            ...CollectionEditorViewerFragment
          }
        }
      }
    }
  `);

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const [showTooltip, setShowTooltip] = useState(false);

  const selectedChain = chains.find((chain) => chain.name === selected);

  const isPOAPEnabled = isFeatureEnabled(FeatureFlag.POAP, query);
  const [tezosEnabled] = usePersistedState<boolean>(TEZOS_EARLY_ACCESS_LOCAL_STORAGE_KEY, false);

  const handleChainClick = useCallback(
    (chain: Chain) => {
      onChange(chain);
    },
    [onChange]
  );
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

          let locked = true;
          if (chain.name === 'Ethereum') {
            locked = false;
          } else if (chain.name === 'POAP') {
            locked = !isPOAPEnabled;
          } else if (chain.name === 'Tezos') {
            locked = !tezosEnabled;
          }

          return (
            <SidebarChainButton
              key={chain.name}
              locked={locked}
              icon={chain.icon}
              title={chain.shortName}
              isSelected={isSelected}
              onClick={locked ? noop : () => handleChainClick(chain.name)}
            />
          );
        })}
      </Chains>
      {isRefreshDisabledForUser(query.viewer?.user?.dbid ?? '') ? null : (
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

  // Ensure we don't include the Tooltip in the outline
  :focus-within {
    outline: none;

    ${StyledIconContainer} {
      outline: auto;
    }
  }

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

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 16px 0;
`;
