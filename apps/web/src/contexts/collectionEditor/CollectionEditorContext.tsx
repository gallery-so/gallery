import { arrayMove } from '@dnd-kit/sortable';
import {
  createContext,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import rfdc from 'rfdc';

import {
  StagedCollection,
  StagedItem,
  StagedSection,
  StagedSectionList,
  useGalleryEditorContext,
} from '~/components/GalleryEditor/GalleryEditorContext';
import { generate12DigitId } from '~/shared/utils/generate12DigitId';

const deepClone = rfdc();

const DEFAULT_COLUMN_SETTING = 3;

type CollectionEditorContextType = {
  // State
  name: string;
  collectorsNote: string;
  sections: StagedSectionList;
  activeSectionId: string | null;

  // Derived
  stagedTokenIds: Set<string>;
  liveDisplayTokenIds: Set<string>;
  highDefinitionTokenIds: Set<string>;

  // Actions
  toggleTokenStaged: (tokenId: string) => void;
  addNewTokensToActiveSection: (tokenIds: string[]) => void;
  addWhitespace: () => void;

  updateSections: (sections: StagedSectionList) => void;

  addSection: (sectionId?: string) => void;
  moveSectionDown: (sectionId: string) => void;
  moveSectionUp: (sectionId: string) => void;
  deleteSection: (sectionId: string) => void;

  incrementColumns: (sectionId: string) => void;
  decrementColumns: (sectionId: string) => void;

  toggleTokenLiveDisplay: (tokenId: string) => void;
  toggleTokenHighDefinition: (tokenId: string) => void;

  activateSection: (sectionId: string) => void;

  updateNameAndCollectorsNote: (name: string, collectorsNote: string) => void;
};

const CollectionEditorContext = createContext<CollectionEditorContextType | undefined>(undefined);

type Props = { children: ReactNode };

export const CollectionEditorProvider = memo(({ children }: Props) => {
  const { collectionIdBeingEdited, collections, setCollections } = useGalleryEditorContext();

  const collectionBeingEdited = useMemo(() => {
    return collectionIdBeingEdited
      ? collections.find((collection) => collection.dbid === collectionIdBeingEdited)
      : null;
  }, [collectionIdBeingEdited, collections]);

  const liveDisplayTokenIds = useMemo(() => {
    return collectionBeingEdited?.liveDisplayTokenIds ?? new Set<string>();
  }, [collectionBeingEdited?.liveDisplayTokenIds]);

  const highDefinitionTokenIds = useMemo(() => {
    return collectionBeingEdited?.highDefinitionTokenIds ?? new Set<string>();
  }, [collectionBeingEdited?.highDefinitionTokenIds]);

  const updateCollection = useCallback(
    (collectionId: string, value: SetStateAction<StagedCollection>) => {
      setCollections((previousCollections) => {
        return previousCollections.map((previousCollection) => {
          if (previousCollection.dbid === collectionId) {
            if (typeof value === 'function') {
              return value(previousCollection);
            } else {
              return value;
            }
          }

          return previousCollection;
        });
      });
    },
    [setCollections]
  );

  const updateSection = useCallback(
    (sectionId: string, value: SetStateAction<StagedSection>) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      updateCollection(collectionIdBeingEdited, (previousCollection) => {
        return {
          ...previousCollection,
          sections: previousCollection.sections.map((previousSection) => {
            if (previousSection.id === sectionId) {
              if (typeof value === 'function') {
                return value(previousSection);
              } else {
                return value;
              }
            }

            return previousSection;
          }),
        };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const setLiveDisplayTokenIds = useCallback<Dispatch<SetStateAction<Set<string>>>>(
    (value) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      updateCollection(collectionIdBeingEdited, (previousCollection) => {
        const previousLiveDisplayTokenIds = previousCollection.liveDisplayTokenIds;

        let nextLiveDisplayTokenIds;
        if (typeof value === 'function') {
          nextLiveDisplayTokenIds = value(previousLiveDisplayTokenIds);
        } else {
          nextLiveDisplayTokenIds = value;
        }

        return { ...previousCollection, liveDisplayTokenIds: nextLiveDisplayTokenIds };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const setHighDefinitionTokenIds = useCallback<Dispatch<SetStateAction<Set<string>>>>(
    (value) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      updateCollection(collectionIdBeingEdited, (previousCollection) => {
        const previousHdDisplayTokenIds = previousCollection.highDefinitionTokenIds;

        let nextHdDisplayTokenIds;
        if (typeof value === 'function') {
          nextHdDisplayTokenIds = value(previousHdDisplayTokenIds);
        } else {
          nextHdDisplayTokenIds = value;
        }

        return { ...previousCollection, highDefinitionTokenIds: nextHdDisplayTokenIds };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const sections: StagedSectionList = useMemo(() => {
    return collectionBeingEdited?.sections ?? [];
  }, [collectionBeingEdited?.sections]);

  const setSections: Dispatch<SetStateAction<StagedSectionList>> = useCallback(
    (value) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      updateCollection(collectionIdBeingEdited, (previousCollection) => {
        let nextSections;
        if (typeof value === 'function') {
          nextSections = value(previousCollection.sections);
        } else {
          nextSections = value;
        }

        return {
          ...previousCollection,
          sections: nextSections,
        };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const setActiveSectionId = useCallback(
    (sectionId: string) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      updateCollection(collectionIdBeingEdited, (previousColleciton) => {
        return { ...previousColleciton, activeSectionId: sectionId };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const activeSectionId: string | null = useMemo(() => {
    if (!collectionIdBeingEdited) {
      return null;
    }

    return collectionBeingEdited?.activeSectionId ?? null;
  }, [collectionBeingEdited?.activeSectionId, collectionIdBeingEdited]);

  const updateSections = useCallback(
    (updatedSections: StagedSectionList) => {
      setSections(updatedSections);
    },
    [setSections]
  );

  const addSection = useCallback(
    (sectionId?: string) => {
      const newSectionId = generate12DigitId();
      setSections((previous) => {
        const newSection: StagedSection = {
          id: newSectionId,
          columns: DEFAULT_COLUMN_SETTING,
          items: [],
        };

        // If there is a sectionId, insert the new section after it
        if (sectionId) {
          const index = previous.findIndex((section) => section.id === sectionId);
          if (index !== -1) {
            return [...previous.slice(0, index + 1), newSection, ...previous.slice(index + 1)];
          }
        }

        return [...previous, newSection];
      });

      setActiveSectionId(newSectionId);
    },
    [setActiveSectionId, setSections]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      const sectionTokenIds = sections.flatMap((section) => {
        if (section.id === sectionId) {
          return section.items.filter((item) => item.kind === 'token').map((item) => item.id);
        }

        return [];
      });

      setLiveDisplayTokenIds((previous) => {
        const cloned = new Set(previous);
        sectionTokenIds.forEach((tokenId) => cloned.delete(tokenId));

        return cloned;
      });

      setHighDefinitionTokenIds((previous) => {
        const cloned = new Set(previous);
        sectionTokenIds.forEach((tokenId) => cloned.delete(tokenId));

        return cloned;
      });

      const nextSections = sections.filter((section) => section.id !== sectionId);

      // If this was the last section in the collection, make a new one so its not empty
      let nextActiveSectionId: string | undefined = nextSections[0]?.id;
      if (!nextActiveSectionId) {
        nextActiveSectionId = generate12DigitId();
        nextSections.push({ id: nextActiveSectionId, columns: 3, items: [] });
      }

      setSections(nextSections);
      setActiveSectionId(nextActiveSectionId);
    },
    [sections, setActiveSectionId, setLiveDisplayTokenIds, setHighDefinitionTokenIds, setSections]
  );

  const incrementColumns = useCallback(
    (sectionId: string) => {
      updateSection(sectionId, (previousSection) => {
        return { ...previousSection, columns: previousSection.columns + 1 };
      });
    },
    [updateSection]
  );

  const decrementColumns = useCallback(
    (sectionId: string) => {
      updateSection(sectionId, (previousSection) => {
        return { ...previousSection, columns: previousSection.columns - 1 };
      });
    },
    [updateSection]
  );

  const toggleTokenLiveDisplay = useCallback(
    (tokenId: string) => {
      setLiveDisplayTokenIds((previous) => {
        const cloned = new Set(previous);

        if (cloned.has(tokenId)) {
          cloned.delete(tokenId);
        } else {
          cloned.add(tokenId);
        }

        return cloned;
      });
    },
    [setLiveDisplayTokenIds]
  );

  const toggleTokenHighDefinition = useCallback(
    (tokenId: string) => {
      setHighDefinitionTokenIds((previous) => {
        const cloned = new Set(previous);

        if (cloned.has(tokenId)) {
          cloned.delete(tokenId);
        } else {
          cloned.add(tokenId);
        }

        return cloned;
      });
    },
    [setHighDefinitionTokenIds]
  );

  const stagedItemIds = useMemo(() => {
    const stagedTokenIds = Object.values(sections)
      .flatMap((section) => section.items)
      .map((token) => token.id);

    return new Set(stagedTokenIds);
  }, [sections]);

  const stagedTokenIds = useMemo(() => {
    const stagedTokenIds = Object.values(sections)
      .flatMap((section) => section.items)
      .filter((item) => item.kind === 'token')
      .map((token) => token.id);

    return new Set(stagedTokenIds);
  }, [sections]);

  const removeTokenFromSections = useCallback(
    (tokenId: string) => {
      setSections((previous) => {
        const cloned = deepClone(previous);

        Object.values(cloned).forEach((section) => {
          section.items = section.items.filter((item) => item.id !== tokenId);
        });

        return cloned;
      });
    },
    [setSections]
  );

  // calling this directly is dangerous. you may add a token that's already in the section.
  // use `addNewTokensToActiveSection` or `toggleTokenStaged` instead.
  const _addTokensToActiveSection = useCallback(
    (tokenIdOrIds: string | string[]) => {
      if (!activeSectionId) {
        // Maybe make a new section here for them?
        return;
      }

      let tokensToAdd: StagedItem[] = [];
      if (typeof tokenIdOrIds === 'string') {
        tokensToAdd = [{ kind: 'token', id: tokenIdOrIds }];
      } else {
        tokensToAdd = tokenIdOrIds.map((tokenId) => ({ kind: 'token', id: tokenId }));
      }

      updateSection(activeSectionId, (previousSection) => {
        return {
          ...previousSection,
          items: [...previousSection.items, ...tokensToAdd],
        };
      });
    },
    [activeSectionId, updateSection]
  );

  // stages tokens within a section, and ensures the tokens haven't already been staged
  const addNewTokensToActiveSection = useCallback(
    (tokenIds: string[]) => {
      const tokenIdsToStage = tokenIds.filter((tokenId) => !stagedItemIds.has(tokenId));
      _addTokensToActiveSection(tokenIdsToStage);
    },
    [_addTokensToActiveSection, stagedItemIds]
  );

  const toggleTokenStaged = useCallback(
    (tokenId: string) => {
      if (stagedItemIds.has(tokenId)) {
        removeTokenFromSections(tokenId);
      } else {
        _addTokensToActiveSection(tokenId);
      }
    },
    [_addTokensToActiveSection, removeTokenFromSections, stagedItemIds]
  );

  const addWhitespace = useCallback(() => {
    if (!activeSectionId) {
      // Maybe create a new section for them automatically
      return;
    }

    const id = generate12DigitId();
    updateSection(activeSectionId, (previousSection) => {
      return { ...previousSection, items: [...previousSection.items, { kind: 'whitespace', id }] };
    });

    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [activeSectionId, updateSection]);

  const activateSection = useCallback(
    (sectionId: string) => {
      setActiveSectionId(sectionId);
    },
    [setActiveSectionId]
  );

  const updateNameAndCollectorsNote = useCallback(
    (name: string, collectorsNote: string) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      updateCollection(collectionIdBeingEdited, (previousColleciton) => {
        return { ...previousColleciton, name, collectorsNote };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const moveSectionUp = useCallback(
    (sectionId: string) => {
      setSections((previousSections) => {
        const currentIndex = previousSections.findIndex((section) => section.id === sectionId);

        return arrayMove(previousSections, currentIndex, currentIndex - 1);
      });
    },
    [setSections]
  );

  const moveSectionDown = useCallback(
    (sectionId: string) => {
      setSections((previousSections) => {
        const currentIndex = previousSections.findIndex((section) => section.id === sectionId);

        return arrayMove(previousSections, currentIndex, currentIndex + 1);
      });
    },
    [setSections]
  );

  const value = useMemo((): CollectionEditorContextType => {
    return {
      name: collectionBeingEdited?.name ?? '',
      collectorsNote: collectionBeingEdited?.collectorsNote ?? '',
      moveSectionDown,
      moveSectionUp,
      activateSection,
      activeSectionId,
      addWhitespace,
      addSection,
      updateSections,
      decrementColumns,
      deleteSection,
      incrementColumns,
      liveDisplayTokenIds,
      highDefinitionTokenIds,
      sections,
      stagedTokenIds,
      toggleTokenLiveDisplay,
      toggleTokenHighDefinition,
      toggleTokenStaged,
      addNewTokensToActiveSection,
      updateNameAndCollectorsNote,
    };
  }, [
    activateSection,
    activeSectionId,
    addSection,
    addWhitespace,
    collectionBeingEdited?.collectorsNote,
    collectionBeingEdited?.name,
    decrementColumns,
    deleteSection,
    incrementColumns,
    liveDisplayTokenIds,
    highDefinitionTokenIds,
    moveSectionDown,
    moveSectionUp,
    sections,
    stagedTokenIds,
    toggleTokenLiveDisplay,
    toggleTokenHighDefinition,
    toggleTokenStaged,
    addNewTokensToActiveSection,
    updateNameAndCollectorsNote,
    updateSections,
  ]);

  return (
    <CollectionEditorContext.Provider value={value}>{children}</CollectionEditorContext.Provider>
  );
});

export function useCollectionEditorContext() {
  const value = useContext(CollectionEditorContext);

  if (!value) {
    throw new Error('Tried to use CollectionEditorContextNew without a provider.');
  }

  return value;
}

CollectionEditorProvider.displayName = 'CollectionEditorProvider';
