import styled, { css } from 'styled-components';
import IconContainer from 'components/core/Markdown/IconContainer';
import { RefreshIcon } from 'icons/RefreshIcon';
import { useCallback, useState } from 'react';
import Tooltip from 'components/Tooltip/Tooltip';
import { graphql, useFragment } from 'react-relay';
import { SidebarChainSelectorFragment$key } from '../../../../../../__generated__/SidebarChainSelectorFragment.graphql';
import { SidebarChainButton } from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarChainButton';
import { Chain, chains } from 'flows/shared/steps/OrganizeCollection/Sidebar/chains';
import isRefreshDisabledForUser from './isRefreshDisabledForUser';

type SidebarChainsProps = {
  ownsWalletFromSelectedChain: boolean;
  selected: Chain;
  onChange: (chain: Chain) => void;
  queryRef: SidebarChainSelectorFragment$key;
  handleRefresh: () => void;
  isRefreshingNfts: boolean;
};

export function SidebarChainSelector({
  ownsWalletFromSelectedChain,
  selected,
  onChange,
  queryRef,
  handleRefresh,
  isRefreshingNfts,
}: SidebarChainsProps) {
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

  const [showTooltip, setShowTooltip] = useState(false);

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
      <Chains>
        {chains.map((chain) => {
          const isSelected = chain.name === selected;

          return (
            <SidebarChainButton
              key={chain.name}
              locked={false}
              icon={chain.icon}
              title={chain.shortName}
              isSelected={isSelected}
              onClick={() => handleChainClick(chain.name)}
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
          disabled={!ownsWalletFromSelectedChain}
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

  :disabled {
    ${StyledIconContainer} {
      cursor: not-allowed;
    }
  }
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
