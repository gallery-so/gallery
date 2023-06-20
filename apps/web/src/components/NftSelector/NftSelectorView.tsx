import { useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import { AutoSizer, List, ListRowProps } from 'react-virtualized';
import styled from 'styled-components';

import { NftSelectorViewFragment$key } from '~/generated/NftSelectorViewFragment.graphql';

import { VStack } from '../core/Spacer/Stack';
import { BaseXL } from '../core/Text/Text';
import {
  CollectionGroup,
  groupCollectionsByAddress,
} from '../GalleryEditor/PiecesSidebar/groupCollectionsByAddress';
import { NftSelectorTokenPreview } from './NftSelectorTokenPreview';

type Props = {
  selectedContractAddress: string | null;
  onSelectContractAddress: (contractAddress: string) => void;
  tokenRefs: NftSelectorViewFragment$key;
};
const COLUMN_COUNT = 4;

export function NftSelectorView({
  selectedContractAddress,
  onSelectContractAddress,
  tokenRefs,
}: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorViewFragment on Token @relay(plural: true) {
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        chain
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        isSpamByUser
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        isSpamByProvider
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        contract {
          # Escape hatch for data processing in util files
          # eslint-disable-next-line relay/unused-fields
          name

          contractAddress {
            address
          }
        }
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...NftSelectorTokenFragment
      }
    `,
    tokenRefs
  );

  const groupedTokens = groupCollectionsByAddress({
    // @ts-expect-error: fix this
    tokens,
    ignoreSpam: false,
  });

  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTop = 0;
    }
  }, [selectedContractAddress]);

  const rows = useMemo(() => {
    const rows = [];

    let tokens = [...groupedTokens];

    if (selectedContractAddress) {
      const groupOfTokens = groupedTokens.find(
        (group) => group.address === selectedContractAddress
      );

      if (groupOfTokens) {
        const selectedCollectionTokens: CollectionGroup[] = [];

        groupOfTokens.tokens.forEach((token) => {
          selectedCollectionTokens.push({
            title: groupOfTokens.title,
            address: groupOfTokens.address,
            tokens: [token],
          });
        });

        tokens = selectedCollectionTokens;
      }
    }

    for (let i = 0; i < tokens.length; i += COLUMN_COUNT) {
      const row = tokens.slice(i, i + COLUMN_COUNT);

      rows.push(row);
    }

    return rows;
  }, [groupedTokens, selectedContractAddress]);

  const rowRenderer = useCallback(
    ({ key, style, index }: ListRowProps) => {
      const row = rows[index];

      if (!row) {
        return null;
      }

      return (
        <StyledNftSelectorViewContainer key={key} style={style}>
          {row.map((column) => {
            return (
              <NftSelectorTokenPreview
                key={column.address}
                group={column}
                onSelectGroup={onSelectContractAddress}
              />
            );
          })}
        </StyledNftSelectorViewContainer>
      );
    },
    [onSelectContractAddress, rows]
  );

  if (!rows.length) {
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
            width={width}
            height={height}
            rowHeight={220}
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
  height: 500px;
`;

const StyledNftSelectorViewContainer = styled.div`
  padding: 16px 0;

  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 16px;
`;

const StyledEmptyStateContainer = styled(VStack)`
  height: 100%;
`;

const StyledEmptyStateText = styled(BaseXL)`
  font-weight: 700;
`;
