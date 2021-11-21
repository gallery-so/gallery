import { DEFAULT_COLUMNS } from 'constants/layout';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import {
  SidebarNftsState,
  useCollectionEditorActions,
  useSidebarNftsState,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';
import { Nft } from 'types/Nft';
import useUnassignedNfts from 'hooks/api/nfts/useUnassignedNfts';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import Dropdown from 'components/core/Dropdown/Dropdown';
import { isValidColumns } from 'scenes/UserGalleryPage/UserGalleryCollection';
import { EditModeNft } from '../types';
import Directions from '../Directions';
import Sidebar from '../Sidebar/Sidebar';
import { convertObjectToArray } from '../convertObjectToArray';
import StagingArea from './StagingArea';
import ColumnAdjuster from './ColumnAdjuster';

function convertNftsToEditModeNfts(nfts: Nft[], isSelected = false): EditModeNft[] {
  return nfts.map((nft, index) => ({
    index,
    nft,
    id: nft.id,
    isSelected,
  }));
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

  const unassignedNfts = useUnassignedNfts();

  const { collections } = useAuthenticatedGallery();
  const collectionIdBeingEditedRef = useRef<string>(collectionIdBeingEdited ?? '');
  const collectionBeingEdited = useMemo(
    () => collections.find(coll => coll.id === collectionIdBeingEditedRef.current),
    [collections]);
  const nftsFromCollectionBeingEdited = useMemo(() => collectionBeingEdited?.nfts ?? [], [collectionBeingEdited]);

  // Set collection layout if we are editing an existing collection
  const { setColumns } = useCollectionEditorActions();
  const mountRef = useRef(false);
  useEffect(() => {
    if (collectionBeingEdited) {
      const columns = isValidColumns(collectionBeingEdited.layout.columns) ? collectionBeingEdited.layout.columns : DEFAULT_COLUMNS;
      setColumns(columns);
    }

    mountRef.current = true;
  }, [collectionBeingEdited, setColumns]);

  const sidebarNftsRef = useRef<SidebarNftsState>({});
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
    let newSidebarNfts: SidebarNftsState = {};
    // Add nfts in current collection to sidebar
    for (const nft of editModeNftsInCollection) {
      newSidebarNfts[nft.id] = nft;
    }

    // Add unassigned nfts to sidebar
    newSidebarNfts = { ...newSidebarNfts, ...unassignedEditModeNftObject };

    const oldSidebarNftsAsArray = convertObjectToArray(sidebarNftsRef.current);

    if (oldSidebarNftsAsArray.length === 0) {
      return newSidebarNfts;
    }

    // Iterate through nfts that used to be in the sidebar before refresh, so that we can retain whether each was selected or not
    for (const oldSidebarNft of oldSidebarNftsAsArray) {
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

    return newSidebarNfts;
  }, [editModeNftsInCollection, unassignedEditModeNftObject, unstageNfts]);

  // Initialize sidebarNfts
  useEffect(() => {
    // refresh the sidebar nfts with the latest unassigned NFTs, while retaining the current user selections
    const sidebarNftsWithSelection = refreshSidebarNfts();

    setSidebarNfts(sidebarNftsWithSelection);
    const sidebarNftsWithSelectionAsArray = convertObjectToArray(sidebarNftsWithSelection);
    const selectedNfts = sidebarNftsWithSelectionAsArray.filter(sidebarNft => sidebarNft.isSelected);
    stageNfts(selectedNfts);
  }, [refreshSidebarNfts, setSidebarNfts, stageNfts]);

  return (
    <StyledOrganizeCollection>
      <StyledSidebarContainer>
        <Sidebar />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        <StyledMenuContainer>
          <Dropdown mainText="Canvas Settings">
            <ColumnAdjuster/>
          </Dropdown>
        </StyledMenuContainer>
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

const StyledMenuContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 32px;
`;

export default CollectionEditor;
