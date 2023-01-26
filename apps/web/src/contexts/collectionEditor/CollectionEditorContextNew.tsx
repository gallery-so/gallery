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
  StagedSection,
  StagedSectionMap,
  useGalleryEditorContext,
} from '~/components/GalleryEditor/GalleryEditorContext';
import { generate12DigitId } from '~/utils/generate12DigitId';

const deepClone = rfdc();

const DEFAULT_COLUMN_SETTING = 3;

type CollectionEditorContextType = {
  // State
  name: string;
  collectorsNote: string;
  sections: Record<string, StagedSection>;
  activeSectionId: string | null;

  // Derived
  stagedTokenIds: Set<string>;
  liveDisplayTokenIds: Set<string>;

  // Actions
  toggleTokenStaged: (tokenId: string) => void;
  addWhitespace: () => void;

  updateSections: (sections: Record<string, StagedSection>) => void;

  addSection: () => void;
  deleteSection: (sectionId: string) => void;

  incrementColumns: (sectionId: string) => void;
  decrementColumns: (sectionId: string) => void;

  toggleTokenLiveDisplay: (tokenId: string) => void;

  activateSection: (sectionId: string) => void;

  updateNameAndCollectorsNote: (name: string, collectorsNote: string) => void;
};

const CollectionEditorContextNew = createContext<CollectionEditorContextType | undefined>(
  undefined
);

type Props = { children: ReactNode };

