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
import { ANIMATION_NFT, AUDIO_NFT } from 'mocks/nfts';
import { Nft } from 'types/Nft';
import { Collection } from 'types/Collection';
import { EditModeNft } from '../types';
import useUnassignedNfts from 'hooks/api/nfts/useUnassignedNfts';

// @ts-expect-error
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

  const unassignedNfts = useUnassignedNfts({ skipCache: false });

  // initialize sidebarNfts
  useEffect(() => {
    if (!unassignedNfts) {
      return;
    }

    const availableNfts: EditModeNft[] = convertNftsToEditModeNfts(
      unassignedNfts
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
  }, [collectionIdBeingEdited, setSidebarNfts, stageNfts, unassignedNfts]);

  return (
    <StyledOrganizeCollection>
      <StyledSidebarContainer>
        <Sidebar />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        {stagedNfts.length ? <StagingArea /> : <Directions />}
      </StyledEditorContainer>
    </StyledOrganizeCollection>
  );
}
const SIDEBAR_WIDTH = 280;

const StyledOrganizeCollection = styled.div`
  display: flex;
`;

const StyledSidebarContainer = styled.div`
  width: ${SIDEBAR_WIDTH}px;
`;

const StyledEditorContainer = styled.div`
  width: calc(100vw - ${SIDEBAR_WIDTH}px);
`;

export default CollectionEditor;
