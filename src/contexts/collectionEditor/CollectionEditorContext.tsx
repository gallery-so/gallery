import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
  EditModeToken,
  StagedCollection,
  StagingItem,
} from 'flows/shared/steps/OrganizeCollection/types';
import { generate12DigitId } from 'utils/collectionLayout';

type TokenId = string;
export type SidebarTokensState = Record<TokenId, EditModeToken>;
export type TokenSettings = Record<TokenId, boolean>;
export type CollectionMetadataState = {
  tokenSettings: TokenSettings;
};

const DEFAULT_COLUMN_SETTING = 3;

export type CollectionEditorState = {
  sidebarTokens: SidebarTokensState;
  collectionMetadata: CollectionMetadataState;
  stagedCollection: StagedCollection;
  activeSectionId: UniqueIdentifier | null;
};

const DEFAULT_COLLECTION_METADATA = {
  tokenSettings: {},
};

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  sidebarTokens: {},
  collectionMetadata: DEFAULT_COLLECTION_METADATA,
  stagedCollection: {},
  activeSectionId: null,
});

export const useSidebarTokensState = (): SidebarTokensState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.sidebarTokens;
};

export const useCollectionMetadataState = (): CollectionMetadataState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.collectionMetadata;
};

export const useStagedCollectionState = (): StagedCollection => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }
  return context.stagedCollection;
};

export const useActiveSectionIdState = (): UniqueIdentifier | null => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }
  return context.activeSectionId;
};

type CollectionEditorActions = {
  setSidebarTokens: (tokens: Record<string, EditModeToken>) => void;
  setTokensIsSelected: (tokens: string[], isSelected: boolean) => void;
  stageTokens: (tokens: StagingItem[]) => void;
  unstageTokens: (ids: string[]) => void;
  setStagedCollectionState: (collection: StagedCollection) => void;
  reorderTokensWithinSection: (event: DragEndEvent, sectionId: UniqueIdentifier) => void;
  reorderSection: (event: DragEndEvent) => void;
  addSection: () => void;
  deleteSection: (sectionId: UniqueIdentifier) => void;
  incrementColumns: (sectionId: UniqueIdentifier) => void;
  decrementColumns: (sectionId: UniqueIdentifier) => void;
  setTokenLiveDisplay: (idOrIds: string | string[], active: boolean) => void;
  setActiveSectionIdState: (id: string) => void;
};

const CollectionEditorActionsContext = createContext<CollectionEditorActions | undefined>(
  undefined
);

export const useCollectionEditorActions = (): CollectionEditorActions => {
  const context = useContext(CollectionEditorActionsContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorActionsContext without a provider');
  }

  return context;
};

type Props = { children: ReactNode };

