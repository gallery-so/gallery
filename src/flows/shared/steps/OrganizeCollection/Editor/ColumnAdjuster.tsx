import TextButton, { StyledButtonText } from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { BodyRegular, Caption } from 'components/core/Text/Text';
import { useCollectionEditorActions, useCollectionMetadataState } from 'contexts/collectionEditor/CollectionEditorContext';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

type Props = {
  onClick: () => void;
};

function SymbolButton({ onClick }: Props) {
  return (
    <StyledSymbolButton onClick={onClick}>﹣</StyledSymbolButton>
  );
}

const StyledSymbolButton = styled.button`
  padding: 0;
  border-style: none;
  cursor: pointer;
  background: none;
  width: max-content;

  pointer-events: ${({ disabled }) => disabled ? 'none' : 'inherit'};

  `;
  // &:hover ${StyledButtonText} {
  //   color: ${colors.black};
  //   text-decoration: ${({ underlineOnHover }) =>
  //   underlineOnHover ? 'underline' : undefined};
  // }

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
        {/* <SymbolButton onClick={handleDecrementButtonClick} /> */}
        <StyledColumnButton text="−" onClick={handleDecrementButtonClick} disabled={columns <= 1}/>
        <StyledNumberOfColumns>{columns}</StyledNumberOfColumns>
        <StyledColumnButton text="+" onClick={handleIncrementButtonClick} disabled={columns > 5}/>
      </StyledButtonContainer>
    </StyledColumnAdjuster>
  );
}

const StyledColumnAdjuster = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: baseline;
`;

const StyledColumnButton = styled(TextButton)<{ disabled: boolean }>`
  font-size: 16px;
  
  // Override default TextButton font size
  ${StyledButtonText} {
    color: ${({ disabled }) => disabled ? colors.gray20 : colors.gray70};
    font-size: 20px;
  }
`;
const StyledNumberOfColumns = styled(BodyRegular)`
  padding: 0 8px;
`;

export default ColumnAdjuster;
