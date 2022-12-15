import React, { useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import { convertObjectToArray } from '~/components/GalleryEditor/CollectionEditor/convertObjectToArray';
import {
  EditModeToken,
  EditModeTokenChild,
  StagedCollection,
} from '~/components/GalleryEditor/CollectionEditor/types';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import useConfirmationMessageBeforeClose from '~/components/ManageGallery/useConfirmationMessageBeforeClose';
import useNotOptimizedForMobileWarning from '~/components/ManageGallery/useNotOptimizedForMobileWarning';
import {
  SidebarTokensState,
  useCollectionEditorActions,
  useSidebarTokensState,
  useStagedCollectionState,
} from '~/contexts/collectionEditor/CollectionEditorContext';
import { CollectionEditorNewFragment$key } from '~/generated/CollectionEditorNewFragment.graphql';
import { CollectionEditorViewerNewFragment$key } from '~/generated/CollectionEditorViewerNewFragment.graphql';
import { parseCollectionLayoutGraphql } from '~/utils/collectionLayout';
import { removeNullValues } from '~/utils/removeNullValues';

import StagingArea from './StagingArea';
import useCheckUnsavedChanges from './useCheckUnsavedChanges';

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
  hasUnsavedChanges: boolean;
  queryRef: CollectionEditorNewFragment$key;
  onValidChange: (valid: boolean) => void;
  onHasUnsavedChange: (hasUnsavedChanges: boolean) => void;
};

// Separated out so we can refresh data as a part of our sync tokens mutation
const collectionEditorViewerFragment = graphql`
  fragment CollectionEditorViewerNewFragment on Viewer {
    user @required(action: THROW) {
      galleries @required(action: THROW) {
        collections @required(action: THROW) {
          dbid
          tokens {
            token @required(action: THROW) {
              dbid @required(action: THROW)
              lastUpdated @required(action: THROW)

              # Escape hatch for data processing util files
              # CollectionEditor could use a refactor
              # eslint-disable-next-line relay/unused-fields
              name @required(action: THROW)
              # Escape hatch for data processing util files
              # CollectionEditor could use a refactor
              # eslint-disable-next-line relay/unused-fields
              isSpamByProvider
              # Escape hatch for data processing util files
              # CollectionEditor could use a refactor
              # eslint-disable-next-line relay/unused-fields
              isSpamByUser
            }
            tokenSettings {
              renderLive
            }
          }
          layout {
            ...collectionLayoutParseFragment
          }
        }
      }
      tokens {
        dbid @required(action: THROW)
        lastUpdated @required(action: THROW)
        ...StagingAreaNewFragment

        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        name @required(action: THROW)
        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        isSpamByProvider
        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        isSpamByUser
      }
    }
  }
`;

export function CollectionEditor({
  queryRef,
  onValidChange,
  onHasUnsavedChange,
  hasUnsavedChanges,
}: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorNewFragment on Query {
        viewer {
          ... on Viewer {
            ...CollectionEditorViewerNewFragment
          }
        }
      }
    `,
    queryRef
  );

  const viewer = useFragment<CollectionEditorViewerNewFragment$key>(
    collectionEditorViewerFragment,
    query.viewer
  );

  if (!viewer) {
    throw new Error('CollectionEditor rendered without a Viewer');
  }

  useNotOptimizedForMobileWarning();
  useConfirmationMessageBeforeClose(hasUnsavedChanges);
  useCheckUnsavedChanges(onHasUnsavedChange);

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
  const { collectionIdBeingEdited } = useGalleryEditorContext();
  console.log('Collection ID', collectionIdBeingEdited);
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
    console.log(sidebarTokensRef.current);
    const initialRender = preRefreshNftsAsArray.length === 0;
    if (initialRender) {
      const tokensToStage = convertNftsToEditModeTokens(tokensInCollection, true);
      if (!collectionBeingEdited) {
        setStagedCollectionState({});
      } else {
        if (collectionBeingEdited.layout) {
          const collectionToStage = parseCollectionLayoutGraphql(
            tokensToStage,
            collectionBeingEdited.layout
          ) as StagedCollection;

          setStagedCollectionState(collectionToStage);

          if (Object.keys(collectionToStage).length > 0) {
            setActiveSectionIdState(Object.keys(collectionToStage)[0]);
          }
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

  return <StagingArea tokensRef={allNfts} />;
}