const CollectionEditorProvider = memo(({ children }: Props) => {
  const [sidebarTokensState, setSidebarTokensState] = useState<SidebarTokensState>({});
  const [collectionMetadataState, setCollectionMetadataState] = useState<CollectionMetadataState>(
    DEFAULT_COLLECTION_METADATA
  );
  const [stagedCollectionState, setStagedCollectionState] = useState<StagedCollection>({});
  const [activeSectionIdState, setActiveSectionIdState] = useState<string | null>(null);

  const collectionEditorState = useMemo(
    () => ({
      sidebarTokens: sidebarTokensState,
      collectionMetadata: collectionMetadataState,
      stagedCollection: stagedCollectionState,
      activeSectionId: activeSectionIdState,
    }),
    [sidebarTokensState, collectionMetadataState, stagedCollectionState, activeSectionIdState]
  );

  const setSidebarTokens = useCallback((tokens: SidebarTokensState) => {
    setSidebarTokensState(tokens);
  }, []);

  const setTokensIsSelected = useCallback((tokenIds: string[], isSelected: boolean) => {
    setSidebarTokensState((previous) => {
      const next = { ...previous };
      for (const tokenId of tokenIds) {
        const selectedNft = next[tokenId];
        if (selectedNft) {
          next[tokenId] = { ...selectedNft, isSelected };
        }
      }

      return next;
    });
  }, []);

  const addTokensToSection = useCallback((tokens: StagingItem[], sectionId: string) => {
    setStagedCollectionState((previous) => {
      // If there are no sections in the collection, create one.
      if (!Object.keys(previous).length) {
        const sectionId = generate12DigitId();
        setActiveSectionIdState(sectionId);

        return { ...previous, [sectionId]: { columns: DEFAULT_COLUMN_SETTING, items: tokens } };
      }

      const section = previous[sectionId];
      if (!section) {
        return previous;
      }
      return { ...previous, [sectionId]: { ...section, items: [...section.items, ...tokens] } };
    });
  }, []);

  const stageTokens = useCallback(
    (tokens: StagingItem[]) => {
      addTokensToSection(tokens, activeSectionIdState || '');
    },
    [activeSectionIdState, addTokensToSection]
  );

  const unstageTokens = useCallback((ids: string[]) => {
    setStagedCollectionState((previous) => {
      const next = { ...previous };

      // For each section, filter out the tokens that are being removed.
      Object.keys(next).forEach((sectionId) => {
        next[sectionId].items = next[sectionId].items.filter(
          (stagingItem) => !ids.includes(stagingItem.id)
        );
      });

      return next;
    });

    // remove any related token settings
    setCollectionMetadataState((previous) => {
      const newTokenSettings: TokenSettings = { ...previous.tokenSettings };
      for (const id of ids) {
        delete newTokenSettings[id];
      }
      return {
        ...previous,
        tokenSettings: newTokenSettings,
      };
    });
  }, []);

  const reorderTokensWithinSection = useCallback(
    (event: DragEndEvent, sectionId: UniqueIdentifier) => {
      const { active, over } = event;
      setStagedCollectionState((previous) => {
        const section = previous[sectionId];
        const sectionItems = section.items;

        const oldIndex = sectionItems.findIndex(({ id }) => id === active.id);
        const newIndex = sectionItems.findIndex(({ id }) => id === over?.id);
        const updatedSectionItems = arrayMove(sectionItems, oldIndex, newIndex);
        return { ...previous, [sectionId]: { ...section, items: updatedSectionItems } };
      });
    },
    []
  );

  const reorderSection = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setStagedCollectionState((previous) => {
      const previousOrder = Object.keys(previous); // get previous order as list of section ids

      const oldIndex = previousOrder.findIndex((id) => id === active.id);
      const newIndex = previousOrder.findIndex((id) => id === over?.id);
      const newOrder = arrayMove(previousOrder, oldIndex, newIndex);

      const result = newOrder.reduce((acc, sectionId) => {
        return { ...acc, [sectionId]: previous[sectionId] };
      }, {});

      return result;
    });
  }, []);

  const addSection = useCallback(() => {
    const newSectionId = generate12DigitId();

    setStagedCollectionState((previous) => {
      const previousOrder = Object.keys(previous); // get previous order as list of section ids
      const activeIndex = previousOrder.findIndex((id) => id === activeSectionIdState);
      return previousOrder.reduce((acc, sectionId, index) => {
        if (index === activeIndex) {
          return {
            ...acc,
            [sectionId]: previous[sectionId],
            [newSectionId]: { columns: DEFAULT_COLUMN_SETTING, items: [] },
          };
        }
        return { ...acc, [sectionId]: previous[sectionId] };
      }, {});
    });
    setActiveSectionIdState(newSectionId);
  }, [activeSectionIdState]);

  const deleteSection = useCallback((sectionId: UniqueIdentifier) => {
    setStagedCollectionState((previous) => {
      const next = { ...previous };
      delete next[sectionId];
      return next;
    });
  }, []);

  const incrementColumns = useCallback((sectionId: UniqueIdentifier) => {
    setStagedCollectionState((previous) => {
      return {
        ...previous,
        [sectionId]: {
          ...previous[sectionId],
          columns: previous[sectionId].columns + 1,
        },
      };
    });
  }, []);

  const decrementColumns = useCallback((sectionId: UniqueIdentifier) => {
    setStagedCollectionState((previous) => {
      return {
        ...previous,
        [sectionId]: {
          ...previous[sectionId],
          columns: previous[sectionId].columns - 1,
        },
      };
    });
  }, []);

  const setTokenLiveDisplay: CollectionEditorActions['setTokenLiveDisplay'] = useCallback(
    (idOrIds, active) => {
      if (typeof idOrIds === 'string') {
        setCollectionMetadataState((previous) => ({
          ...previous,
          tokenSettings: {
            ...previous.tokenSettings,
            [idOrIds]: active,
          },
        }));
      }

      if (Array.isArray(idOrIds)) {
        setCollectionMetadataState((previous) => {
          const newTokenSettings: TokenSettings = {};
          for (const id of idOrIds) {
            newTokenSettings[id] = active;
          }
          return {
            ...previous,
            tokenSettings: {
              ...previous.tokenSettings,
              ...newTokenSettings,
            },
          };
        });
      }
    },
    []
  );

  const collectionEditorActions: CollectionEditorActions = useMemo(
    () => ({
      setSidebarTokens,
      setTokensIsSelected,
      stageTokens,
      unstageTokens,
      reorderTokensWithinSection,
      reorderSection,
      addSection,
      deleteSection,
      incrementColumns,
      decrementColumns,
      setTokenLiveDisplay,
      setStagedCollectionState,
      setActiveSectionIdState,
    }),
    [
      setSidebarTokens,
      setTokensIsSelected,
      stageTokens,
      unstageTokens,
      reorderTokensWithinSection,
      reorderSection,
      addSection,
      deleteSection,
      incrementColumns,
      decrementColumns,
      setTokenLiveDisplay,
      setStagedCollectionState,
      setActiveSectionIdState,
    ]
  );

  return (
    <CollectionEditorStateContext.Provider value={collectionEditorState}>
      <CollectionEditorActionsContext.Provider value={collectionEditorActions}>
        {children}
      </CollectionEditorActionsContext.Provider>
    </CollectionEditorStateContext.Provider>
  );
});

export default CollectionEditorProvider;
