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
import { isValidColumns } from 'scenes/UserGalleryPage/UserGalleryCollection';
import { EditModeNftChild, EditModeNft } from '../types';
import Directions from '../Directions';
import Sidebar from '../Sidebar/Sidebar';
import { convertObjectToArray } from '../convertObjectToArray';
import StagingArea from './StagingArea';
import EditorMenu from './EditorMenu';
import { insertWhitespaceBlocks } from 'utils/collectionLayout';
import { graphql, useFragment } from 'react-relay';
import { CollectionEditorFragment$key } from '__generated__/CollectionEditorFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import useKeyDown from 'hooks/useKeyDown';
import { ConfirmLeaveModal } from 'scenes/Modals/ConfirmLeaveModal';
import { useModalActions } from 'contexts/modal/ModalContext';

function convertNftsToEditModeNfts(nfts: EditModeNftChild[], isSelected = false): EditModeNft[] {
  return nfts.map((nft, index) => ({
    index,
    nft,
    id: nft.dbid,
    isSelected,
  }));
}

type Props = {
  viewerRef: CollectionEditorFragment$key;
};

function CollectionEditor({ viewerRef }: Props) {
  const viewer = useFragment(
    graphql`
      fragment CollectionEditorFragment on Viewer {
        user @required(action: THROW) {
          galleries @required(action: THROW) {
            collections @required(action: THROW) {
              dbid
              nfts {
                nft {
                  dbid @required(action: THROW)
                  name @required(action: THROW)
                  lastUpdated @required(action: THROW)
                  openseaId @required(action: THROW)
                }
              }
              layout {
                columns
                whitespace
              }
            }
          }
          wallets @required(action: THROW) {
            nfts @required(action: THROW) {
              dbid @required(action: THROW)
              name @required(action: THROW)
              lastUpdated @required(action: THROW)
              openseaId @required(action: THROW)
              ...SidebarFragment
              ...StagingAreaFragment
            }
          }
          ...ConfirmLeaveModalFragment
        }
      }
    `,
    viewerRef
  );

  const stagedNfts = useStagedItemsState();
  const sidebarNfts = useSidebarNftsState();
  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(stagedNfts.length > 0);

    return () => {
      setNextEnabled(true);
    };
  }, [setNextEnabled, stagedNfts]);

  const { setSidebarNfts, stageNfts, unstageNfts } = useCollectionEditorActions();
  const { collectionIdBeingEdited } = useCollectionWizardState();
  const collectionIdBeingEditedRef = useRef<string>(collectionIdBeingEdited ?? '');

  const gallery = viewer.user.galleries[0];

  if (!gallery) {
    throw new Error(`CollectionEditor expected a gallery`);
  }

  const { collections } = gallery;

  const nonNullCollections = removeNullValues(collections);

  const collectionBeingEdited = useMemo(
    () => nonNullCollections.find((coll) => coll.dbid === collectionIdBeingEditedRef.current),
    [nonNullCollections]
  );

  const nftsInCollection = useMemo(
    () => removeNullValues(collectionBeingEdited?.nfts?.flatMap((nft) => nft?.nft)) ?? [],
    [collectionBeingEdited]
  );

  // Set collection layout if we are editing an existing collection
  const { setColumns } = useCollectionEditorActions();
  const mountRef = useRef(false);

  useEffect(() => {
    if (collectionBeingEdited) {
      const currentCollectionColumns = collectionBeingEdited.layout?.columns ?? 0;
      const columns = isValidColumns(currentCollectionColumns)
        ? currentCollectionColumns
        : DEFAULT_COLUMNS;
      setColumns(columns);
    }

    mountRef.current = true;
  }, [collectionBeingEdited, setColumns]);

  const sidebarNftsRef = useRef<SidebarNftsState>({});
  useEffect(() => {
    sidebarNftsRef.current = sidebarNfts;
  }, [sidebarNfts]);

  const allNfts = useMemo(() => {
    return removeNullValues(viewer.user.wallets.flatMap((wallet) => wallet?.nfts));
  }, [viewer.user.wallets]);

  // stabilize `allNfts` since SWR middleware can make it referentially unstable
  const allNftsCacheKey = useMemo(
    () => allNfts.reduce((prev, curr) => `${prev}-${curr.lastUpdated}`, ''),
    [allNfts]
  );

  const whitespaceList = useMemo(
    () => removeNullValues(collectionBeingEdited?.layout?.whitespace) ?? [],
    [collectionBeingEdited]
  );

  // decorates NFTs returned with additional fields for the purpose of editing / dnd
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
      const preRefreshNft = newSidebarNfts[nft.dbid];
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

  const { showModal } = useModalActions();
  const user = viewer.user;

  useKeyDown('Escape', () => {
    showModal({ content: <ConfirmLeaveModal userRef={user} /> });
  });

  return (
    <StyledOrganizeCollection>
      <StyledSidebarContainer>
        <Sidebar sidebarNfts={sidebarNfts} nftsRef={allNfts} />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        {shouldDisplayEditor ? (
          <>
            <StagingArea stagedItems={stagedNfts} nftsRef={allNfts} />
            <EditorMenu />
          </>
        ) : (
          <Directions />
        )}
      </StyledEditorContainer>
    </StyledOrganizeCollection>
  );
}

const SIDEBAR_WIDTH = 250;

const StyledOrganizeCollection = styled.div`
  display: flex;
`;

const StyledSidebarContainer = styled.div`
  width: ${SIDEBAR_WIDTH}px;
`;

const StyledEditorContainer = styled.div`
  display: flex;
  width: calc(100vw - ${SIDEBAR_WIDTH}px);
`;

export default CollectionEditor;
