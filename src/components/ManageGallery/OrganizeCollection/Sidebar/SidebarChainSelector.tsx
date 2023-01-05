import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/Markdown/IconContainer';
import { Chain, chains } from '~/components/ManageGallery/OrganizeCollection/Sidebar/chains';
import { SidebarChainButton } from '~/components/ManageGallery/OrganizeCollection/Sidebar/SidebarChainButton';
import Tooltip from '~/components/Tooltip/Tooltip';
import { SidebarChainSelectorFragment$key } from '~/generated/SidebarChainSelectorFragment.graphql';
import { RefreshIcon } from '~/icons/RefreshIcon';

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
        <IconContainer
          variant="default"
          data-testid="RefreshButton"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={handleRefresh}
          disabled={isRefreshingNfts || !ownsWalletFromSelectedChain}
          size="sm"
          icon={
            <>
              <RefreshIcon />
              <RefreshTooltip
                active={showTooltip}
                text={
                  isRefreshingNfts ? `Refreshing...` : `Refresh ${selectedChain.shortName} Wallets`
                }
              />
            </>
          }
        />
      )}
    </Container>
  );
}

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

  padding: 16px 12px;
`;
