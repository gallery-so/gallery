import { useEffect, useMemo } from 'react';
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
import { Nft } from 'types/Nft';
import { EditModeNft } from '../types';
import useUnassignedNfts from 'hooks/api/nfts/useUnassignedNfts';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';

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

  const { collections } = useAuthenticatedGallery();
  const nftsWithinCollectionBeingEdited = useMemo(() => {
    const collectionBeingEdited = collections.find(
      (coll) => coll.id === collectionIdBeingEdited
    );
    return collectionBeingEdited?.nfts ?? [];
  }, [collectionIdBeingEdited, collections]);

  // initialize sidebarNfts
  useEffect(() => {
    if (!unassignedNfts) {
      return;
    }

    const availableNfts: EditModeNft[] = convertNftsToEditModeNfts(
      unassignedNfts
    );

    if (collectionIdBeingEdited) {
      const existingCollectionNfts: EditModeNft[] = convertNftsToEditModeNfts(
        nftsWithinCollectionBeingEdited,
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
  }, [
    collectionIdBeingEdited,
    setSidebarNfts,
    stageNfts,
    unassignedNfts,
    nftsWithinCollectionBeingEdited,
  ]);

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
