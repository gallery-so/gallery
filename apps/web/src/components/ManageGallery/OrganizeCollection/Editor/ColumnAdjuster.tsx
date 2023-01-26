import { UniqueIdentifier } from '@dnd-kit/core';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import {
  useCollectionEditorActions,
  useStagedCollectionState,
} from '~/contexts/collectionEditor/CollectionEditorContext';
import useMaxColumns from '~/contexts/collectionEditor/useMaxColumns';
import { ColumnAdjusterFragment$key } from '~/generated/ColumnAdjusterFragment.graphql';
import CircleMinusIcon from '~/icons/CircleMinusIcon';
import CirclePlusIcon from '~/icons/CirclePlusIcon';

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
        <IconContainer
          size="sm"
          variant="default"
          onClick={handleDecrementClick}
          disabled={columns <= 1}
          icon={<CircleMinusIcon />}
        />

        <StyledNumberOfColumns>{columns}</StyledNumberOfColumns>

        <IconContainer
          size="sm"
          variant="default"
          onClick={handleIncrementClick}
          disabled={columns >= maxColumns}
          icon={<CirclePlusIcon />}
        />
      </StyledButtonContainer>
    </HStack>
  );
}

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledNumberOfColumns = styled(BaseM)`
  padding: 0 8px;
`;

export default ColumnAdjuster;