export const CollectionEditorProviderNew = memo(({ children }: Props) => {
  const { collectionIdBeingEdited, collections, setCollections } = useGalleryEditorContext();

  const collectionBeingEdited = collectionIdBeingEdited
    ? collections[collectionIdBeingEdited]
    : null;

  const liveDisplayTokenIds = useMemo(() => {
    return collectionBeingEdited?.liveDisplayTokenIds ?? new Set<string>();
  }, [collectionBeingEdited?.liveDisplayTokenIds]);

  const setLiveDisplayTokenIds = useCallback<Dispatch<SetStateAction<Set<string>>>>(
    (value) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      setCollections((previous) => {
        const next = { ...previous };
        const previousLiveDisplayTokenIds = next[collectionIdBeingEdited].liveDisplayTokenIds;

        let nextLiveDisplayTokenIds;
        if (typeof value === 'function') {
          nextLiveDisplayTokenIds = value(previousLiveDisplayTokenIds);
        } else {
          nextLiveDisplayTokenIds = value;
        }

        next[collectionIdBeingEdited] = {
          ...next[collectionIdBeingEdited],
          liveDisplayTokenIds: nextLiveDisplayTokenIds,
        };

        return next;
      });
    },
    [collectionIdBeingEdited, setCollections]
  );

  const sections: StagedSectionMap = useMemo(() => {
    if (!collectionIdBeingEdited) {
      return {};
    }

    return collections[collectionIdBeingEdited]?.sections ?? {};
  }, [collectionIdBeingEdited, collections]);

  const setSections: Dispatch<SetStateAction<StagedSectionMap>> = useCallback(
    (value) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      setCollections((previousCollections) => {
        const nextCollections = { ...previousCollections };
        const previousCollection = previousCollections[collectionIdBeingEdited];
        const previousSections = previousCollection.sections;

        let nextSections;
        if (typeof value === 'function') {
          nextSections = value(previousSections);
        } else {
          nextSections = value;
        }

        nextCollections[collectionIdBeingEdited] = {
          ...previousCollection,
          sections: nextSections,
        };

        return nextCollections;
      });
    },
    [collectionIdBeingEdited, setCollections]
  );

  const setActiveSectionId = useCallback(
    (sectionId: string) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      setCollections((previous) => {
        const next = { ...previous };

        next[collectionIdBeingEdited] = {
          ...next[collectionIdBeingEdited],
          activeSectionId: sectionId,
        };

        return next;
      });
    },
    [collectionIdBeingEdited, setCollections]
  );

  const activeSectionId: string | null = useMemo(() => {
    if (!collectionIdBeingEdited) {
      return null;
    }

    return collections[collectionIdBeingEdited]?.activeSectionId ?? null;
  }, [collectionIdBeingEdited, collections]);

  const updateSections = useCallback(
    (updatedSections: Record<string, StagedSection>) => {
      setSections(updatedSections);
    },
    [setSections]
  );

  const addSection = useCallback(() => {
    const newSectionId = generate12DigitId();

    setSections((previous) => {
      const newSection: StagedSection = {
        columns: DEFAULT_COLUMN_SETTING,
        items: [],
      };

      return {
        ...previous,
        [newSectionId]: newSection,
      };
    });

    setActiveSectionId(newSectionId);
  }, [setActiveSectionId, setSections]);

  const deleteSection = useCallback(
    (sectionId: string) => {
      const sectionTokenIds = sections[sectionId].items
        .filter((item) => item.kind === 'token')
        .map((token) => token.id);

      setLiveDisplayTokenIds((previous) => {
        const cloned = new Set(previous);
        sectionTokenIds.forEach((tokenId) => cloned.delete(tokenId));
        return cloned;
      });

      // Remove the section
      const nextSections = { ...sections };
      delete nextSections[sectionId];
      setSections(nextSections);
      setActiveSectionId(Object.keys(nextSections)[0] ?? null);
    },
    [sections, setActiveSectionId, setLiveDisplayTokenIds, setSections]
  );

  const incrementColumns = useCallback(
    (sectionId: string) => {
      setSections((previous) => {
        return {
          ...previous,
          [sectionId]: {
            ...previous[sectionId],
            columns: previous[sectionId].columns + 1,
          },
        };
      });
    },
    [setSections]
  );

  const decrementColumns = useCallback(
    (sectionId: string) => {
      setSections((previous) => {
        return {
          ...previous,
          [sectionId]: {
            ...previous[sectionId],
            columns: previous[sectionId].columns - 1,
          },
        };
      });
    },
    [setSections]
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

  const addTokenToActiveSection = useCallback(
    (tokenId: string) => {
      if (!activeSectionId) {
        // Maybe make a new section here for them?

        return;
      }

      setSections((previous) => {
        const cloned = deepClone(previous);

        cloned[activeSectionId].items.push({ kind: 'token', id: tokenId });

        return cloned;
      });
    },
    [activeSectionId, setSections]
  );

  const toggleTokenStaged = useCallback(
    (tokenId: string) => {
      if (stagedItemIds.has(tokenId)) {
        removeTokenFromSections(tokenId);
      } else {
        addTokenToActiveSection(tokenId);
      }
    },
    [addTokenToActiveSection, removeTokenFromSections, stagedItemIds]
  );

  const addWhitespace = useCallback(() => {
    if (!activeSectionId) {
      // Maybe create a new section for them automatically

      return;
    }

    const id = generate12DigitId();
    setSections((previous) => {
      const cloned = deepClone(previous);

      cloned[activeSectionId].items.push({ kind: 'whitespace', id });

      return cloned;
    });

    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [activeSectionId, setSections]);

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

      setCollections((previousCollections) => {
        const cloned = { ...previousCollections };

        cloned[collectionIdBeingEdited] = {
          ...cloned[collectionIdBeingEdited],
          name,
          collectorsNote,
        };

        return cloned;
      });
    },
    [collectionIdBeingEdited, setCollections]
  );

  const value = useMemo((): CollectionEditorContextType => {
    return {
      name: collectionBeingEdited?.name ?? '',
      collectorsNote: collectionBeingEdited?.collectorsNote ?? '',
      activateSection,
      activeSectionId,
      addWhitespace,
      addSection,
      updateSections,
      decrementColumns,
      deleteSection,
      incrementColumns,
      liveDisplayTokenIds,
      sections,
      stagedTokenIds,
      toggleTokenLiveDisplay,
      toggleTokenStaged,
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
    sections,
    stagedTokenIds,
    toggleTokenLiveDisplay,
    toggleTokenStaged,
    updateNameAndCollectorsNote,
    updateSections,
  ]);

  return (
    <CollectionEditorContextNew.Provider value={value}>
      {children}
    </CollectionEditorContextNew.Provider>
  );
});

export function useCollectionEditorContextNew() {
  const value = useContext(CollectionEditorContextNew);

  if (!value) {
    throw new Error('Tried to use CollectionEditorContextNew without a provider.');
  }

  return value;
}

CollectionEditorProviderNew.displayName = 'CollectionEditorProvider';
