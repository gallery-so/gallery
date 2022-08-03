import { DEFAULT_COLUMNS, isValidColumns } from 'constants/layout';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import {
  SidebarTokensState,
  useCollectionEditorActions,
  useSidebarTokensState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';

import { EditModeTokenChild, EditModeToken } from '../types';
import Directions from '../Directions';
import Sidebar from '../Sidebar/Sidebar';
import { convertObjectToArray } from '../convertObjectToArray';
import StagingArea from './StagingArea';
import EditorMenu from './EditorMenu';
import { parseCollectionLayout } from 'utils/collectionLayout';
import { graphql, useFragment } from 'react-relay';
import { CollectionEditorFragment$key } from '__generated__/CollectionEditorFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';

function convertNftsToEditModeTokens(
  tokens: EditModeTokenChild[],
  isSelected = false
): EditModeToken[] {
  return tokens.map((token, index) => ({
    index,
    token,
    id: token.dbid,
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
              tokens {
                token @required(action: THROW) {
                  dbid @required(action: THROW)
                  name @required(action: THROW)
                  lastUpdated @required(action: THROW)
                }
                tokenSettings {
                  renderLive
                }
              }
              layout {
                sections
                sectionLayout {
                  columns
                  whitespace
                }
              }
            }
          }
          tokens {
            dbid @required(action: THROW)
            name @required(action: THROW)
            lastUpdated @required(action: THROW)
            ...SidebarFragment
            ...StagingAreaFragment
          }
        }
        ...EditorMenuFragment
        ...SidebarViewerFragment
      }
    `,
    viewerRef
  );

  const stagedCollectionState = useStagedCollectionState();
  const sidebarTokens = useSidebarTokensState();
  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(Object.keys(stagedCollectionState).length > 0);

    return () => {
      setNextEnabled(true);
    };
  }, [setNextEnabled, stagedCollectionState]);

  const { setSidebarTokens, stageTokens, unstageTokens, setStagedCollectionState } =
    useCollectionEditorActions();
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

  const tokensInCollection = useMemo(
    () => removeNullValues(collectionBeingEdited?.tokens?.flatMap((token) => token?.token)) ?? [],
    [collectionBeingEdited]
  );

  // Load in state from server if we're editing an existing collection
  const { setTokenLiveDisplay } = useCollectionEditorActions();
  const mountRef = useRef(false);

  useEffect(() => {
    if (collectionBeingEdited) {
      // handle live render setting
      const tokensInCollection = collectionBeingEdited.tokens ?? [];
      const tokenIdsWithLiveDisplay = removeNullValues(tokensInCollection)
        .filter((token) => token.tokenSettings?.renderLive)
        .map((token) => token.token.dbid);
      setTokenLiveDisplay(tokenIdsWithLiveDisplay, true);
    }

    mountRef.current = true;
  }, [collectionBeingEdited, setTokenLiveDisplay]);

  const sidebarTokensRef = useRef<SidebarTokensState>({});
  useEffect(() => {
    sidebarTokensRef.current = sidebarTokens;
  }, [sidebarTokens]);

  const allNfts = useMemo(() => {
    return removeNullValues(viewer.user.tokens ?? []);
  }, [viewer.user.tokens]);

  // stabilize `allNfts` since SWR middleware can make it referentially unstable
  const allNftsCacheKey = useMemo(
    () => allNfts.reduce((prev, curr) => `${prev}-${curr.lastUpdated}`, ''),
    [allNfts]
  );

  // decorates NFTs returned with additional fields for the purpose of editing / dnd
  const allEditModeTokens: SidebarTokensState = useMemo(() => {
    const EditModeTokens = convertNftsToEditModeTokens(allNfts);
    return Object.fromEntries(EditModeTokens.map((token) => [token.id, token]));
    // use `allNftsCacheKey` as more stable memo dep. see comment where variable is defined.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNftsCacheKey]);

  // Either initialize sidebar NFTs or refresh sidebar NFTs
  // while retaining the current user selections
  useEffect(() => {
    // Handle initializing sidebar with NFTs
    const preRefreshNftsAsArray = convertObjectToArray(sidebarTokensRef.current);
    const initialRender = preRefreshNftsAsArray.length === 0;
    if (initialRender) {
      const tokensToStage = convertNftsToEditModeTokens(tokensInCollection, true);
      if (!collectionBeingEdited) {
        setStagedCollectionState({});
      } else {
        const collectionToStage = parseCollectionLayout(
          tokensToStage,
          collectionBeingEdited?.layout
        );

        setStagedCollectionState(collectionToStage);
      }
    }

    // Mark NFTs as selected if they're in the collection being edited
    const newSidebarTokens: SidebarTokensState = allEditModeTokens;
    tokensInCollection.forEach((token) => {
      const preRefreshNft = newSidebarTokens[token.dbid];
      if (preRefreshNft) {
        preRefreshNft.isSelected = true;
      }
    });

    const tokensToUnstage = [];
    // iterate through old sidebar tokens, so that we can retain the selection state
    for (const preRefreshNft of preRefreshNftsAsArray) {
      const newSidebarNft = newSidebarTokens[preRefreshNft.id];

      if (newSidebarNft) {
        // token that used to be in sidebar is still in new sidebar, so copy over isSelected.
        // this ensures user selections are not reset when we refresh the sidebar
        newSidebarNft.isSelected = preRefreshNft.isSelected;
      } else if (preRefreshNft.isSelected) {
        // if any previously selected NFTs are no longer in the new sidebar, unstage it
        tokensToUnstage.push(preRefreshNft.id);
      }
    }

    if (tokensToUnstage.length) {
      unstageTokens(tokensToUnstage);
    }

    setSidebarTokens(newSidebarTokens);
  }, [
    allEditModeTokens,
    tokensInCollection,
    setSidebarTokens,
    stageTokens,
    unstageTokens,
    collectionBeingEdited,
    setStagedCollectionState,
  ]);

  useEffect(() => {}, [stagedCollectionState]);
  const shouldDisplayEditor = Object.keys(stagedCollectionState).length > 0;

  return (
    <StyledOrganizeCollection>
      <StyledSidebarContainer>
        <Sidebar sidebarTokens={sidebarTokens} tokensRef={allNfts} viewerRef={viewer} />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        {shouldDisplayEditor ? (
          <>
            <StagingArea tokensRef={allNfts} />
            <EditorMenu viewerRef={viewer} />
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
