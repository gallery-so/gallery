import colors from 'components/core/colors';
import { TitleXS } from 'components/core/Text/Text';
import { SIDEBAR_ICON_DIMENSIONS } from 'constants/sidebar';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import { useCallback } from 'react';
import styled from 'styled-components';
import { generate12DigitId } from 'utils/collectionLayout';

export default function AddBlankBlock() {
  const { stageTokens } = useCollectionEditorActions();

  const handleAddBlankBlockClick = useCallback(() => {
    const id = `blank-${generate12DigitId()}`;
    stageTokens([{ id, whitespace: 'whitespace' }]);
    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [stageTokens]);

  return (
    <StyledAddBlankBlock onClick={handleAddBlankBlockClick}>
      <StyledAddBlankBlockText>Add Blank Space</StyledAddBlankBlockText>
    </StyledAddBlankBlock>
  );
}

const StyledAddBlankBlock = styled.div`
  height: ${SIDEBAR_ICON_DIMENSIONS}px;
  width: ${SIDEBAR_ICON_DIMENSIONS}px;
  background-color: ${colors.offWhite};
  border: 1px solid ${colors.metal};
  text-transform: uppercase;
  display: flex;
  align-items: center;
  user-select: none;

  &:hover {
    cursor: pointer;
  }

  &:active {
    background-color: ${colors.metal};
  }
`;

const StyledAddBlankBlockText = styled(TitleXS)`
  color: ${colors.shadow};
  text-align: center;
`;
