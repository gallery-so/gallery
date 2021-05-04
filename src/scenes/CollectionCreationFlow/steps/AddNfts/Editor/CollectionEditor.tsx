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
      <SidebarContainer>
        <Sidebar />
      </SidebarContainer>
      <EditorContainer>
        {stagedNfts.length ? <StagingArea /> : <Directions />}
      </EditorContainer>
    </>
  );
}
const SIDEBAR_WIDTH = 280;

const SidebarContainer = styled.div`
  width: ${SIDEBAR_WIDTH}px;
`;

const EditorContainer = styled.div`
  width: calc(100vw - ${SIDEBAR_WIDTH}px);
`;

export default CollectionEditor;
