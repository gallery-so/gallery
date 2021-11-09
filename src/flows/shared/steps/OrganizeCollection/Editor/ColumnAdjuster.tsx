import TextButton from 'components/core/Button/TextButton';
import Spacer from 'components/core/Spacer/Spacer';
import { BodyRegular, Caption } from 'components/core/Text/Text';
import { useCollectionEditorActions, useCollectionMetadataState } from 'contexts/collectionEditor/CollectionEditorContext';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

function ColumnAdjuster() {
  const collectionMetadata = useCollectionMetadataState();
  const { incrementColumns, decrementColumns } = useCollectionEditorActions();

  const handleDecrementButtonClick = useCallback(() => {
    decrementColumns();
  }, []);

  const handleIncrementButtonClick = useCallback(() => {
    incrementColumns();
  }, []);

  const columns = useMemo(() => collectionMetadata.layout.columns, [collectionMetadata.layout.columns]);

  return (
    <StyledColumnAdjuster>
      <Caption>COLUMNS</Caption>
      <Spacer width={24} />
      <StyledButtonContainer>
        <StyledColumnButton text="-" onClick={handleDecrementButtonClick} disabled={columns <= 1}/>
        <StyledNumberOfColumns>{columns}</StyledNumberOfColumns>
        <StyledColumnButton text="+" onClick={handleIncrementButtonClick} disabled={columns > 5}/>
      </StyledButtonContainer>
    </StyledColumnAdjuster>
  );
}

const StyledColumnAdjuster = styled.div`
  display: flex;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  `;

const StyledColumnButton = styled(TextButton)`
  font-size: 16px;`;

const StyledNumberOfColumns = styled(BodyRegular)`
  padding: 0 8px;
  `;

export default ColumnAdjuster;
