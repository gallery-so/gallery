import { useEffect } from 'react';
import styled from 'styled-components';

import Sidebar from '../Sidebar/Sidebar';
import StagingArea from './StagingArea';
import Directions from '../Directions';

import { useStagedNftsState } from 'contexts/collectionEditor/CollectionEditorContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';

function CollectionEditor() {
  const stagedNfts = useStagedNftsState();
  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(stagedNfts.length > 0);

    return () => setNextEnabled(true);
  }, [setNextEnabled, stagedNfts]);

  return (
    <>
      <StyledSidebarContainer>
        <Sidebar />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        {stagedNfts.length ? <StagingArea /> : <Directions />}
      </StyledEditorContainer>
    </>
  );
}
const SIDEBAR_WIDTH = 280;

const StyledSidebarContainer = styled.div`
  width: ${SIDEBAR_WIDTH}px;
`;

const StyledEditorContainer = styled.div`
  width: calc(100vw - ${SIDEBAR_WIDTH}px);
`;

export default CollectionEditor;
