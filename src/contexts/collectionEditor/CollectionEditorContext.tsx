import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { EditModeToken, StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import { UpdateCollectionTokensInput } from '__generated__/useUpdateCollectionTokensMutation.graphql';
import { generate12DigitId } from 'utils/collectionLayout';

type TokenId = string;
export type SidebarTokensState = Record<TokenId, EditModeToken>;
export type StagedItemsState = StagingItem[];
export type TokenSettings = Record<TokenId, boolean>;
export type CollectionMetadataState = Pick<UpdateCollectionTokensInput, 'layout'> & {
  tokenSettings: TokenSettings;
};

type Section = {
  id: any; // TODO change
  items: StagingItem[];
};
export type StagedCollectionState = Section[];

export type CollectionEditorState = {
  sidebarTokens: SidebarTokensState;
  stagedItems: StagedItemsState;
  collectionMetadata: CollectionMetadataState;
  stagedCollection: StagedCollectionState;
};

const DEFAULT_COLLECTION_METADATA = {
  layout: { sections: [], sectionLayout: [{ columns: 3, whitespace: [] }] },
  tokenSettings: {},
};

const CollectionEditorStateContext = createContext<CollectionEditorState>({
  sidebarTokens: {},
  stagedItems: [],
  collectionMetadata: DEFAULT_COLLECTION_METADATA,
  stagedCollection: [],
});

export const useSidebarTokensState = (): SidebarTokensState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.sidebarTokens;
};

export const useStagedItemsState = (): StagedItemsState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.stagedItems;
};

export const useCollectionMetadataState = (): CollectionMetadataState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }

  return context.collectionMetadata;
};

export const useStagedCollectionState = (): StagedCollectionState => {
  const context = useContext(CollectionEditorStateContext);
  if (!context) {
    throw new Error('Attempted to use CollectionEditorStateContext without a provider');
  }
  return context.stagedCollection;
};

type CollectionEditorActions = {
  setSidebarTokens: (tokens: Record<string, EditModeToken>) => void;
  setTokensIsSelected: (tokens: string[], isSelected: boolean) => void;
  stageTokens: (tokens: StagingItem[]) => void;
  unstageTokens: (ids: string[]) => void;
  setStagedCollectionState: (collection: StagedCollectionState) => void;
  handleSortTokens: (event: DragEndEvent) => void;
  reorderTokensWithinSection: (event: DragEndEvent) => void;
  reorderSection: (event: DragEndEvent) => void;
  addSection: () => void;
  incrementColumns: () => void;
  decrementColumns: () => void;
  setColumns: (columns: number) => void;
  setTokenLiveDisplay: (idOrIds: string | string[], active: boolean) => void;
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
  const [stagedItemsState, setStagedItemsState] = useState<StagedItemsState>([]);
  const [collectionMetadataState, setCollectionMetadataState] = useState<CollectionMetadataState>(
    DEFAULT_COLLECTION_METADATA
  );
  const [stagedCollectionState, setStagedCollectionState] = useState<StagedCollectionState>([]);

  // const [collectionLayoutState, setCollectionLayoutState] = useState<CollectionMetadataState>()

  const collectionEditorState = useMemo(
    () => ({
      sidebarTokens: sidebarTokensState,
      stagedItems: stagedItemsState,
      collectionMetadata: collectionMetadataState,
      stagedCollection: stagedCollectionState,
    }),
    [sidebarTokensState, stagedItemsState, collectionMetadataState, stagedCollectionState]
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

  const stageTokens = useCallback((tokens: StagingItem[]) => {
    setStagedItemsState((previous) => [...previous, ...tokens]);
  }, []);

  const unstageTokens = useCallback((ids: string[]) => {
    setStagedItemsState((previous) =>
      previous.filter((stagingItem) => !ids.includes(stagingItem.id))
    );
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

  const handleSortTokens = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStagedItemsState((previous) => {
        const oldIndex = previous.findIndex(({ id }) => id === active.id);
        const newIndex = previous.findIndex(({ id }) => id === over?.id);
        return arrayMove(previous, oldIndex, newIndex);
      });
    }
  }, []);

  const reorderTokensWithinSection = useCallback((event: DragEndEvent, sectionId: string) => {
    const { active, over } = event;
    setStagedCollectionState((previous) => {
      const section = previous[sectionId];
      console.log('section', section);
      const oldIndex = section.findIndex(({ id }) => id === active.id);
      const newIndex = section.findIndex(({ id }) => id === over?.id);
      const updatedSection = arrayMove(section, oldIndex, newIndex);
      return { ...previous, [sectionId]: updatedSection };
    });
  }, []);

  const reorderSection = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setStagedCollectionState((previous) => {
      // swap
      const previousOrder = Object.keys(previous); // previous order of section ids
      console.log({ previousOrder });
      const oldIndex = previousOrder.findIndex((id) => id === active.id);
      const newIndex = previousOrder.findIndex((id) => id === over?.id);
      const newOrder = arrayMove(previousOrder, oldIndex, newIndex);
      console.log({ newOrder });
      const result = newOrder.reduce((acc, sectionId) => {
        console.log('sectionId', sectionId, acc);
        return { ...acc, [sectionId]: previous[sectionId] };
        // acc[sectionId] = 'a';
        // return acc;
      }, {});

      console.log(result);
      return result;
      // return updated.reduce((acc, section) => ({ ...acc, [section.id]: section }), {});
      // return updated;
    });
  }, []);

  const addSection = useCallback(() => {
    setStagedCollectionState((previous) => {
      const newSectionId = generate12DigitId();
      return {
        ...previous,
        [newSectionId]: [],
      };
    });
  }, []);

  const incrementColumns = useCallback(() => {
    setCollectionMetadataState((previous) => {
      const newSectionLayout = [...previous.layout.sectionLayout];
      newSectionLayout[0].columns++;
      return {
        ...previous,
        layout: {
          ...previous.layout,
          sectionLayout: {
            ...previous.layout.sectionLayout,
            columns: previous.layout.sectionLayout[0].columns + 1,
          },
        },
      };
    });
  }, []);

  const decrementColumns = useCallback(() => {
    setCollectionMetadataState((previous) => {
      const newSectionLayout = [...previous.layout.sectionLayout];
      newSectionLayout[0].columns--;
      return {
        ...previous,
        layout: {
          ...previous.layout,
          sectionLayout: {
            ...previous.layout.sectionLayout,
            columns: previous.layout.sectionLayout[0].columns + 1,
          },
        },
      };
    });
  }, []);

  const setColumns = useCallback((columns: number) => {
    setCollectionMetadataState((previous) => {
      const newSectionLayout = [...previous.layout.sectionLayout];
      newSectionLayout[0].columns = columns;
      console.log('newSectionLayout,', newSectionLayout);
      return {
        ...previous,
        layout: {
          ...previous.layout,
          sectionLayout: newSectionLayout,
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
      handleSortTokens,
      reorderTokensWithinSection,
      reorderSection,
      addSection,
      incrementColumns,
      decrementColumns,
      setColumns,
      setTokenLiveDisplay,
      setStagedCollectionState,
    }),
    [
      setSidebarTokens,
      setTokensIsSelected,
      stageTokens,
      unstageTokens,
      handleSortTokens,
      reorderTokensWithinSection,
      reorderSection,
      addSection,
      incrementColumns,
      decrementColumns,
      setColumns,
      setTokenLiveDisplay,
      setStagedCollectionState,
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
