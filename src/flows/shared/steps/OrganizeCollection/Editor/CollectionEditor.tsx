import { DEFAULT_COLUMNS } from 'constants/layout';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import { isValidColumns } from 'scenes/UserGalleryPage/UserGalleryCollection';
import { EditModeNft } from '../types';
import Directions from '../Directions';
import Sidebar from '../Sidebar/Sidebar';
import { convertObjectToArray } from '../convertObjectToArray';
import StagingArea from './StagingArea';
import EditorMenu from './EditorMenu';
import useAllNfts from 'hooks/api/nfts/useAllNfts';

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

  const allNfts = useAllNfts();

  const { collections } = useAuthenticatedGallery();
  const collectionIdBeingEditedRef = useRef<string>(collectionIdBeingEdited ?? '');
  const collectionBeingEdited = useMemo(
    () => collections.find((coll) => coll.id === collectionIdBeingEditedRef.current),
    [collections]
  );
  const nftsFromCollectionBeingEdited = useMemo(
    () => collectionBeingEdited?.nfts ?? [],
    [collectionBeingEdited]
  );

  // Set collection layout if we are editing an existing collection
  const { setColumns } = useCollectionEditorActions();
  const mountRef = useRef(false);
  useEffect(() => {
    if (collectionBeingEdited) {
      const columns = isValidColumns(collectionBeingEdited.layout.columns)
        ? collectionBeingEdited.layout.columns
        : DEFAULT_COLUMNS;
      setColumns(columns);
    }

    mountRef.current = true;
  }, [collectionBeingEdited, setColumns]);

  const sidebarNftsRef = useRef<SidebarNftsState>({});
  useEffect(() => {
    sidebarNftsRef.current = sidebarNfts;
  }, [sidebarNfts]);

  // decorates NFTs returned from useAllNfts with additional fields for the purpose of editing / dnd
  const allEditModeNfts: SidebarNftsState = useMemo(() => {
    const editModeNfts = convertNftsToEditModeNfts(allNfts);
    return Object.fromEntries(editModeNfts.map((nft) => [nft.id, nft]));
  }, [allNfts]);

  const refreshSidebarNfts = useCallback(() => {
    // Initialize new sidebar nfts
    const newSidebarNfts: SidebarNftsState = allEditModeNfts;

    // select all the nfts that are in the collection being edited
    nftsFromCollectionBeingEdited.forEach((nft) => {
      newSidebarNfts[nft.id].isSelected = true;
    });

    const oldSidebarNftsAsArray = convertObjectToArray(sidebarNftsRef.current);

    if (oldSidebarNftsAsArray.length === 0) {
      return newSidebarNfts;
    }

    // iterate through old sidebar nfts, so that we can retain the selection state
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
  }, [allEditModeNfts, nftsFromCollectionBeingEdited, unstageNfts]);

  // Initialize sidebarNfts
  useEffect(() => {
    // refresh the sidebar nfts with the latest NFTs, while retaining the current user selections
    const sidebarNftsWithSelection = refreshSidebarNfts();

    setSidebarNfts(sidebarNftsWithSelection);
    const sidebarNftsWithSelectionAsArray = convertObjectToArray(sidebarNftsWithSelection);
    const selectedNfts = sidebarNftsWithSelectionAsArray.filter(
      (sidebarNft) => sidebarNft.isSelected
    );
    stageNfts(selectedNfts);
  }, [refreshSidebarNfts, setSidebarNfts, stageNfts]);

  const shouldDisplayEditor = stagedNfts.length > 0;

  return (
    <StyledOrganizeCollection>
      <StyledSidebarContainer>
        <Sidebar />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        {shouldDisplayEditor ? (
          <>
            <EditorMenu />
            <StagingArea />
          </>
        ) : (
          <Directions />
        )}
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
