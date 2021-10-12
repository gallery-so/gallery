import { useCallback, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import {
  useCollectionEditorActions,
  useSidebarNftsState,
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

function convertNftsToEditModeNfts(nfts: Nft[], isSelected = false): EditModeNft[] {
  return nfts.map((nft, index) => ({
    index,
    nft,
    id: nft.id,
    isSelected,
  }));
}

// converts an object into an array containing all of the object's values
function convertObjectToArray(object: Record<string, EditModeNft>) {
  return Object.keys(object).map(key => object[key]);
}

function CollectionEditor() {
  const stagedNfts = useStagedNftsState();
  const sidebarNfts = useSidebarNftsState();
  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(stagedNfts.length > 0);

    return () => {
      setNextEnabled(true);
    };
  }, [setNextEnabled, stagedNfts]);

  const { collectionIdBeingEdited } = useCollectionWizardState();
  const { setSidebarNfts, stageNfts, unstageNfts } = useCollectionEditorActions();

  const address = useAuthenticatedUserAddress();
  // useOpenseaSync({ address, skipCache: false });
  const unassignedNfts = useUnassignedNfts({ skipCache: false });

  const { collections } = useAuthenticatedGallery();
  const collectionIdBeingEditedRef = useRef<string>(collectionIdBeingEdited ?? '');
  const nftsFromCollectionBeingEdited = useMemo(() => {
    const collectionBeingEdited = collections.find(
      coll => coll.id === collectionIdBeingEditedRef.current,
    );
    return collectionBeingEdited?.nfts ?? [];
  }, [collections]);

  const sidebarNftsRef = useRef<EditModeNft[]>([]);
  useEffect(() => {
    sidebarNftsRef.current = sidebarNfts;
  }, [sidebarNfts]);

  // converts unassignedNfts to an object where key is nft Id and value is editmodenft
  // this makes it easier to update specific NFTs compared to iterating through an array
  const unassignedEditModeNftObject = useMemo(() => {
    if (!unassignedNfts) {
      return {};
    }

    const unassignedEditModeNfts = convertNftsToEditModeNfts(unassignedNfts);

    return Object.fromEntries(unassignedEditModeNfts.map(nft => [nft.id, nft]));
  }
  , [unassignedNfts]);

  // decorates NFTs in collection with additional fields for the purpose of editing / dnd
  const editModeNftsInCollection: EditModeNft[] = useMemo(() => {
    if (!collectionIdBeingEditedRef.current) {
      return [];
    }

    return convertNftsToEditModeNfts(
      nftsFromCollectionBeingEdited,
      true,
    );
  }, [nftsFromCollectionBeingEdited]);

  // refreshes the sidebar nfts with the latest unassigned NFTs, while retaining the current user selections
  const refreshSidebarNfts = useCallback(() => {
    // Initialize new sidebar nfts
    let newSidebarNfts: Record<string, EditModeNft> = {};
    // Add nfts in current collection to sidebar
    for (const nft of editModeNftsInCollection) {
      newSidebarNfts[nft.id] = nft;
    }

    // Add unassigned nfts to sidebar
    newSidebarNfts = { ...newSidebarNfts, ...unassignedEditModeNftObject };

    if (sidebarNftsRef.current.length === 0) {
      return convertObjectToArray(newSidebarNfts);
    }

    // Iterate through nfts that used to be in the sidebar before refresh, so that we can retain whether each was selected or not
    for (const oldSidebarNft of sidebarNftsRef.current) {
      const newSidebarNft = newSidebarNfts[oldSidebarNft.id];

      if (newSidebarNft) {
        // nft that used to be in sidebar is still in new sidebar, so copy over isSelected.
        // this ensures user selections are not reset when we refresh the sidebar
        newSidebarNft.isSelected = oldSidebarNft.isSelected;
      } else if (oldSidebarNft.isSelected) {
        // if any previously selected NFTs are no longer in the new sidebar, unstage it
        unstageNfts([oldSidebarNft.id]);
      }
    }

    return convertObjectToArray(newSidebarNfts);
  }, [editModeNftsInCollection, unassignedEditModeNftObject, unstageNfts]);

  // Initialize sidebarNfts
  useEffect(() => {
    // refresh the sidebar nfts with the latest unassigned NFTs, while retaining the current user selections
    const sidebarNftsWithSelection = refreshSidebarNfts();

    // reset the index for sidebar nfts
    for (const [index, editModeNft] of sidebarNftsWithSelection.entries()) {
      editModeNft.index = index;
    }

    setSidebarNfts(sidebarNftsWithSelection);
    const selectedNfts = sidebarNftsWithSelection.filter(sidebarNft => sidebarNft.isSelected);
    stageNfts(selectedNfts);
  }, [refreshSidebarNfts, setSidebarNfts, stageNfts]);

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
