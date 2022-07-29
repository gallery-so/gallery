import { DEFAULT_COLUMNS, isValidColumns } from 'constants/layout';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import {
  SidebarTokensState,
  useCollectionEditorActions,
  useSidebarTokensState,
  useStagedItemsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';

import { EditModeTokenChild, EditModeToken } from '../types';
import Directions from '../Directions';
import Sidebar from '../Sidebar/Sidebar';
import { convertObjectToArray } from '../convertObjectToArray';
import StagingArea from './StagingArea';
import EditorMenu from './EditorMenu';
import { generate12DigitId, insertWhitespaceBlocks } from 'utils/collectionLayout';
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

// Combines the list of tokens in the collection and the collection layout settings to create
// an object that represents the full structure of the collection layout with sections and whitespace blocks.
function parseCollectionLayout(tokens: EditModeTokenChild[], collectionLayout) {
  console.log({ collectionLayout });
  // loop through sections
  // for each section, use section layout to add tokens and whitespace blocks
  // const collection = [];
  const parsedCollection = collectionLayout.sections.reduce(
    (allSections, sectionStartIndex: number, index: number) => {
      const sectionEndIndex = collectionLayout.sections[index + 1] - 1 || tokens.length;
      const section = tokens.slice(sectionStartIndex, sectionEndIndex);
      const sectionWithWhitespace = insertWhitespaceBlocks(
        section,
        collectionLayout.sectionLayout[index].whitespace
      );
      const sectionId = generate12DigitId();
      allSections[sectionId] = sectionWithWhitespace;
      return allSections;
    },
    {}
  );
  console.log('parsedCollection', parsedCollection);
  return parsedCollection;
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

  const stagedNfts = useStagedItemsState();
  const sidebarTokens = useSidebarTokensState();
  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(stagedNfts.length > 0);

    return () => {
      setNextEnabled(true);
    };
  }, [setNextEnabled, stagedNfts]);

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
  const { setColumns, setTokenLiveDisplay } = useCollectionEditorActions();
  const mountRef = useRef(false);

  useEffect(() => {
    if (collectionBeingEdited) {
      // handle column setting
      const currentCollectionColumns =
        collectionBeingEdited.layout?.sectionLayout?.[0].columns ?? 0;
      const columns = isValidColumns(currentCollectionColumns)
        ? currentCollectionColumns
        : DEFAULT_COLUMNS;
      console.log('columns,', columns);
      setColumns(columns);

      // handle live render setting
      const tokensInCollection = collectionBeingEdited.tokens ?? [];
      const tokenIdsWithLiveDisplay = removeNullValues(tokensInCollection)
        .filter((token) => token.tokenSettings?.renderLive)
        .map((token) => token.token.dbid);
      setTokenLiveDisplay(tokenIdsWithLiveDisplay, true);
    }

    mountRef.current = true;
  }, [collectionBeingEdited, setColumns, setTokenLiveDisplay]);

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

  const whitespaceList = useMemo(
    () => removeNullValues(collectionBeingEdited?.layout?.sectionLayout[0]?.whitespace) ?? [],
    [collectionBeingEdited]
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
      console.log(tokensToStage, collectionBeingEdited.layout);
      const collectionToStage = parseCollectionLayout(tokensToStage, collectionBeingEdited.layout);
      const tokensToStageWithWhitespace = insertWhitespaceBlocks(tokensToStage, whitespaceList);
      stageTokens(tokensToStageWithWhitespace);
      console.log('staging', collectionToStage);
      setStagedCollectionState(collectionToStage);
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
    whitespaceList,
  ]);

  const shouldDisplayEditor = stagedNfts.length > 0;

  return (
    <StyledOrganizeCollection>
      <StyledSidebarContainer>
        <Sidebar sidebarTokens={sidebarTokens} tokensRef={allNfts} viewerRef={viewer} />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        {shouldDisplayEditor ? (
          <>
            <StagingArea stagedItems={stagedNfts} tokensRef={allNfts} />
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
