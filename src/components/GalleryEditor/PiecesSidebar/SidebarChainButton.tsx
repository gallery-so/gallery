import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/Markdown/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXSBold } from '~/components/core/Text/Text';
import { ChainMetadata } from '~/components/GalleryEditor/PiecesSidebar/chains';
import isRefreshDisabledForUser from '~/components/GalleryEditor/PiecesSidebar/isRefreshDisabledForUser';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import Tooltip from '~/components/Tooltip/Tooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { SidebarChainButtonFragment$key } from '~/generated/SidebarChainButtonFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { doesUserOwnWalletFromChain } from '~/utils/doesUserOwnWalletFromChain';

type Props = {
  chain: ChainMetadata;
  onClick: () => void;
  isSelected: boolean;
  queryRef: SidebarChainButtonFragment$key;
};

export function SidebarChainButton({ isSelected, onClick, chain, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment SidebarChainButtonFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }

        ...doesUserOwnWalletFromChainFragment
      }
    `,
    queryRef
  );

  const [showTooltip, setShowTooltip] = useState(false);

  const { isLocked, syncTokens } = useSyncTokens();

  const isRefreshDisabledAtUserLevel = isRefreshDisabledForUser(query.viewer?.user?.dbid ?? '');
  const refreshDisabled =
    isRefreshDisabledAtUserLevel && doesUserOwnWalletFromChain(chain.name, query);

  const handleRefresh = useCallback(async () => {
    await syncTokens(chain.name);
  }, [chain.name, syncTokens]);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover();

  return (
    <>
      <ChainButton role="button" onClick={onClick} selected={isSelected}>
        <HStack align="center">
          <ChainLogo src={chain.icon} />
          <TitleXSBold>{chain.shortName}</TitleXSBold>
        </HStack>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              key={chain.name}
              transition={{ duration: 0.15 }}
              initial={{ width: '0px', margin: '-4px 0', opacity: 0, scale: 0 }}
              animate={{ width: 'auto', margin: '-4px -6px', opacity: 1, scale: 1 }}
            >
              <IconContainer
                size="sm"
                variant="default"
                onClick={handleRefresh}
                disabled={refreshDisabled}
                ref={reference}
                {...getReferenceProps()}
                icon={
                  <>
                    <RefreshIcon />
                  </>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ChainButton>
      <NewTooltip
        {...getFloatingProps()}
        style={floatingStyle}
        ref={floating}
        text={isLocked ? `Refreshing...` : `Refresh ${chain.shortName} Wallets`}
      />
    </>
  );
}
const ChainLogo = styled.img`
  width: 16px;
  height: 16px;

  margin-right: 4px;
`;

const RefreshTooltip = styled(Tooltip)<{ active: boolean }>`
  bottom: 0;
  opacity: ${({ active }) => (active ? 1 : 0)};
  transform: translateY(calc(100% + ${({ active }) => (active ? 4 : 0)}px));
`;

const ChainButton = styled.div<{ selected: boolean }>`
  display: flex;
  gap: 0 8px;
  padding: 6px 8px;

  z-index: 1;

  border: 1px solid ${colors.offBlack};
  border-radius: 24px;

  position: relative;
  align-items: center;
  cursor: pointer;

  ${({ selected }) =>
    selected
      ? css`
          opacity: 1;
        `
      : css`
          opacity: 0.5;
          border-color: ${colors.porcelain};
          filter: blur(0.05px);

          :hover {
            filter: none;
            opacity: 1;
          }
        `}
`;
