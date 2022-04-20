import { DEFAULT_COLUMNS } from 'constants/layout';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import {
  SidebarNftsState,
  useCollectionEditorActions,
  useSidebarNftsState,
  useStagedItemsState,
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
import { insertWhitespaceBlocks } from 'utils/collectionLayout';

import useKeyDown from 'hooks/useKeyDown';
import ConfirmLeaveModal from 'scenes/Modals/ConfirmLeaveModal';
import { useModal } from 'contexts/modal/ModalContext';

function convertNftsToEditModeNfts(nfts: Nft[], isSelected = false): EditModeNft[] {
  return nfts.map((nft, index) => ({
    index,
    nft,
    id: nft.id,
    isSelected,
  }));
}

function CollectionEditor() {
  const escapePress = useKeyDown('Escape');
  const { showModal } = useModal();

  useEffect(() => {
    if (escapePress) {
      showModal(<ConfirmLeaveModal />);
    }
  }, [escapePress]);

  const stagedNfts = useStagedItemsState();
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

  const { collections } = useAuthenticatedGallery();
  const collectionIdBeingEditedRef = useRef<string>(collectionIdBeingEdited ?? '');
  const collectionBeingEdited = useMemo(
    () => collections.find((coll) => coll.id === collectionIdBeingEditedRef.current),
    [collections]
  );
  const nftsInCollection = useMemo(
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

  const allNfts = useAllNfts();

  // stabilize `allNfts` returned from `useAllNfts`, since SWR middleware can make it referentially unstable
  const allNftsCacheKey = useMemo(
    () => allNfts.reduce((prev, curr) => `${prev}-${curr.last_updated}`, ''),
    [allNfts]
  );

  const whitespaceList = useMemo(
    () => collectionBeingEdited?.layout?.whitespace ?? [],
    [collectionBeingEdited]
  );

  // decorates NFTs returned from useAllNfts with additional fields for the purpose of editing / dnd
  const allEditModeNfts: SidebarNftsState = useMemo(() => {
    const editModeNfts = convertNftsToEditModeNfts(allNfts);
    return Object.fromEntries(editModeNfts.map((nft) => [nft.id, nft]));
    // use `allNftsCacheKey` as more stable memo dep. see comment where variable is defined.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNftsCacheKey]);

  // Either initialize sidebar NFTs or refresh sidebar NFTs
  // while retaining the current user selections
  useEffect(() => {
    // Handle initializing sidebar with NFTs
    const preRefreshNftsAsArray = convertObjectToArray(sidebarNftsRef.current);
    const initialRender = preRefreshNftsAsArray.length === 0;
    if (initialRender) {
      const nftsToStage = convertNftsToEditModeNfts(nftsInCollection, true);
      const nftsToStageWithWhitespace = insertWhitespaceBlocks(nftsToStage, whitespaceList);
      stageNfts(nftsToStageWithWhitespace);
    }

    // Mark NFTs as selected if they're in the collection being edited
    const newSidebarNfts: SidebarNftsState = allEditModeNfts;
    nftsInCollection.forEach((nft) => {
      const preRefreshNft = newSidebarNfts[nft.id];
      if (preRefreshNft) {
        preRefreshNft.isSelected = true;
      }
    });

    const nftsToUnstage = [];
    // iterate through old sidebar nfts, so that we can retain the selection state
    for (const preRefreshNft of preRefreshNftsAsArray) {
      const newSidebarNft = newSidebarNfts[preRefreshNft.id];

      if (newSidebarNft) {
        // nft that used to be in sidebar is still in new sidebar, so copy over isSelected.
        // this ensures user selections are not reset when we refresh the sidebar
        newSidebarNft.isSelected = preRefreshNft.isSelected;
      } else if (preRefreshNft.isSelected) {
        // if any previously selected NFTs are no longer in the new sidebar, unstage it
        nftsToUnstage.push(preRefreshNft.id);
      }
    }

    if (nftsToUnstage.length) {
      unstageNfts(nftsToUnstage);
    }

    setSidebarNfts(newSidebarNfts);
  }, [allEditModeNfts, nftsInCollection, setSidebarNfts, stageNfts, unstageNfts, whitespaceList]);

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
