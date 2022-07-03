import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { TitleS } from 'components/core/Text/Text';
import React from 'react';
import styled from 'styled-components';
import ColumnAdjuster from './ColumnAdjuster';
// import LiveDisplayAdjuster from './LiveDisplayAdjuster';

function EditorMenu() {
  return (
    <StyledEditorMenu>
      <StyledTitleS>Collection settings</StyledTitleS>
      <StyledSidebarItem>
        <ColumnAdjuster />
      </StyledSidebarItem>
      {/* <StyledSidebarItem>
        <LiveDisplayAdjuster />
      </StyledSidebarItem> */}
    </StyledEditorMenu>
  );
}

export const MENU_WIDTH = 250;

const StyledTitleS = styled(TitleS)`
  min-height: 52px;
  width: 249px;
  left: 0px;
  top: 0px;
  border-radius: 0px;
  padding: 16px 0;
`;

const StyledEditorMenu = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  width: ${MENU_WIDTH}px;
  border-left: 1px solid ${colors.porcelain};
`;

const StyledSidebarItem = styled.div`
  min-height: 52px;
  padding: 16px 0;
  justify: space-between;
`;

export default EditorMenu;
