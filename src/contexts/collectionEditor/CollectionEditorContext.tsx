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
  columns: number;
  items: StagingItem[];
};
export type StagedCollectionState = Record<string, Section>;

export type CollectionEditorState = {
  sidebarTokens: SidebarTokensState;
  stagedItems: StagedItemsState;
  collectionMetadata: CollectionMetadataState;
  stagedCollection: StagedCollectionState;
  activeSectionId: string | null;
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
  activeSectionId: null,
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

export const useActiveSectionIdState = (): string | null => {
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
  stageTokensNew: (tokens: StagingItem[]) => void;
  unstageTokensNew: (ids: string[]) => void;
  unstageTokens: (ids: string[]) => void;
  setStagedCollectionState: (collection: StagedCollectionState) => void;
  // handleSortTokens: (event: DragEndEvent) => void;
  reorderTokensWithinSection: (event: DragEndEvent, sectionId: string) => void;
  moveTokenToSection: (event: DragEndEvent, oldSectionId: string, newSectionId: string) => void;
  reorderSection: (event: DragEndEvent) => void;
  addSection: () => void;
  incrementColumns: (sectionId: string) => void;
  decrementColumns: (sectionId: string) => void;
  setColumns: (columns: number) => void;
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
  const [stagedItemsState, setStagedItemsState] = useState<StagedItemsState>([]);
  const [collectionMetadataState, setCollectionMetadataState] = useState<CollectionMetadataState>(
    DEFAULT_COLLECTION_METADATA
  );
  const [stagedCollectionState, setStagedCollectionState] = useState<StagedCollectionState>({});
  const [activeSectionIdState, setActiveSectionIdState] = useState<string | null>(null);

  // const [collectionLayoutState, setCollectionLayoutState] = useState<CollectionMetadataState>()

  const collectionEditorState = useMemo(
    () => ({
      sidebarTokens: sidebarTokensState,
      stagedItems: stagedItemsState,
      collectionMetadata: collectionMetadataState,
      stagedCollection: stagedCollectionState,
      activeSectionId: activeSectionIdState,
    }),
    [
      sidebarTokensState,
      stagedItemsState,
      collectionMetadataState,
      stagedCollectionState,
      activeSectionIdState,
    ]
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
        // TODO handle columns
        const sectionId = generate12DigitId();
        setActiveSectionIdState(sectionId);

        return { ...previous, [sectionId]: { columns: 3, items: tokens } };
      }

      const section = previous[sectionId];
      if (!section) {
        return;
      }
      return { ...previous, [sectionId]: { ...section, items: [...section.items, ...tokens] } };
    });
  }, []);

  const stageTokensNew = useCallback(
    (tokens: StagingItem[]) => {
      addTokensToSection(tokens, activeSectionIdState || '');
    },
    [activeSectionIdState, addTokensToSection]
  );

  const unstageTokensNew = useCallback((ids: string[]) => {
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
  }, []);

  const reorderTokensWithinSection = useCallback((event: DragEndEvent, sectionId: string) => {
    const { active, over } = event;
    setStagedCollectionState((previous) => {
      const section = previous[sectionId];
      const sectionItems = previous[sectionId].items;

      const oldIndex = sectionItems.findIndex(({ id }) => id === active.id);
      const newIndex = sectionItems.findIndex(({ id }) => id === over?.id);
      const updatedSectionItems = arrayMove(sectionItems, oldIndex, newIndex);
      return { ...previous, [sectionId]: { ...section, items: updatedSectionItems } };
    });
  }, []);

  const moveTokenToSection = useCallback(
    (event: DragEndEvent, oldSectionId: string, newSectionId: string) => {
      const { active, over } = event;
      setStagedCollectionState((previous) => {
        // get token from old section
        const oldSection = previous[oldSectionId];
        const oldSectionItems = oldSection.items;
        const token = oldSectionItems.find((token) => token.id === active.id);
        // add token to new section
        const newSection = previous[newSectionId];
        const newSectionItems = newSection.items;
        const newIndex = newSectionItems.findIndex((id) => id === over?.id);
        newSectionItems.splice(newIndex, 0, token);
        // remove token from old section
        const updatedOldSectionItems = oldSectionItems.filter(({ id }) => id !== active.id);

        return {
          ...previous,
          [oldSectionId]: { ...oldSection, items: updatedOldSectionItems },
          [newSectionId]: { ...newSection, items: newSectionItems },
        };
      });
    },
    []
  );

  const reorderSection = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setStagedCollectionState((previous) => {
      // swap
      const previousOrder = Object.keys(previous); // previous order of section ids

      const oldIndex = previousOrder.findIndex((id) => id === active.id);
      const newIndex = previousOrder.findIndex((id) => id === over?.id);
      const newOrder = arrayMove(previousOrder, oldIndex, newIndex);

      const result = newOrder.reduce((acc, sectionId) => {
        return { ...acc, [sectionId]: previous[sectionId] };
        // acc[sectionId] = 'a';
        // return acc;
      }, {});

      return result;
      // return updated.reduce((acc, section) => ({ ...acc, [section.id]: section }), {});
      // return updated;
    });
  }, []);

  const addSection = useCallback(() => {
    setStagedCollectionState((previous) => {
      const newSectionId = generate12DigitId();
      setActiveSectionIdState(newSectionId);
      return {
        ...previous,
        [newSectionId]: { columns: 3, items: [] },
      };
    });
  }, []);

  const incrementColumns = useCallback((sectionId: string) => {
    setStagedCollectionState((previous) => {
      // const next = {...previous}
      // const section = next[sectionId];

      return {
        ...previous,
        [sectionId]: {
          ...previous[sectionId],
          columns: previous[sectionId].columns + 1,
        },
      };
    });
    // setCollectionMetadataState((previous) => {
    //   const newSectionLayout = [...previous.layout.sectionLayout];
    //   newSectionLayout[0].columns++;
    //   return {
    //     ...previous,
    //     layout: {
    //       ...previous.layout,
    //       sectionLayout: {
    //         ...previous.layout.sectionLayout,
    //         columns: previous.layout.sectionLayout[0].columns + 1,
    //       },
    //     },
    //   };
    // });
  }, []);

  const decrementColumns = useCallback((sectionId: string) => {
    setStagedCollectionState((previous) => {
      // const next = {...previous}
      // const section = next[sectionId];

      return {
        ...previous,
        [sectionId]: {
          ...previous[sectionId],
          columns: previous[sectionId].columns - 1,
        },
      };
    });
    // setCollectionMetadataState((previous) => {
    //   const newSectionLayout = [...previous.layout.sectionLayout];
    //   newSectionLayout[0].columns--;
    //   return {
    //     ...previous,
    //     layout: {
    //       ...previous.layout,
    //       sectionLayout: {
    //         ...previous.layout.sectionLayout,
    //         columns: previous.layout.sectionLayout[0].columns + 1,
    //       },
    //     },
    //   };
    // });
  }, []);

  const setColumns = useCallback((columns: number) => {
    setCollectionMetadataState((previous) => {
      const newSectionLayout = [...previous.layout.sectionLayout];
      newSectionLayout[0].columns = columns;

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
      // stageTokens,
      stageTokensNew,
      unstageTokensNew,
      // unstageTokens,
      // handleSortTokens,
      reorderTokensWithinSection,
      moveTokenToSection,
      reorderSection,
      addSection,
      incrementColumns,
      decrementColumns,
      setColumns,
      setTokenLiveDisplay,
      setStagedCollectionState,
      setActiveSectionIdState,
    }),
    [
      setSidebarTokens,
      setTokensIsSelected,
      // stageTokens,
      stageTokensNew,
      unstageTokensNew,
      // unstageTokens,
      // handleSortTokens,
      reorderTokensWithinSection,
      moveTokenToSection,
      reorderSection,
      addSection,
      incrementColumns,
      decrementColumns,
      setColumns,
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
