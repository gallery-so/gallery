import { useEffect } from 'react';
import styled from 'styled-components';

import Sidebar from '../Sidebar/Sidebar';
import StagingArea from './StagingArea';
import Directions from '../Directions';

import {
  useCollectionEditorActions,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';
import { ANIMATION_NFT, AUDIO_NFT, IMAGE_NFT, VIDEO_NFT } from 'mocks/nfts';
import { EditModeNft } from 'hooks/api/nfts/types';
import { Nft } from 'types/Nft';
import { Collection } from 'types/Collection';

const MOCKED_AVAILABLE_NFTS = [IMAGE_NFT, VIDEO_NFT];
const MOCKED_EXISTING_COLLECTION: Collection = {
  id: '123',
  nfts: [AUDIO_NFT, ANIMATION_NFT],
};

function convertNftsToEditModeNfts(nfts: Nft[], isSelected: boolean = false) {
  return nfts.map((nft, index) => ({
    index: index,
    nft,
    id: nft.id,
    isSelected,
  }));
}

function CollectionEditor() {
  const stagedNfts = useStagedNftsState();
  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(stagedNfts.length > 0);

    return () => setNextEnabled(true);
  }, [setNextEnabled, stagedNfts]);

  const { collectionIdBeingEdited } = useCollectionWizardState();
  const { setSidebarNfts, stageNfts } = useCollectionEditorActions();

  // initialize sidebarNfts
  useEffect(() => {
    // TODO__v1: get all "available nfts" from swr - (nfts not in a collection)
    const availableNfts: EditModeNft[] = convertNftsToEditModeNfts(
      MOCKED_AVAILABLE_NFTS
    );

    if (collectionIdBeingEdited) {
      // EDITING A COLLECTION
      // TODO__v1: get the collection being edited from swr
      const existingCollectionNfts: EditModeNft[] = convertNftsToEditModeNfts(
        MOCKED_EXISTING_COLLECTION.nfts,
        true
      );
      const sidebarNfts = existingCollectionNfts.concat(availableNfts);

      // reset index based on new position in sidebarNfts
      sidebarNfts.forEach((editModeNft, index) => {
        editModeNft.index = index;
      });
      setSidebarNfts(sidebarNfts);
      stageNfts(existingCollectionNfts);
      return;
    }
    // NEW COLLECTION
    setSidebarNfts(availableNfts);
  }, [collectionIdBeingEdited, setSidebarNfts, stageNfts]);

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
