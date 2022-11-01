import colors from 'components/core/colors';
import { TitleS } from 'components/core/Text/Text';
import {
  useActiveSectionIdState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import React from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { EditorMenuFragment$key } from '__generated__/EditorMenuFragment.graphql';
import ColumnAdjuster from './ColumnAdjuster';

type Props = {
  viewerRef: EditorMenuFragment$key;
};

function EditorMenu({ viewerRef }: Props) {
  const viewer = useFragment(
    graphql`
      fragment EditorMenuFragment on Viewer {
        ...ColumnAdjusterFragment
      }
    `,
    viewerRef
  );

  const activeSectionId = useActiveSectionIdState();
  const stagedCollectionState = useStagedCollectionState();
  const activeSection = activeSectionId && stagedCollectionState[activeSectionId];

  return (
    <StyledEditorMenu>
      <StyledTitleS>{activeSectionId ? 'Section' : 'Collection'} settings</StyledTitleS>
      <StyledSidebarItem>
        {activeSection && <ColumnAdjuster activeSectionId={activeSectionId} viewerRef={viewer} />}
      </StyledSidebarItem>
    </StyledEditorMenu>
  );
}

export const MENU_WIDTH = 250;

const StyledTitleS = styled(TitleS)`
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
