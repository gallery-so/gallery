import { useEffect } from 'react';
import styled from 'styled-components';

import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { useModal } from 'contexts/modal/ModalContext';
import { Nft } from 'types/Nft';
import Sidebar from './Sidebar/Sidebar';
import Editor from './Editor/Editor';
import Directions from './Directions';
import CollectionNamingForm from './CollectionNamingForm';
import useNftEditor from './useNftEditor';

function useWizardConfig(stagedNfts: Nft[]) {
  const { setNextEnabled } = useWizardValidationActions();
  const { setOnNext } = useWizardCallback();
  const { showModal } = useModal();

  useEffect(() => {
    setOnNext(() => showModal(<CollectionNamingForm />));

    return () => setOnNext(undefined);
  }, [setOnNext, showModal]);

  useEffect(() => {
    setNextEnabled(stagedNfts.length > 0);

    return () => setNextEnabled(true);
  }, [setNextEnabled, stagedNfts.length]);
}

function AddNfts() {
  const {
    stagedNfts,
    handleStageNft,
    handleUnstageNft,
    handleSortNfts,
  } = useNftEditor();

  useWizardConfig(stagedNfts);

  return (
    <StyledAddNfts>
      <SidebarContainer>
        <Sidebar onStageNft={handleStageNft} onUnstageNft={handleUnstageNft} />
      </SidebarContainer>
      <EditorContainer>
        {stagedNfts.length ? (
          <Editor stagedNfts={stagedNfts} onSortNfts={handleSortNfts} />
        ) : (
          <Directions />
        )}
      </EditorContainer>
    </StyledAddNfts>
  );
}

const StyledAddNfts = styled.div`
  display: flex;
`;

const SIDEBAR_WIDTH = 280;

const SidebarContainer = styled.div`
  width: ${SIDEBAR_WIDTH}px;
`;

const EditorContainer = styled.div`
  width: calc(100vw - ${SIDEBAR_WIDTH}px);
`;

export default AddNfts;
