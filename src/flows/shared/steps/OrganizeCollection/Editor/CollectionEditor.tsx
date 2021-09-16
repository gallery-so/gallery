import { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import {
  useCollectionEditorActions,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';
import { Nft } from 'types/Nft';
import useUnassignedNfts from 'hooks/api/nfts/useUnassignedNfts';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import { useAuthenticatedUserAddress } from 'hooks/api/users/useUser';
import useOpenseaSync from 'hooks/api/nfts/useOpenseaSync';
import { EditModeNft } from '../types';
import Directions from '../Directions';
import Sidebar from '../Sidebar/Sidebar';
import StagingArea from './StagingArea';

function convertNftsToEditModeNfts(nfts: Nft[], isSelected = false) {
  return nfts.map((nft, index) => ({
    index,
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

    return () => {
      setNextEnabled(true);
    };
  }, [setNextEnabled, stagedNfts]);

  const { collectionIdBeingEdited } = useCollectionWizardState();
  const { setSidebarNfts, stageNfts } = useCollectionEditorActions();

  const address = useAuthenticatedUserAddress();
  useOpenseaSync({ address, skipCache: false });
  const unassignedNfts = useUnassignedNfts({ skipCache: false });

  const { collections } = useAuthenticatedGallery();
  const nftsWithinCollectionBeingEdited = useMemo(() => {
    const collectionBeingEdited = collections.find(
      coll => coll.id === collectionIdBeingEdited,
    );
    return collectionBeingEdited?.nfts ?? [];
  }, [collectionIdBeingEdited, collections]);

  // Initialize sidebarNfts
  useEffect(() => {
    if (!unassignedNfts) {
      return;
    }

    const availableNfts: EditModeNft[] = convertNftsToEditModeNfts(
      unassignedNfts,
    );

    if (collectionIdBeingEdited) {
      const existingCollectionNfts: EditModeNft[] = convertNftsToEditModeNfts(
        nftsWithinCollectionBeingEdited,
        true,
      );
      const sidebarNfts = existingCollectionNfts.concat(availableNfts);

      // Reset index based on new position in sidebarNfts
      for (const [index, editModeNft] of sidebarNfts.entries()) {
        editModeNft.index = index;
      }

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
        {stagedNfts.length > 0 ? <StagingArea /> : <Directions />}
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
