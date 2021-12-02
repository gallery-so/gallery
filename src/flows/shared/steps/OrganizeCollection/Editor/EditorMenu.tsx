import React from 'react';
import styled from 'styled-components';
import ColumnAdjuster from './ColumnAdjuster';

function EditorMenu() {
  return (
    <StyledEditorMenu>
      <ColumnAdjuster />
    </StyledEditorMenu>
  );
}

export const MENU_HEIGHT = 20;

const StyledEditorMenu = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 32px;
  height: ${MENU_HEIGHT}px;
`;

export default EditorMenu;
