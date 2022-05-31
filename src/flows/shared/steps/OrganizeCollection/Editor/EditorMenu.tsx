import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { TitleS } from 'components/core/Text/Text';
import React from 'react';
import styled from 'styled-components';
import ColumnAdjuster from './ColumnAdjuster';

function EditorMenu() {
  return (
    <StyledEditorMenu>
      <Spacer height={16} />
      <TitleS>Collection settings</TitleS>
      <Spacer height={28} />
      <ColumnAdjuster />
      <Spacer height={24} />
    </StyledEditorMenu>
  );
}

export const MENU_WIDTH = 250;

const StyledEditorMenu = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  width: ${MENU_WIDTH}px;
  border-left: 1px solid ${colors.porcelain};
`;

export default EditorMenu;
