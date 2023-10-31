import { useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  ListRowRenderer,
} from 'react-virtualized';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { size } from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { AdmireNote } from '~/components/Feed/Socialize/AdmireModal/AdmireNote';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { AdmireModalFragment$key } from '~/generated/AdmireModalFragment.graphql';
import { AdmireModalQueryFragment$key } from '~/generated/AdmireModalQueryFragment.graphql';

export const ADMIRES_PER_PAGE = 10;

type AdmireModalProps = {
  fullscreen: boolean;
  admireRefs: AdmireModalFragment$key;
  queryRef: AdmireModalQueryFragment$key;
  loadPrevious: (count: number) => void;
  hasPrevious: boolean;
};

export function AdmireModal({
  admireRefs,
  queryRef,
  fullscreen,
  loadPrevious,
  hasPrevious,
}: AdmireModalProps) {
  const admires = useFragment(
    graphql`
      fragment AdmireModalFragment on Admire @relay(plural: true) {
        ...AdmireNoteFragment
      }
    `,
    admireRefs
  );

  const query = useFragment(
    graphql`
      fragment AdmireModalQueryFragment on Query {
        ...AdmireNoteQueryFragment
      }
    `,
    queryRef
  );

  const [measurerCache] = useState(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 0,
    });
  });

  const isRowLoaded = ({ index }: { index: number }) => !hasPrevious || index < admires.length;

  const rowCount = hasPrevious ? admires.length + 1 : admires.length;

  const handleLoadMore = useCallback(async () => {
    loadPrevious(ADMIRES_PER_PAGE);
  }, [loadPrevious]);

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, parent, key, style }) => {
      const interaction = admires[admires.length - index - 1];

      if (!interaction) {
        return null;
      }

      return (
        <CellMeasurer
          cache={measurerCache}
          columnIndex={0}
          rowIndex={index}
          key={key}
          parent={parent}
        >
          {({ registerChild }) => {
            return (
              // @ts-expect-error Bad types from react-virtualized
              <div style={style} ref={registerChild}>
                <AdmireNote admireRef={interaction} queryRef={query} />
              </div>
            );
          }}
        </CellMeasurer>
      );
    },
    [measurerCache, query, admires]
  );

  const estimatedItemHeight = 50; // assuming each item is around 50px

  const estimatedContentHeight = useMemo(() => {
    if (window.innerWidth <= size.tablet) {
      return admires.length * estimatedItemHeight;
    } else {
      return Math.min(admires.length * estimatedItemHeight, 420);
    }
  }, [admires.length, estimatedItemHeight]);

  return (
    <ModalContent fullscreen={fullscreen}>
      <WrappingVStack>
        <StyledHeader>
          <TitleDiatypeM>Admires</TitleDiatypeM>
        </StyledHeader>
        <AutoSizerWrapper>
          <AutoSizer disableHeight>
            {({ width }) => (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={handleLoadMore}
                rowCount={rowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <List
                    width={width}
                    height={estimatedContentHeight}
                    rowRenderer={rowRenderer}
                    rowCount={admires.length}
                    rowHeight={measurerCache.rowHeight}
                    onRowsRendered={onRowsRendered}
                    ref={registerChild}
                  />
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </AutoSizerWrapper>
      </WrappingVStack>
    </ModalContent>
  );
}

const WrappingVStack = styled(VStack)`
  height: 100%;
`;

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_PX}px;
  padding-left: ${MODAL_PADDING_PX}px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_PX}px 0px 0px;
  max-height: 420px;
  min-height: 100px;
  height: 100%;
`;

const AutoSizerWrapper = styled(VStack)`
  height: 100%;
`;
