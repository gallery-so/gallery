import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import {
  SidebarTokensState,
  useCollectionEditorActions,
  useSidebarTokensState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';

import { EditModeToken, EditModeTokenChild, StagedCollection } from '../types';
import Directions from '../Directions';
import Sidebar from '../Sidebar/Sidebar';
import { convertObjectToArray } from '../convertObjectToArray';
import StagingArea from './StagingArea';
import EditorMenu from './EditorMenu';
import { parseCollectionLayout } from 'utils/collectionLayout';
import { graphql, useFragment } from 'react-relay';
import { CollectionEditorFragment$key } from '__generated__/CollectionEditorFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { CollectionEditorViewerFragment$key } from '../../../../../__generated__/CollectionEditorViewerFragment.graphql';
import useNotOptimizedForMobileWarning from '../../useNotOptimizedForMobileWarning';
import useConfirmationMessageBeforeClose from '../../useConfirmationMessageBeforeClose';

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
  queryRef: CollectionEditorFragment$key;
  onValidChange: (valid: boolean) => void;
};

// Separated out so we can refresh data as a part of our sync tokens mutation
const collectionEditorViewerFragment = graphql`
  fragment CollectionEditorViewerFragment on Viewer {
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
  }
`;

function CollectionEditor({ queryRef, onValidChange }: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorFragment on Query {
        viewer {
          ... on Viewer {
            ...CollectionEditorViewerFragment
          }
        }

        ...SidebarViewerFragment
      }
    `,
    queryRef
  );

  const viewer = useFragment<CollectionEditorViewerFragment$key>(
    collectionEditorViewerFragment,
    query.viewer
  );

  if (!viewer) {
    throw new Error('CollectionEditor rendered without a Viewer');
  }

  useNotOptimizedForMobileWarning();
  useConfirmationMessageBeforeClose();

  const stagedCollectionState = useStagedCollectionState();
  const sidebarTokens = useSidebarTokensState();

  useEffect(
    function notifyParentWhenCollectionIsValid() {
      const isCollectionValid = Object.keys(stagedCollectionState).length > 0;

      onValidChange(isCollectionValid);
    },
    [stagedCollectionState, onValidChange]
  );

  const { setSidebarTokens, unstageTokens, setStagedCollectionState, setActiveSectionIdState } =
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
        ) as StagedCollection;

        setStagedCollectionState(collectionToStage);
        if (Object.keys(collectionToStage).length > 0) {
          setActiveSectionIdState(Object.keys(collectionToStage)[0]);
        }
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
    collectionBeingEdited,
    setActiveSectionIdState,
    setSidebarTokens,
    setStagedCollectionState,
    tokensInCollection,
    unstageTokens,
  ]);

  const shouldDisplayEditor = Object.keys(stagedCollectionState).length > 0;

  return (
    <StyledOrganizeCollection>
      <StyledSidebarContainer>
        <Sidebar sidebarTokens={sidebarTokens} tokensRef={allNfts} queryRef={query} />
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
