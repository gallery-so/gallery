import { useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import { AutoSizer, List, ListRowProps } from 'react-virtualized';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { NftSelectorViewFragment$key } from '~/generated/NftSelectorViewFragment.graphql';
import useAddWalletModal from '~/hooks/useAddWalletModal';
import useWindowSize, { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { Chain } from '~/shared/utils/chains';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import { VStack } from '../core/Spacer/Stack';
import { BaseXL } from '../core/Text/Text';
import {
  groupNftSelectorCollectionsByAddress,
  NftSelectorCollectionGroup,
} from './groupNftSelectorCollectionsByAddress';
import { NftSelectorContractType } from './NftSelector';
import { NftSelectorTokenPreview } from './NftSelectorTokenPreview';

type Props = {
  selectedContractAddress: string | null;
  selectedNetworkView: Chain;
  onSelectContract: (collection: NftSelectorContractType) => void;
  onSetCollectionContractId: (contractId: string) => void;
  tokenRefs: NftSelectorViewFragment$key;
  hasSearchKeyword: boolean;
  handleRefresh: () => void;
  onSelectToken: (tokenId: string) => void;
};
const COLUMN_COUNT_DESKTOP = 4;
const COLUMN_COUNT_MOBILE = 3;

export function NftSelectorView({
  selectedContractAddress,
  onSelectContract,
  onSetCollectionContractId,
  tokenRefs,
  selectedNetworkView,
  hasSearchKeyword,
  handleRefresh,
  onSelectToken,
}: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorViewFragment on Token @relay(plural: true) {
        ...groupNftSelectorCollectionsByAddressTokenFragment
      }
    `,
    tokenRefs
  );

  const groupedTokens = groupNftSelectorCollectionsByAddress({
    ignoreSpam: false,
    tokenRefs: tokens,
  });

  const virtualizedListRef = useRef<List | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTop = 0;
    }
  }, [selectedContractAddress]);

  const { hideModal } = useModalActions();

  const onNewWalletConnected = useCallback(async () => {
    handleRefresh();
    hideModal();
  }, [hideModal, handleRefresh]);

  const showAddWalletModal = useAddWalletModal();
  const handleManageWalletsClick = useCallback(() => {
    showAddWalletModal({ onConnectWalletSuccess: onNewWalletConnected });
  }, [onNewWalletConnected, showAddWalletModal]);

  const isMobile = useIsMobileWindowWidth();
  const columnCount = isMobile ? COLUMN_COUNT_MOBILE : COLUMN_COUNT_DESKTOP;

  const rows = useMemo(() => {
    const rows = [];

    let tokens = [...groupedTokens];

    if (selectedNetworkView === 'POAP') {
      const groupOfPoapTokens = groupedTokens[0];

      if (groupOfPoapTokens) {
        const selectedCollectionTokens: NftSelectorCollectionGroup[] = [];

        groupOfPoapTokens.tokens.forEach((token) => {
          selectedCollectionTokens.push({
            title: groupOfPoapTokens.title,
            address: groupOfPoapTokens.address,
            tokens: [token],
          });
        });

        tokens = selectedCollectionTokens;
      }
    } else if (selectedContractAddress) {
      const groupOfTokens = groupedTokens.find(
        (group) => group.address === selectedContractAddress
      );

      if (groupOfTokens) {
        const selectedCollectionTokens: NftSelectorCollectionGroup[] = [];

        groupOfTokens.tokens.forEach((token) => {
          selectedCollectionTokens.push({
            title: groupOfTokens.title,
            address: groupOfTokens.address,
            tokens: [token],
          });
        });
        tokens = selectedCollectionTokens;
        console.log("tokens", tokens);
        console.log("tokens[0]?.tokens[0]?.contract?.dbid", tokens[0]?.tokens[0]?.contract?.dbid);
        onSetCollectionContractId(tokens[0]?.tokens[0]?.contract?.dbid ?? '');
      }
    }

    for (let i = 0; i < tokens.length; i += columnCount) {
      const row = tokens.slice(i, i + columnCount);

      rows.push(row);
    }

    return rows;
  }, [columnCount, groupedTokens, selectedContractAddress, selectedNetworkView, onSetCollectionContractId]);

  const { width } = useWindowSize();
  const rowHeight = useMemo(() => {
    if (isMobile) {
      // calculate the width of each item: screen width - 32px side padding - 2x16px gap between items, and divided by number of columns
      const itemWidth = (width - 64) / 3;
      // add 16px for top and bottom gap between rows
      return itemWidth + 16;
    }
    return 220;
  }, [isMobile, width]);

  const rowRenderer = useCallback(
    ({ key, style, index }: ListRowProps) => {
      const row = rows[index];

      if (!row) {
        return null;
      }

      return (
        <StyledNftSelectorViewContainer key={key} style={style} columnCount={columnCount}>
          {row.map((column, index) => {
            return (
              <NftSelectorTokenPreview
                key={index}
                group={column}
                onSelectToken={onSelectToken}
                onSelectContract={onSelectContract}
                hasSelectedContract={Boolean(selectedContractAddress)}
              />
            );
          })}
        </StyledNftSelectorViewContainer>
      );
    },
    [columnCount, onSelectContract, onSelectToken, rows, selectedContractAddress]
  );

  if (!rows.length && !hasSearchKeyword) {
    return (
      <StyledWrapper>
        <StyledEmptyStateContainer align="center" justify="center" gap={24}>
          <StyledEmptyStateText>No NFTs found, try another wallet?</StyledEmptyStateText>
          <Button variant="primary" onClick={handleManageWalletsClick}>
            Connect Wallet
          </Button>
        </StyledEmptyStateContainer>
      </StyledWrapper>
    );
  }

  if (!rows.length && hasSearchKeyword) {
    return (
      <StyledWrapper>
        <StyledEmptyStateContainer align="center" justify="center">
          <StyledEmptyStateText>No results</StyledEmptyStateText>
        </StyledEmptyStateContainer>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper ref={viewRef}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={virtualizedListRef}
            width={width}
            height={height}
            rowHeight={rowHeight}
            rowCount={rows.length}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoSizer>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: relative;
  height: 100vh;

  @media only screen and ${breakpoints.desktop} {
    height: 500px;
  }
`;

const StyledNftSelectorViewContainer = styled.div<{ columnCount: number }>`
  padding: 8px 0;

  display: grid;
  grid-template-columns: repeat(${({ columnCount }) => columnCount}, minmax(0, 1fr));

  gap: 16px;
`;

const StyledEmptyStateContainer = styled(VStack)`
  height: 100%;
`;

const StyledEmptyStateText = styled(BaseXL)`
  font-weight: 700;
`;
