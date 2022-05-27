import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import {
  useCollectionEditorActions,
  useCollectionMetadataState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useMemo } from 'react';
import CircleMinusIcon from 'src/icons/CircleMinusIcon';
import { CirclePlusIcon } from 'src/icons/CirclePlusIcon';
import styled from 'styled-components';

function ColumnAdjuster() {
  const collectionMetadata = useCollectionMetadataState();
  const { incrementColumns, decrementColumns } = useCollectionEditorActions();

  const columns = useMemo(
    () => collectionMetadata.layout.columns,
    [collectionMetadata.layout.columns]
  );

  return (
    <StyledColumnAdjuster>
      <BaseM>Columns</BaseM>
      <Spacer width={24} />
      <StyledButtonContainer>
        <StyledColumnButton onClick={decrementColumns} disabled={columns <= 1}>
          <CircleMinusIcon />
        </StyledColumnButton>
        <StyledNumberOfColumns>{columns}</StyledNumberOfColumns>
        <StyledColumnButton onClick={incrementColumns} disabled={columns > 5}>
          <CirclePlusIcon />
        </StyledColumnButton>
      </StyledButtonContainer>
    </StyledColumnAdjuster>
  );
}

const StyledColumnAdjuster = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

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
`;
const StyledNumberOfColumns = styled(BaseM)`
  padding: 0 8px;
`;

export default ColumnAdjuster;
