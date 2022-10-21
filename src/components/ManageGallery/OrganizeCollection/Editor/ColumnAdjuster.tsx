import { UniqueIdentifier } from '@dnd-kit/core';
import colors from 'components/core/colors';
import { HStack } from 'components/core/Spacer/Stack';
import { BaseM } from 'components/core/Text/Text';
import {
  useCollectionEditorActions,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import useMaxColumns from 'contexts/collectionEditor/useMaxColumns';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import CircleMinusIcon from 'icons/CircleMinusIcon';
import CirclePlusIcon from 'icons/CirclePlusIcon';
import styled from 'styled-components';
import { ColumnAdjusterFragment$key } from '__generated__/ColumnAdjusterFragment.graphql';

type Props = {
  viewerRef: ColumnAdjusterFragment$key;
  activeSectionId: UniqueIdentifier;
};

function ColumnAdjuster({ viewerRef, activeSectionId }: Props) {
  const viewer = useFragment(
    graphql`
      fragment ColumnAdjusterFragment on Viewer {
        ...useMaxColumnsFragment
      }
    `,
    viewerRef
  );

  const stagedCollectionState = useStagedCollectionState();
  const { incrementColumns, decrementColumns } = useCollectionEditorActions();

  const activeSection = stagedCollectionState[activeSectionId];
  const columns = activeSection.columns;

  const maxColumns = useMaxColumns(viewer);
  const handleIncrementClick = useCallback(
    () => incrementColumns(activeSectionId),
    [activeSectionId, incrementColumns]
  );
  const handleDecrementClick = useCallback(
    () => decrementColumns(activeSectionId),
    [activeSectionId, decrementColumns]
  );

  return (
    <HStack gap={24} align="center" justify="space-between">
      <BaseM>Columns</BaseM>
      <StyledButtonContainer>
        <StyledColumnButton onClick={handleDecrementClick} disabled={columns <= 1}>
          <CircleMinusIcon />
        </StyledColumnButton>
        <StyledNumberOfColumns>{columns}</StyledNumberOfColumns>
        <StyledColumnButton onClick={handleIncrementClick} disabled={columns >= maxColumns}>
          <CirclePlusIcon />
        </StyledColumnButton>
      </StyledButtonContainer>
    </HStack>
  );
}

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledColumnButton = styled.button<{ disabled: boolean }>`
  font-size: 16px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: none;

  path {
    stroke: ${({ disabled }) => (disabled ? `${colors.porcelain}` : 'auto')};
  }
`;

const StyledNumberOfColumns = styled(BaseM)`
  padding: 0 8px;
`;

export default ColumnAdjuster;
